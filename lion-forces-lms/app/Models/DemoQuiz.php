<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['title', 'subject_id', 'duration_minutes', 'shuffle_questions', 'is_active'])]
class DemoQuiz extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return ['shuffle_questions' => 'boolean', 'is_active' => 'boolean'];
    }

    // The "category" a demo quiz is grouped under on the public page --
    // reuses Subject rather than a parallel category concept.
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
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
