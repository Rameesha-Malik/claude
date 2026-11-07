<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['title', 'body', 'target_type', 'target_course_id', 'target_package_id', 'sent_by', 'recipient_count', 'sent_at'])]
class NotificationBroadcast extends Model
{
    protected function casts(): array
    {
        return ['sent_at' => 'datetime'];
    }

    public function targetCourse(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'target_course_id');
    }

    public function targetPackage(): BelongsTo
    {
        return $this->belongsTo(CoursePackage::class, 'target_package_id');
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sent_by');
    }
}
