<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'course_id', 'source_note_id', 'source_lesson_id', 'front_text',
    'back_text', 'is_auto_generated', 'status', 'reviewed_by', 'reviewed_at',
])]
class Flashcard extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return ['is_auto_generated' => 'boolean', 'reviewed_at' => 'datetime'];
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function sourceNote(): BelongsTo
    {
        return $this->belongsTo(NotesBank::class, 'source_note_id');
    }

    public function sourceLesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class, 'source_lesson_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }
}
