<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

#[Fillable([
    'course_id', 'section_id', 'title', 'question_selection_mode', 'subject_id', 'auto_question_count',
    'shuffle_questions', 'marks_per_question', 'negative_marking', 'is_repeatable', 'is_active', 'order',
])]
class Quiz extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
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

    // The Topic this quiz shows under in the Curriculum panel / student
    // Course Content sidebar, if the admin assigned one -- optional,
    // separate from the Quizzes tab where every quiz is always listed
    // regardless.
    public function section(): BelongsTo
    {
        return $this->belongsTo(CourseSection::class, 'section_id');
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function questions(): BelongsToMany
    {
        return $this->belongsToMany(QuestionBank::class, 'quiz_questions', 'quiz_id', 'question_id')
            ->withPivot('order')
            ->withTimestamps();
    }

    public function attempts(): MorphMany
    {
        return $this->morphMany(TestAttempt::class, 'attemptable');
    }
}
