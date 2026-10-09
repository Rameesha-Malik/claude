<?php

namespace App\Support;

use App\Models\Setting;

/**
 * "Feature toggles" (Settings > Features reference screenshot): global
 * on/off switches for student-facing features, on top of the per-course
 * overrides that already existed (Course::flashcards_enabled/tests_enabled
 * etc, set on each course's edit page). A course's own checkbox only takes
 * effect when the matching global flag here is also on -- this is the
 * "master switch", the course fields stay the fine-grained per-course
 * layer.
 *
 * `custom_quiz` gates Student\CustomQuizController (see that class for the
 * enrollment-based access rule layered on top of this master switch).
 */
class FeatureFlags
{
    private const DEFAULTS = [
        'flashcards' => true,
        'custom_quiz' => true,
        'full_test' => true,
        'notes' => true,
    ];

    public static function enabled(string $feature): bool
    {
        return (bool) Setting::get("feature_{$feature}", self::DEFAULTS[$feature] ?? true);
    }

    public static function all(): array
    {
        return collect(self::DEFAULTS)->keys()->mapWithKeys(fn ($k) => [$k => self::enabled($k)])->all();
    }
}
