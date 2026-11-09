<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['attempt_id', 'section_id', 'score', 'total_marks'])]
class MockExamAttemptSection extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return ['score' => 'decimal:2', 'total_marks' => 'decimal:2'];
    }

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(TestAttempt::class, 'attempt_id');
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(MockExamSection::class, 'section_id');
    }
}
