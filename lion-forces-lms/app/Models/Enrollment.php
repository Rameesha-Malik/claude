<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['user_id', 'course_id', 'package_id', 'bundle_purchase_id', 'status', 'activated_at', 'expires_at'])]
class Enrollment extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return ['activated_at' => 'datetime', 'expires_at' => 'datetime'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(CoursePackage::class, 'package_id');
    }

    public function bundlePurchase(): BelongsTo
    {
        return $this->belongsTo(BundlePurchase::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active'
            && (! $this->expires_at || $this->expires_at->isFuture());
    }
}
