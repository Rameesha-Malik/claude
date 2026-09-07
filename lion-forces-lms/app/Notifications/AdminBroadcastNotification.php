<?php

namespace App\Notifications;

use App\Models\NotificationBroadcast;
use Illuminate\Notifications\Notification;

/**
 * Database-only for now (blueprint: in-app delivery). Email/SMS channels
 * can be added to via() later without touching the admin composer or the
 * student-facing list -- both just read from the notifications table.
 */
class AdminBroadcastNotification extends Notification
{
    public function __construct(public NotificationBroadcast $broadcast) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'broadcast_id' => $this->broadcast->id,
            'title' => $this->broadcast->title,
            'body' => $this->broadcast->body,
        ];
    }
}
