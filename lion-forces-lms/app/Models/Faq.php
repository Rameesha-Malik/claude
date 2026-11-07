<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['page', 'note_id', 'question', 'answer', 'order', 'is_active'])]
class Faq extends Model
{
    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    // Note-scoped FAQs (Guaranteed Notes detail pages) instead of the
    // usual site-`page` scope -- see the migration that added this column.
    public function note(): BelongsTo
    {
        return $this->belongsTo(NotesBank::class, 'note_id');
    }
}
