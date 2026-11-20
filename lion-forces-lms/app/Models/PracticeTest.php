<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

#[Fillable([
    'course_id', 'title', 'timer_enabled', 'duration_minutes',
    'question_selection_mode', 'subject_id', 'auto_question_count',
    'shuffle_questions', 'marks_per_question', 'negative_marking',
    'is_repeatable', 'is_active',
])]
class PracticeTest extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'timer_enabled' => 'boolean',
            'shuffle_questions' => 'boolean',
            'is_repeatable' => 'boolean',
            'is_active' => 'boolean',
            'marks_per_question' => 'decimal:2',
            'negative_marking' => 'decimal:2',
        ];
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    // Manually-picked questions. When question_selection_mode is 'auto',
    // the question set is resolved at attempt time from `subject` +
    // `auto_question_count` instead of this pivot.
    public function questions(): BelongsToMany
    {
        return $this->belongsToMany(QuestionBank::class, 'practice_test_questions', 'practice_test_id', 'question_id')
            ->withPivot('order')
            ->withTimestamps();
    }

    public function attempts(): MorphMany
    {
        return $this->morphMany(TestAttempt::class, 'attemptable');
    }
}
