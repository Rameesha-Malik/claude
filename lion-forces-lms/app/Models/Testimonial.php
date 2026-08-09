<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['course_id', 'student_name', 'photo_path', 'testimonial_text', 'rating', 'is_featured', 'order'])]
class Testimonial extends Model
{
    protected function casts(): array
    {
        return ['is_featured' => 'boolean'];
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }
}
