<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'slug'])]
class Subject extends Model
{
    use HasFactory;

    public function questions(): HasMany
    {
        return $this->hasMany(QuestionBank::class, 'subject_id');
    }

    public function notes(): HasMany
    {
        return $this->hasMany(NotesBank::class, 'subject_id');
    }
}
