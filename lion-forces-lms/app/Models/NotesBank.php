<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['subject_id', 'title', 'content', 'file_path', 'created_by'])]
class NotesBank extends Model
{
    use HasFactory;

    protected $table = 'notes_bank';

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Courses this note is shared into as "Guaranteed Notes".
    public function courses(): BelongsToMany
    {
        return $this->belongsToMany(Course::class, 'course_notes', 'note_id', 'course_id')
            ->withPivot('order')
            ->withTimestamps();
    }

    // Direct assignments to specific students or packages (two-tier notes,
    // tier 2 — the private/guaranteed layer).
    public function assignments(): HasMany
    {
        return $this->hasMany(NoteAssignment::class, 'note_id');
    }
}
