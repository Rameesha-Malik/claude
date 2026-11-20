<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

#[Fillable(['note_id', 'assignable_type', 'assignable_id'])]
class NoteAssignment extends Model
{
    use HasFactory;

    public function note(): BelongsTo
    {
        return $this->belongsTo(NotesBank::class, 'note_id');
    }

    // Resolves to either a User (specific student) or a CoursePackage
    // (every student on that package) — the two targeting modes described
    // in the blueprint for "Personal / Guaranteed Notes".
    public function assignable(): MorphTo
    {
        return $this->morphTo();
    }
}
