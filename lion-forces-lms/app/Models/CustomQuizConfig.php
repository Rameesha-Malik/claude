<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

#[Fillable([
    'user_id', 'name', 'subject_ids', 'topic_ids', 'course_id', 'difficulty', 'question_count', 'question_ids',
    'mode', 'timer_enabled', 'filter',
])]
class CustomQuizConfig extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return ['question_ids' => 'array', 'subject_ids' => 'array', 'topic_ids' => 'array', 'timer_enabled' => 'boolean'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // subject_ids/topic_ids are frozen JSON lists (same reasoning as
    // question_ids below), not a pivot table -- a handful of ids picked
    // once at creation and never queried from the Subject/Topic side, so
    // these are plain lookups, not Eloquent relations.
    public function subjects()
    {
        return Subject::whereIn('id', $this->subject_ids ?? [])->get();
    }

    public function topics()
    {
        return Topic::whereIn('id', $this->topic_ids ?? [])->get();
    }

    // "Anatomy, Behavioral Science +2" -- same overflow pattern UWorld's
    // own Tests list uses for a config with several subjects/topics
    // picked, rather than a long comma-separated line. Shared by the
    // student and admin Custom Quiz controllers rather than duplicated.
    public static function summarizeNames(array $names, int $max = 2): ?string
    {
        if (count($names) === 0) {
            return null;
        }
        if (count($names) <= $max) {
            return implode(', ', $names);
        }

        return implode(', ', array_slice($names, 0, $max)).' +'.(count($names) - $max);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    // Same morphMany pattern Quiz::attempts() already uses -- lets admin
    // see each config's result (score/percentage) without a new table.
    public function attempts(): MorphMany
    {
        return $this->morphMany(TestAttempt::class, 'attemptable');
    }

    // The actual questions, in the frozen order they were picked --
    // QuestionBank has no direct relation back to this table (question_ids
    // is just a JSON list), so this re-fetches by id and re-sorts to match.
    public function questions()
    {
        $ids = $this->question_ids;

        return QuestionBank::with('options')->whereIn('id', $ids)->get()
            ->sortBy(fn ($q) => array_search($q->id, $ids))
            ->values();
    }
}
