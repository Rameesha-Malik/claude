<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

#[Fillable(['course_id', 'title', 'target_exam_name', 'is_active'])]
class StagedTest extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function stages(): HasMany
    {
        return $this->hasMany(StagedTestStage::class)->orderBy('order');
    }

    public function attempts(): MorphMany
    {
        return $this->morphMany(TestAttempt::class, 'attemptable');
    }
}
