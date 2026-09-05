<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'action', 'subject_type', 'subject_id', 'description', 'course_id'])]
class ActivityLog extends Model
{
    const UPDATED_AT = null;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * One call site for every content-management controller to record an
     * entry -- e.g. ActivityLog::record('added', 'MCQ', $question->id,
     * 'MCQ added.', $courseId). $courseId is nullable since the Content
     * Library's question/notes bank isn't tied to one course.
     */
    public static function record(string $action, string $subjectType, ?int $subjectId, string $description, ?int $courseId = null): void
    {
        static::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'subject_type' => $subjectType,
            'subject_id' => $subjectId,
            'description' => $description,
            'course_id' => $courseId,
        ]);
    }
}
