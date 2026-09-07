<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['staged_test_id', 'stage_group_id', 'name', 'order', 'duration_minutes', 'pass_threshold_percent', 'marks_per_question', 'negative_marking'])]
class StagedTestStage extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'pass_threshold_percent' => 'decimal:2',
            'marks_per_question' => 'decimal:2',
            'negative_marking' => 'decimal:2',
        ];
    }

    public function stagedTest(): BelongsTo
    {
        return $this->belongsTo(StagedTest::class);
    }

    // Null unless this stage was merged into a "stage group" -- see
    // StagedTestStageGroup's own comment.
    public function stageGroup(): BelongsTo
    {
        return $this->belongsTo(StagedTestStageGroup::class, 'stage_group_id');
    }

    public function questions(): BelongsToMany
    {
        return $this->belongsToMany(QuestionBank::class, 'staged_test_stage_questions', 'stage_id', 'question_id')
            ->withPivot('order')
            ->withTimestamps();
    }

    public function attemptResults(): HasMany
    {
        return $this->hasMany(StagedTestAttemptStage::class, 'stage_id');
    }
}
