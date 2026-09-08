<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'subject_id', 'category_id', 'question_text', 'image_path',
    'explanation', 'difficulty', 'created_by',
])]
class QuestionBank extends Model
{
    use HasFactory;

    protected $table = 'question_bank';

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(CourseCategory::class, 'category_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function options(): HasMany
    {
        return $this->hasMany(QuestionOption::class, 'question_id')->orderBy('order');
    }

    public function correctOption(): HasMany
    {
        return $this->hasMany(QuestionOption::class, 'question_id')->where('is_correct', true);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(QuestionReport::class, 'question_id');
    }

    public function savedBy(): HasMany
    {
        return $this->hasMany(SavedQuestion::class, 'question_id');
    }
}
