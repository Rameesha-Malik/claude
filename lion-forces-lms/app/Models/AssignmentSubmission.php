<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'assignment_id', 'user_id', 'file_path', 'submission_text', 'status',
    'marks_awarded', 'feedback', 'graded_by', 'graded_at', 'submitted_at',
])]
class AssignmentSubmission extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return ['graded_at' => 'datetime', 'submitted_at' => 'datetime'];
    }

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function grader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'graded_by');
    }
}
