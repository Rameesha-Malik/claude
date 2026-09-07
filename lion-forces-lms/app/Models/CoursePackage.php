<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

#[Fillable(['course_id', 'name', 'description', 'price', 'validity_days', 'order', 'is_active'])]
class CoursePackage extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'price' => 'decimal:2'];
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class, 'package_id');
    }

    // Personal/Guaranteed notes assigned to every student on this package
    // (e.g. "LCC Guaranteed Notes"). Polymorphic other side of NoteAssignment.
    public function noteAssignments(): MorphMany
    {
        return $this->morphMany(NoteAssignment::class, 'assignable');
    }
}
