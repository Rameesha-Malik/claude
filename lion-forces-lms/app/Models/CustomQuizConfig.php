<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'subject_id', 'difficulty', 'question_count', 'question_ids'])]
class CustomQuizConfig extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return ['question_ids' => 'array'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    // The actual questions, in the frozen order they were picked --
    // QuestionBank has no direct relation back to this table (question_ids
    // is just a JSON list), so this re-fetches by id and re-sorts to match.
    public function questions()
    {
        $ids = $this->question_ids;

        return QuestionBank::with('options')->whereIn('id', $ids)->get()
            ->sortBy(fn ($q) => array_search($q->id, $ids))
            ->values();
    }
}
