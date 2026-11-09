<?php

namespace App\Jobs;

use App\Models\Lesson;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;
use Throwable;

/**
 * Client requirement: an admin pastes a YouTube (usually unlisted) link and
 * that's it -- the student must never see, click, or inspect their way to
 * anything that reveals YouTube is the source. No client-side overlay can
 * guarantee that (the iframe's real src, and the raw link itself, are
 * always sitting in the page's own HTML/JSON for anyone who opens DevTools
 * or View Source). The only actual guarantee is for the student to never
 * be served a YouTube reference at all -- so this downloads the video once,
 * server-side, into this app's own storage, and from then on the lesson
 * streams exactly like a directly-uploaded one (see CourseLearning.tsx's
 * LessonPlayer: once video_import_status is 'ready', file_path is used
 * instead of external_url, and external_url is never sent to students in
 * the first place -- see Student/CourseController's lesson sanitizing).
 *
 * Requires yt-dlp and ffmpeg available on whatever machine runs the queue
 * worker (config('services.youtube_import'), defaults to both on PATH) --
 * this is an external system dependency, not something this job can
 * self-install. If either is missing, or if the environment's PHP has
 * proc_open()/exec() disabled, this job fails cleanly and the reason lands
 * in the lesson's video_import_error, instead of just silently stalling.
 */
class ImportYoutubeLessonVideo implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 1800;

    public int $tries = 1;

    public function __construct(public int $lessonId) {}

    public function handle(): void
    {
        $lesson = Lesson::find($this->lessonId);

        // Lesson deleted, or switched to a different type/link, before this
        // job got a turn -- nothing to do.
        if (! $lesson || $lesson->type !== 'video_youtube' || ! $lesson->external_url) {
            return;
        }

        $lesson->update(['video_import_status' => 'processing', 'video_import_error' => null]);

        $tmpDir = storage_path('app/tmp/youtube-import');
        File::ensureDirectoryExists($tmpDir);
        $basename = $lesson->id.'-'.Str::random(8);
        $outputTemplate = $tmpDir.'/'.$basename.'.%(ext)s';

        $process = new Process([
            config('services.youtube_import.yt_dlp_binary'),
            '-f', 'bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/best',
            '--merge-output-format', 'mp4',
            '--ffmpeg-location', config('services.youtube_import.ffmpeg_binary'),
            '--no-playlist',
            '--max-filesize', '500M',
            '--no-progress',
            '-o', $outputTemplate,
            '--', $lesson->external_url,
        ]);
        $process->setTimeout($this->timeout);

        try {
            $process->mustRun();
        } catch (ProcessFailedException $e) {
            $this->fail($lesson, $this->describeFailure($e));

            return;
        } catch (Throwable $e) {
            // proc_open()/exec() disabled, binary not found, etc. -- these
            // throw before a Process result even exists, so they need
            // their own message rather than mustRun()'s own exception.
            $this->fail($lesson, "Couldn't run yt-dlp/ffmpeg on this server: {$e->getMessage()}");

            return;
        }

        $matches = glob($tmpDir.'/'.$basename.'.*') ?: [];
        $downloaded = $matches[0] ?? null;

        if (! $downloaded || ! File::exists($downloaded)) {
            $this->fail($lesson, 'yt-dlp finished without error but produced no file.');

            return;
        }

        $storedPath = 'lessons/'.basename($downloaded);
        Storage::disk('public')->put($storedPath, File::get($downloaded));
        File::delete($downloaded);

        $previousFile = $lesson->file_path;

        $lesson->update([
            'file_path' => $storedPath,
            'video_import_status' => 'ready',
            'video_import_error' => null,
        ]);

        // Only delete the old file after the new one is confirmed saved on
        // the lesson -- never leave a lesson with neither if something
        // between the two update() calls above had failed instead.
        if ($previousFile && $previousFile !== $storedPath) {
            Storage::disk('public')->delete($previousFile);
        }
    }

    public function failed(Throwable $e): void
    {
        $lesson = Lesson::find($this->lessonId);
        if ($lesson && $lesson->video_import_status !== 'ready') {
            $this->fail($lesson, $e->getMessage());
        }
    }

    private function fail(Lesson $lesson, string $message): void
    {
        $lesson->update(['video_import_status' => 'failed', 'video_import_error' => Str::limit($message, 2000)]);
    }

    private function describeFailure(ProcessFailedException $e): string
    {
        $stderr = trim($e->getProcess()->getErrorOutput());

        return $stderr !== '' ? $stderr : $e->getMessage();
    }
}
