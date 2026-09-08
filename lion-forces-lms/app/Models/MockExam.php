<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

#[Fillable([
    'course_id', 'title', 'target_exam_name', 'total_duration_minutes',
    'attempt_limit', 'fullscreen_required', 'disallow_back_navigation',
    'available_from', 'available_until', 'is_active',
])]
class MockExam extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'fullscreen_required' => 'boolean',
            'disallow_back_navigation' => 'boolean',
            'available_from' => 'datetime',
            'available_until' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function sections(): HasMany
    {
        return $this->hasMany(MockExamSection::class)->orderBy('order');
    }

    public function attempts(): MorphMany
    {
        return $this->morphMany(TestAttempt::class, 'attemptable');
    }

    public function isCurrentlyAvailable(): bool
    {
        $now = now();

        return (! $this->available_from || $now->gte($this->available_from))
            && (! $this->available_until || $now->lte($this->available_until));
    }
}
