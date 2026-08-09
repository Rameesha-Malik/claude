<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
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
    'is_active', 'notification_preferences', 'target_exam_name', 'target_exam_date',
])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable;

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
}
