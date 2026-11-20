<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * "Merge stages (stage groups)" (Full Test config reference screenshot):
 * a student attempts every stage in the group in order without being
 * gated stage-by-stage, then the group's combined score across all its
 * stages must meet pass_threshold_percent to proceed -- see
 * Admin\StagedTestController's comment and
 * Student\StagedTestController::submitStage for the pass logic this
 * drives.
 */
#[Fillable(['staged_test_id', 'name', 'order', 'pass_threshold_percent'])]
class StagedTestStageGroup extends Model
{
    protected function casts(): array
    {
        return ['pass_threshold_percent' => 'decimal:2'];
    }

    public function stagedTest(): BelongsTo
    {
        return $this->belongsTo(StagedTest::class);
    }

    public function stages(): HasMany
    {
        return $this->hasMany(StagedTestStage::class, 'stage_group_id')->orderBy('order');
    }
}
