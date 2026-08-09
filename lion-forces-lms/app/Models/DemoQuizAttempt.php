<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['demo_quiz_id', 'guest_token', 'score', 'total_marks', 'started_at', 'submitted_at'])]
class DemoQuizAttempt extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'score' => 'decimal:2',
            'total_marks' => 'decimal:2',
            'started_at' => 'datetime',
            'submitted_at' => 'datetime',
        ];
    }

    public function demoQuiz(): BelongsTo
    {
        return $this->belongsTo(DemoQuiz::class);
    }
}
