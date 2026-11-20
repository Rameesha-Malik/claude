<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['attempt_id', 'stage_id', 'score', 'total_marks', 'passed', 'completed_at'])]
class StagedTestAttemptStage extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return ['score' => 'decimal:2', 'total_marks' => 'decimal:2', 'passed' => 'boolean', 'completed_at' => 'datetime'];
    }

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(TestAttempt::class, 'attempt_id');
    }

    public function stage(): BelongsTo
    {
        return $this->belongsTo(StagedTestStage::class, 'stage_id');
    }
}
