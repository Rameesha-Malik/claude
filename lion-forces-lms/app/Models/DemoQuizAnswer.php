<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['demo_quiz_attempt_id', 'question_id', 'selected_option_id', 'is_correct', 'order'])]
class DemoQuizAnswer extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return ['is_correct' => 'boolean'];
    }

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(DemoQuizAttempt::class, 'demo_quiz_attempt_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(QuestionBank::class, 'question_id');
    }

    public function selectedOption(): BelongsTo
    {
        return $this->belongsTo(QuestionOption::class, 'selected_option_id');
    }
}
