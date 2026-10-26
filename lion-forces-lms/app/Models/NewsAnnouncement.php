<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['title', 'description', 'organization', 'image_path', 'category_id', 'deadline_date', 'application_link', 'is_pinned', 'is_active'])]
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

    // Auto-off after deadline: a query condition, not a stored flag, so
    // nothing has to run a cron job just to "close" an announcement on
    // time. Was duplicated inline in both PublicSiteController::home()
    // and ::news() -- one scope now, used by both.
    public function scopeVisible(\Illuminate\Database\Eloquent\Builder $query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('is_active', true)
            ->where(fn ($q) => $q->whereNull('deadline_date')->orWhere('deadline_date', '>=', now()));
    }
}
