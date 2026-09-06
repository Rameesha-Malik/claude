<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['subject_id', 'title', 'content', 'file_path', 'price', 'is_published', 'created_by'])]
class NotesBank extends Model
{
    use HasFactory;

    protected $table = 'notes_bank';

    protected function casts(): array
    {
        return ['price' => 'decimal:2', 'is_published' => 'boolean'];
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function purchases(): HasMany
    {
        return $this->hasMany(NotePurchase::class, 'note_id');
    }

    // Free unless a price is explicitly set -- avoids a separate "access"
    // column that could drift out of sync with price.
    public function isPaid(): bool
    {
        return (float) ($this->price ?? 0) > 0;
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
