<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

#[Fillable(['user_id', 'status', 'score', 'total_marks', 'percentage', 'passed', 'started_at', 'submitted_at'])]
class TestAttempt extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'score' => 'decimal:2',
            'total_marks' => 'decimal:2',
            'percentage' => 'decimal:2',
            'passed' => 'boolean',
            'started_at' => 'datetime',
            'submitted_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Resolves to PracticeTest, MockExam, or StagedTest.
    public function attemptable(): MorphTo
    {
        return $this->morphTo();
    }

    public function answers(): HasMany
    {
        return $this->hasMany(TestAttemptAnswer::class, 'attempt_id');
    }

    public function stageResults(): HasMany
    {
        return $this->hasMany(StagedTestAttemptStage::class, 'attempt_id');
    }

    public function sectionResults(): HasMany
    {
        return $this->hasMany(MockExamAttemptSection::class, 'attempt_id');
    }
}
