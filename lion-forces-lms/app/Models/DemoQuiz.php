<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['title', 'subject_id', 'category_id', 'duration_minutes', 'shuffle_questions', 'is_active'])]
class DemoQuiz extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return ['shuffle_questions' => 'boolean', 'is_active' => 'boolean'];
    }

    // Which subject the questions are drawn from (English, Math, ...) --
    // separate from category() below, which is what the public page
    // actually groups quizzes under.
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    // The exam-track category (LCC, PMA, Navy, Air Force, ...) a demo quiz
    // is grouped under on the public Demo Quiz page -- same
    // CourseCategory every Course is already grouped under.
    public function category(): BelongsTo
    {
        return $this->belongsTo(CourseCategory::class, 'category_id');
    }

    public function questions(): BelongsToMany
    {
        return $this->belongsToMany(QuestionBank::class, 'demo_quiz_questions', 'demo_quiz_id', 'question_id')
            ->withPivot('order')
            ->withTimestamps();
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(DemoQuizAttempt::class);
    }
}
