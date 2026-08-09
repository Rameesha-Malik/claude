<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['message', 'link_url', 'is_active', 'expires_at'])]
class AnnouncementBar extends Model
{
    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'expires_at' => 'datetime'];
    }

    public function isCurrentlyVisible(): bool
    {
        return $this->is_active && (! $this->expires_at || $this->expires_at->isFuture());
    }
}
