<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Course;
use App\Models\QuestionBank;
use App\Models\Subject;
use App\Models\Topic;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class QuestionBankController extends Controller
{
    public function index(Request $request): Response
    {
        // Same scoping CourseController::index() already applies to the
        // Courses list itself -- a content manager only ever sees/edits
        // the question bank for courses they're assigned to.
        $isContentManager = $request->user()->hasRole('content_manager');
        $managedCourseIds = $isContentManager ? $request->user()->managedCourses()->pluck('courses.id') : null;

        return Inertia::render('Admin/QuestionBank/Index', [
            'questions' => QuestionBank::with(['subject', 'topic', 'course:id,title', 'options'])
                ->when($request->subject_id, fn ($q, $s) => $q->where('subject_id', $s))
                ->when($isContentManager, fn ($q) => $q->whereIn('course_id', $managedCourseIds))
                ->latest()
                ->paginate(10, ['*'], 'questions_page')
                ->withQueryString(),
            'subjects' => Subject::orderBy('name')->get(),
            // Required on every question going forward (see this
            // migration's own comment) -- Custom Quiz only shows a
            // student the subset of the bank tagged to the course whose
            // quiz module they actually bought.
            'courses' => Course::orderBy('title')->when($isContentManager, fn ($q) => $q->whereIn('id', $managedCourseIds))->get(['id', 'title']),
            // All topics, each carrying its subject_id -- the frontend
            // filters this client-side to whichever subject is picked in
            // the question form, same as it already does with Subjects
            // for the question list filter.
            'topics' => Topic::orderBy('name')->get(['id', 'subject_id', 'name']),
            'filters' => $request->only(['subject_id']),
            // Only present right after a bulk-upload redirect -- pull() so
            // it doesn't linger in the session past this one page load.
            'bulkUploadResult' => session()->pull('bulkUploadResult'),
        ]);
    }

    public function storeSubject(Request $request)
    {
        $data = $request->validate(['name' => 'required|string|max:100|unique:subjects,name']);
        Subject::create(['name' => $data['name'], 'slug' => Str::slug($data['name'])]);

        return back()->with('success', 'Subject added.');
    }

    public function storeTopic(Request $request)
    {
        $data = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'name' => 'required|string|max:100',
        ]);
        Topic::create($data);

        return back()->with('success', 'Topic added.');
    }

    // --- Question Bank ---
    public function storeQuestion(Request $request)
    {
        $data = $this->validateQuestion($request);
        abort_unless($request->user()->canManageCourse(Course::findOrFail($data['course_id'])), 403);
        $this->assertOptionsHaveContent($data['options']);

        $question = QuestionBank::create([
            ...collect($data)->except(['options', 'image'])->toArray(),
            'image_path' => $request->hasFile('image') ? $request->file('image')->store('question-bank', 'public') : null,
            'created_by' => $request->user()->id,
        ]);

        foreach ($data['options'] as $i => $option) {
            $question->options()->create($this->optionAttributes($request, $i, $option));
        }

        ActivityLog::record('added', 'MCQ', $question->id, 'MCQ added.');

        return back()->with('success', 'Question added to the bank.');
    }

    // Client: "no need to change or upload each mcq one by one" -- the
    // single-question form above was the only way in, fine for a handful
    // of questions but not for "a bank of 200". CSV columns: Subject,
    // Topic, Difficulty, Question, Option A, Option B, Option C,
    // Option D, Correct Answer (A/B/C/D), Explanation. Subject/Topic are
    // matched by name (case-insensitive) or created on the fly, same as
    // typing a new one into the single-question form's dropdowns would
    // require doing by hand first -- this does it inline per row instead.
    // Images aren't part of a CSV row -- those questions get added as
    // plain text, same as today, and an admin can attach an image to one
    // afterwards via Edit.
    public function bulkUploadQuestions(Request $request)
    {
        $data = $request->validate([
            'csv' => 'required|file|mimes:csv,txt|max:2048',
            'course_id' => 'required|exists:courses,id',
        ]);
        abort_unless($request->user()->canManageCourse(Course::findOrFail($data['course_id'])), 403);

        $handle = fopen($request->file('csv')->getRealPath(), 'r');
        $header = fgetcsv($handle);
        $rowNumber = 1;
        $added = 0;
        $errors = [];

        while (($row = fgetcsv($handle)) !== false) {
            $rowNumber++;
            if (count(array_filter($row, fn ($v) => trim((string) $v) !== '')) === 0) {
                continue; // skip fully blank rows (trailing newline etc.)
            }

            [$subjectName, $topicName, $difficulty, $questionText, $optA, $optB, $optC, $optD, $correct, $explanation] = array_pad($row, 10, null);

            $subjectName = trim((string) $subjectName);
            $questionText = trim((string) $questionText);
            $options = [trim((string) $optA), trim((string) $optB), trim((string) $optC), trim((string) $optD)];
            $correct = strtoupper(trim((string) $correct));
            $difficulty = strtolower(trim((string) $difficulty)) ?: 'medium';

            if ($subjectName === '' || $questionText === '' || in_array('', $options, true)) {
                $errors[] = "Row {$rowNumber}: missing Subject, Question, or one of the four options.";

                continue;
            }
            if (! in_array($difficulty, ['easy', 'medium', 'hard'], true)) {
                $errors[] = "Row {$rowNumber}: Difficulty must be easy, medium, or hard (got \"{$difficulty}\").";

                continue;
            }
            $correctIndex = array_search($correct, ['A', 'B', 'C', 'D'], true);
            if ($correctIndex === false) {
                $errors[] = "Row {$rowNumber}: Correct Answer must be A, B, C, or D (got \"{$correct}\").";

                continue;
            }

            $subject = Subject::firstOrCreate(['slug' => Str::slug($subjectName)], ['name' => $subjectName]);
            $topic = null;
            $topicName = trim((string) $topicName);
            if ($topicName !== '') {
                $topic = Topic::firstOrCreate(['subject_id' => $subject->id, 'name' => $topicName]);
            }

            $question = QuestionBank::create([
                'subject_id' => $subject->id,
                'topic_id' => $topic?->id,
                'course_id' => $data['course_id'],
                'question_text' => $questionText,
                'explanation' => trim((string) $explanation) ?: null,
                'difficulty' => $difficulty,
                'created_by' => $request->user()->id,
            ]);

            foreach ($options as $i => $optionText) {
                $question->options()->create([
                    'option_text' => $optionText,
                    'is_correct' => $i === $correctIndex,
                    'order' => $i + 1,
                ]);
            }

            $added++;
        }
        fclose($handle);

        if ($added > 0) {
            ActivityLog::record('added', 'MCQ', null, "{$added} MCQs bulk-uploaded.");
        }

        return back()->with('bulkUploadResult', ['added' => $added, 'errors' => $errors]);
    }

    public function updateQuestion(Request $request, QuestionBank $question)
    {
        // Untagged legacy question, no course to check against -- a
        // content manager can't touch it (nothing proves it's theirs);
        // owner/staff are unaffected either way.
        abort_if($request->user()->hasRole('content_manager') && ! $question->course_id, 403);
        if ($question->course) {
            abort_unless($request->user()->canManageCourse($question->course), 403);
        }

        $data = $this->validateQuestion($request);
        // Also check the course they're re-tagging it to, if different --
        // stops a content manager moving someone else's question into one
        // of their own courses to gain edit rights over it.
        abort_unless($request->user()->canManageCourse(Course::findOrFail($data['course_id'])), 403);
        $this->assertOptionsHaveContent($data['options']);

        $update = collect($data)->except(['options', 'image'])->toArray();
        if ($request->hasFile('image')) {
            if ($question->image_path) {
                Storage::disk('public')->delete($question->image_path);
            }
            $update['image_path'] = $request->file('image')->store('question-bank', 'public');
        }
        $question->update($update);

        $question->options()->delete();
        foreach ($data['options'] as $i => $option) {
            $question->options()->create($this->optionAttributes($request, $i, $option));
        }

        ActivityLog::record('edited', 'MCQ', $question->id, 'MCQ updated.');

        return back()->with('success', 'Question updated. Change reflects in every course using it.');
    }

    public function destroyQuestion(Request $request, QuestionBank $question)
    {
        abort_if($request->user()->hasRole('content_manager') && ! $question->course_id, 403);
        if ($question->course) {
            abort_unless($request->user()->canManageCourse($question->course), 403);
        }

        $question->delete();

        return back()->with('success', 'Question removed from the bank.');
    }

    // Shared by storeQuestion/updateQuestion. image.*.* fields are files
    // and validated separately per index below since Laravel's nested file
    // input names (options[0][image]) don't validate well with a plain
    // array rule alongside the other option fields.
    private function validateQuestion(Request $request): array
    {
        return $request->validate([
            'subject_id' => 'nullable|exists:subjects,id',
            'topic_id' => 'nullable|exists:topics,id',
            'course_id' => 'required|exists:courses,id',
            'question_text' => 'required|string|max:2000',
            'explanation' => 'nullable|string|max:2000',
            'difficulty' => 'required|in:easy,medium,hard',
            'image' => 'nullable|image|max:4096',
            'options' => 'required|array|min:2',
            'options.*.id' => 'nullable|exists:question_options,id',
            'options.*.option_text' => 'nullable|string|max:500',
            'options.*.existing_image_path' => 'nullable|string',
            'options.*.is_correct' => 'boolean',
            'options.*.image' => 'nullable|image|max:4096',
        ]);
    }

    // A picture-only option (no text) is fine -- but an option with
    // neither text nor any image (newly uploaded or carried over from
    // before) isn't a usable answer choice at all.
    private function assertOptionsHaveContent(array $options): void
    {
        foreach ($options as $i => $option) {
            $hasText = trim((string) ($option['option_text'] ?? '')) !== '';
            $hasImage = ! empty($option['existing_image_path']) || ! empty($option['image']);
            if (! $hasText && ! $hasImage) {
                throw ValidationException::withMessages(['options' => 'Each option needs either text or an image.']);
            }
        }
    }

    private function optionAttributes(Request $request, int $i, array $option): array
    {
        return [
            'option_text' => $option['option_text'] ?? null,
            'image_path' => $request->hasFile("options.{$i}.image")
                ? $request->file("options.{$i}.image")->store('question-bank/options', 'public')
                : ($option['existing_image_path'] ?? null),
            'is_correct' => $option['is_correct'] ?? false,
            'order' => $i + 1,
        ];
    }
}
