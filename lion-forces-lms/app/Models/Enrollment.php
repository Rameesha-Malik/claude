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

    // Query-builder equivalent of isActive() -- for the authorizeEnrollment()
    // checks gating practice tests/quizzes/mock exams/staged tests, which
    // query the database directly rather than loading a model to call
    // isActive() on. Kept in one place so "active" means the same thing
    // everywhere access is granted.
    public function scopeActive($query)
    {
        return $query->where('status', 'active')
            ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()));
    }

    // Marks this enrollment active and computes its real expiry date from
    // the chosen package's validity_days -- every place that grants access
    // (manual payment verification, bundle purchase verification, an admin
    // enrolling a student directly) should go through this rather than
    // setting `status: 'active'` by hand, which previously left expires_at
    // permanently null: the "180 days access" shown on pricing cards was
    // never actually being enforced anywhere.
    //
    // When the package itself has no validity_days, falls back to the
    // global "Courses expire after (days)" setting (Settings > Courses)
    // instead of leaving access unlimited by default.
    public function activate(): void
    {
        $wasAlreadyActive = $this->status === 'active';
        $activatedAt = $this->activated_at ?? now();
        $validityDays = $this->package?->validity_days ?? \App\Models\Setting::get('course_expiry_days');

        $this->update([
            'status' => 'active',
            'activated_at' => $activatedAt,
            'expires_at' => $validityDays ? $activatedAt->copy()->addDays((int) $validityDays) : null,
        ]);

        if (! $wasAlreadyActive && \App\Support\NotificationSettings::enabled('new_enrollment')) {
            \App\Models\User::notifyAdmins(
                'New enrollment activated',
                "{$this->user?->name} was enrolled in \"{$this->course?->title}\".",
                '/admin/enrollments',
            );
        }
    }
}
