<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['title', 'description', 'organization', 'category_id', 'deadline_date', 'application_link', 'is_pinned', 'is_active'])]
class NewsAnnouncement extends Model
{
    protected function casts(): array
    {
        return ['deadline_date' => 'date', 'is_pinned' => 'boolean', 'is_active' => 'boolean'];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(CourseCategory::class, 'category_id');
    }

    // Auto-off after deadline: computed, not a stored flag, so nothing has
    // to run a cron job just to "close" an announcement on time.
    public function isOpen(): bool
    {
        return $this->is_active && (! $this->deadline_date || $this->deadline_date->isFuture());
    }
}
