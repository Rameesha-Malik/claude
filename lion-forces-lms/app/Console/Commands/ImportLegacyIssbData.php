<?php

namespace App\Console\Commands;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Instructor;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

// One-off migration from the client's old standalone Laravel backend
// (database `u221950411_issbacademy`, app at issbacademypak.com) into this
// system. Reads a cleaned JSON file (built outside the app, never committed
// to the repo since it carries real customer PII) rather than touching the
// legacy database directly. Safe to re-run: every write below is keyed on a
// natural unique field (email, slug, user+course pair), so running this
// twice updates existing rows instead of duplicating them.
class ImportLegacyIssbData extends Command
{
    protected $signature = 'legacy:import-issb {path : Path to the cleaned issb_legacy_import.json file}';

    protected $description = 'Import courses, users, and purchase history from the old ISSB Academy backend';

    public function handle(): int
    {
        $path = $this->argument('path');
        if (! is_file($path)) {
            $this->error("File not found: {$path}");

            return self::FAILURE;
        }

        $data = json_decode(file_get_contents($path), true);
        $this->info('Importing '.count($data['courses']).' courses, '.count($data['users']).' users, '.count($data['purchases']).' purchases...');

        $courseIdByLegacyId = $this->importCourses($data['courses']);
        $userIdByLegacyId = $this->importUsers($data['users']);
        [$enrolled, $skipped] = $this->importPurchases($data['purchases'], $courseIdByLegacyId, $userIdByLegacyId);

        $this->newLine();
        $this->info('Done.');
        $this->line("Courses: {$courseIdByLegacyId->count()} imported (category left unset -- assign manually in Admin > Courses).");
        $this->line("Users: {$userIdByLegacyId->count()} imported (existing passwords carried over as-is).");
        $this->line("Purchases: {$enrolled} applied as enrollments/payments, {$skipped} skipped (already covered by the cleaned data file).");

        return self::SUCCESS;
    }

    private function importCourses(array $courses): \Illuminate\Support\Collection
    {
        $map = collect();
        $this->output->progressStart(count($courses));

        foreach ($courses as $c) {
            $instructorId = null;
            if (! empty($c['author'])) {
                $instructorId = Instructor::firstOrCreate(
                    ['name' => $c['author']],
                    ['is_active' => true, 'order' => 0],
                )->id;
            }

            $plain = trim(preg_replace('/\s+/', ' ', strip_tags($c['description'] ?? '')));
            $shortDescription = $plain === '' ? null : (mb_strlen($plain) > 160 ? mb_substr($plain, 0, 157).'...' : $plain);

            // Keyed on title rather than a freshly-generated slug -- the
            // slug's own uniqueness check (below) would otherwise treat a
            // second run's slug as "already taken" (by the row this same
            // import created last time) and mint a new incremented slug
            // each run, creating a duplicate course instead of updating it.
            $existing = Course::where('title', $c['title'])->first();
            $slug = $existing?->slug ?? $this->uniqueSlug($c['title']);

            $course = Course::updateOrCreate(
                ['title' => $c['title']],
                [
                    'slug' => $slug,
                    'title' => $c['title'],
                    'description' => $c['description'],
                    'short_description' => $shortDescription,
                    'instructor_id' => $instructorId,
                    'base_price' => $c['price'],
                    'status' => 'published',
                    'quizzes_enabled' => true,
                    'flashcards_enabled' => true,
                    'tests_enabled' => true,
                    'assignments_enabled' => true,
                ],
            );
            // Legacy timestamps are informational history, not subject to
            // the fillable guard -- forceFill is the standard Eloquent way
            // to set them without widening the model's real mass-assignment
            // surface for every other write in the app.
            $course->forceFill(['created_at' => $c['created_at'], 'updated_at' => $c['updated_at']])->save();

            $map->put($c['legacy_id'], $course->id);
            $this->output->progressAdvance();
        }

        $this->output->progressFinish();

        return $map;
    }

    private function importUsers(array $users): \Illuminate\Support\Collection
    {
        $map = collect();
        $this->output->progressStart(count($users));

        foreach ($users as $u) {
            // firstOrNew + forceFill (one save) rather than updateOrCreate --
            // `password` isn't in User's mass-assignable list, so passing it
            // alongside the other fields would've been silently dropped
            // from the INSERT, and the column has no DB-level default to
            // fall back on.
            $user = User::firstOrNew(['email' => $u['email']]);
            $user->forceFill([
                'name' => $u['name'],
                'phone' => $u['phone'],
                'user_type' => 'student',
                'is_active' => ! $u['is_blocked'],
                'email_verified_at' => $u['email_verified_at'],
                // Legacy hashes are bcrypt ($2y$...), same algorithm this
                // app's 'hashed' cast expects -- Laravel detects an
                // already-hashed value and stores it unchanged, so existing
                // passwords keep working without a reset.
                'password' => $u['password_hash'],
                'created_at' => $u['created_at'],
                'updated_at' => $u['updated_at'],
            ])->save();

            $map->put($u['legacy_id'], $user->id);
            $this->output->progressAdvance();
        }

        $this->output->progressFinish();

        return $map;
    }

    private function importPurchases(array $purchases, \Illuminate\Support\Collection $courseMap, \Illuminate\Support\Collection $userMap): array
    {
        $enrolled = 0;
        $skipped = 0;
        $this->output->progressStart(count($purchases));

        foreach ($purchases as $p) {
            $courseId = $courseMap->get($p['legacy_course_id']);
            $userId = $userMap->get($p['legacy_user_id']);
            if (! $courseId || ! $userId) {
                $skipped++;
                $this->output->progressAdvance();

                continue;
            }

            // Legacy status codes: 1 observed as the overwhelming majority
            // (treated as a completed/approved purchase); 0/2/3 are rarer
            // and their exact meaning wasn't documented in the old system,
            // so they're left pending here and the raw code is kept on the
            // payment record for manual review in Admin > Payments.
            $isApproved = $p['status_code'] === '1';

            $enrollment = Enrollment::updateOrCreate(
                ['user_id' => $userId, 'course_id' => $courseId],
                [
                    'modules' => Enrollment::ALL_MODULES,
                    'status' => $isApproved ? 'active' : 'pending',
                    'activated_at' => $isApproved ? $p['updated_at'] : null,
                ],
            );

            Payment::create([
                'enrollment_id' => $enrollment->id,
                'amount' => $p['amount'],
                'method' => 'other',
                'status' => $isApproved ? 'verified' : 'pending',
                'reference_number' => $p['trx_id'],
                'notes' => 'Migrated from legacy ISSB Academy backend (legacy status code: '.$p['status_code'].').',
            ])->forceFill(['created_at' => $p['created_at'], 'updated_at' => $p['updated_at']])->save();

            $enrolled++;
            $this->output->progressAdvance();
        }

        $this->output->progressFinish();

        return [$enrolled, $skipped];
    }

    private function uniqueSlug(string $title): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $i = 1;
        while (Course::where('slug', $slug)->exists()) {
            $slug = "{$base}-".++$i;
        }

        return $slug;
    }
}
