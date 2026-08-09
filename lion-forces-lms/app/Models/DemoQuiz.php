<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['title', 'duration_minutes', 'shuffle_questions', 'is_active'])]
class DemoQuiz extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return ['shuffle_questions' => 'boolean', 'is_active' => 'boolean'];
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
