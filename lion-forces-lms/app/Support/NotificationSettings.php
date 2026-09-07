<?php

namespace App\Support;

use App\Models\Setting;

/**
 * "Trigger in-app and email notifications when..." (Settings > Notifications
 * reference screenshot). Wraps the existing Setting key/value store so every
 * User::notifyAdmins() call site can check "is this event type turned on"
 * with one line, instead of each site reading its own Setting::get key.
 *
 * new_enrollment/new_review/new_lecture_question/course_qa_question/
 * question_reported/payment_received default ON (matches the reference
 * screenshot's checked boxes); quiz_submitted defaults OFF (unchecked
 * there, and explicitly called out as "can be high volume").
 */
class NotificationSettings
{
    private const DEFAULTS = [
        'new_enrollment' => true,
        'new_review' => true,
        'new_lecture_question' => true,
        'course_qa_question' => true,
        'question_reported' => true,
        'payment_received' => true,
        'quiz_submitted' => false,
    ];

    public static function enabled(string $event): bool
    {
        return (bool) Setting::get("notify_{$event}", self::DEFAULTS[$event] ?? true);
    }

    public static function adminEmail(): ?string
    {
        return Setting::get('notify_admin_email');
    }

    public static function defaults(): array
    {
        return self::DEFAULTS;
    }
}
