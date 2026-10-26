<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['mock_exam_id', 'name', 'order', 'duration_minutes', 'marks_per_question', 'negative_marking'])]
class MockExamSection extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return ['marks_per_question' => 'decimal:2', 'negative_marking' => 'decimal:2'];
    }

    public function mockExam(): BelongsTo
    {
        return $this->belongsTo(MockExam::class);
    }

    public function questions(): BelongsToMany
    {
        return $this->belongsToMany(QuestionBank::class, 'mock_exam_section_questions', 'section_id', 'question_id')
            ->withPivot('order')
            ->withTimestamps();
    }

    public function attemptResults(): HasMany
    {
        return $this->hasMany(MockExamAttemptSection::class, 'section_id');
    }
}
