<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['name', 'photo_path', 'achievement_text', 'course_id', 'order', 'is_active'])]
class HallOfFame extends Model
{
    protected $table = 'hall_of_fame';

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }
}
