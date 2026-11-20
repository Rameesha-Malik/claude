<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

/**
 * Generic "something happened, go look at it" alert for admin/owner/staff
 * accounts -- new pending payment, new contact inquiry, etc. Database-only,
 * same convention as AdminBroadcastNotification (which is the reverse
 * direction: admin -> students). Content managers never receive these --
 * see notifyAdmins() in the controllers that dispatch this, since every
 * link_url here points at a page RestrictContentManagers already blocks
 * them from.
 */
class AdminAlertNotification extends Notification
{
    public function __construct(
        public string $title,
        public string $message,
        public string $linkUrl,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => $this->title,
            'message' => $this->message,
            'link_url' => $this->linkUrl,
        ];
    }
}
