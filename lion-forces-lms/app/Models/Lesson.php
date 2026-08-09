<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'course_id', 'title', 'type', 'file_path', 'external_url',
    'description', 'order', 'is_free_preview',
])]
class Lesson extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return ['is_free_preview' => 'boolean'];
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function progress(): HasMany
    {
        return $this->hasMany(LessonProgress::class);
    }

    public function flashcards(): HasMany
    {
        return $this->hasMany(Flashcard::class, 'source_lesson_id');
    }

    public function questions(): HasMany
    {
        return $this->hasMany(CourseQuestion::class);
    }
}
