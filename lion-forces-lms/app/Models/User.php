<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Auth\MustVerifyEmail as MustVerifyEmailTrait;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

#[Fillable([
    'user_type', 'name', 'email', 'password', 'phone', 'avatar_path',
    'is_active', 'suspended_at', 'notification_preferences', 'target_exam_name', 'target_exam_date',
    'email_verified_at', 'father_name', 'cnic', 'education', 'address',
])]
#[Hidden(['password', 'remember_token'])]
// Implements the verification contract now that Settings > Security >
// "Require email verification on registration" can actually enforce it
// (CheckEmailVerified middleware) -- previously this was commented out,
// which silently made Laravel's 'verified' middleware a no-op everywhere
// it was already listed on a route group.
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, MustVerifyEmailTrait, Notifiable;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'suspended_at' => 'datetime',
            'notification_preferences' => 'array',
            'target_exam_date' => 'date',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->user_type === 'admin';
    }

    public function isStudent(): bool
    {
        return $this->user_type === 'student';
    }

    // Fires an AdminAlertNotification (new pending payment, new contact
    // inquiry, ...) to every admin account except content managers --
    // every alert's link_url points at a page RestrictContentManagers
    // already blocks them from, so they'd just 403 on the click-through.
    public static function notifyAdmins(string $title, string $message, string $linkUrl): void
    {
        $recipients = static::where('user_type', 'admin')->get()->reject(fn (self $u) => $u->hasRole('content_manager'));

        \Illuminate\Support\Facades\Notification::send($recipients, new \App\Notifications\AdminAlertNotification($title, $message, $linkUrl));
    }

    // Courses a "content manager" account is scoped to -- irrelevant for
    // every other role (owner/staff have no such restriction).
    public function managedCourses(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Course::class, 'content_manager_courses');
    }

    // Content managers can only edit lessons/sections/packages on courses
    // they're explicitly assigned to; every other admin role always passes.
    public function canManageCourse(Course $course): bool
    {
        return ! $this->hasRole('content_manager') || $this->managedCourses()->where('courses.id', $course->id)->exists();
    }

    // --- Admin side ---

    public function instructorProfile(): HasOne
    {
        return $this->hasOne(Instructor::class);
    }

    public function verifiedPayments(): HasMany
    {
        return $this->hasMany(Payment::class, 'verified_by');
    }

    public function courseQuestionReplies(): HasMany
    {
        return $this->hasMany(CourseQuestionReply::class, 'admin_id');
    }

    public function sentBroadcasts(): HasMany
    {
        return $this->hasMany(NotificationBroadcast::class, 'sent_by');
    }

    // --- Student side ---

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function lessonProgress(): HasMany
    {
        return $this->hasMany(LessonProgress::class);
    }

    public function testAttempts(): HasMany
    {
        return $this->hasMany(TestAttempt::class);
    }

    public function revisionListItems(): HasMany
    {
        return $this->hasMany(RevisionListItem::class);
    }

    public function savedQuestions(): HasMany
    {
        return $this->hasMany(SavedQuestion::class);
    }

    public function courseReviews(): HasMany
    {
        return $this->hasMany(CourseReview::class);
    }

    public function courseQuestions(): HasMany
    {
        return $this->hasMany(CourseQuestion::class);
    }

    public function loginLogs(): HasMany
    {
        return $this->hasMany(LoginLog::class);
    }
}
