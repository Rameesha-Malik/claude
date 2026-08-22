<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'category_id', 'instructor_id', 'title', 'slug', 'thumbnail_path',
    'short_description', 'description', 'syllabus', 'level', 'hours',
    'base_price', 'status', 'quizzes_enabled', 'flashcards_enabled',
    'tests_enabled', 'target_exam_name', 'target_exam_date', 'order',
])]
class Course extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'quizzes_enabled' => 'boolean',
            'flashcards_enabled' => 'boolean',
            'tests_enabled' => 'boolean',
            'target_exam_date' => 'date',
            'base_price' => 'decimal:2',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(CourseCategory::class, 'category_id');
    }

    public function instructor(): BelongsTo
    {
        return $this->belongsTo(Instructor::class);
    }

    public function packages(): HasMany
    {
        return $this->hasMany(CoursePackage::class);
    }

    public function lessons(): HasMany
    {
        return $this->hasMany(Lesson::class)->orderBy('order');
    }

    public function sections(): HasMany
    {
        return $this->hasMany(CourseSection::class)->orderBy('order');
    }

    // Shared "Guaranteed Notes" tab — Notes Bank items assigned to every
    // enrolled student of this course.
    public function sharedNotes(): BelongsToMany
    {
        return $this->belongsToMany(NotesBank::class, 'course_notes', 'course_id', 'note_id')
            ->withPivot('order')
            ->withTimestamps();
    }

    public function flashcards(): HasMany
    {
        return $this->hasMany(Flashcard::class);
    }

    public function quizzes(): HasMany
    {
        return $this->hasMany(Quiz::class)->orderBy('order');
    }

    public function practiceTests(): HasMany
    {
        return $this->hasMany(PracticeTest::class);
    }

    public function mockExams(): HasMany
    {
        return $this->hasMany(MockExam::class);
    }

    public function stagedTests(): HasMany
    {
        return $this->hasMany(StagedTest::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(CourseReview::class);
    }

    public function approvedReviews(): HasMany
    {
        return $this->reviews()->where('status', 'approved');
    }

    public function questions(): HasMany
    {
        return $this->hasMany(CourseQuestion::class);
    }

    public function testimonials(): HasMany
    {
        return $this->hasMany(Testimonial::class);
    }

    public function hallOfFameEntries(): HasMany
    {
        return $this->hasMany(HallOfFame::class);
    }

    public function isPublished(): bool
    {
        return $this->status === 'published';
    }
}
