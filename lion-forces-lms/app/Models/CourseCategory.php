<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'slug', 'icon', 'description', 'order', 'is_active'])]
class CourseCategory extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function courses(): HasMany
    {
        return $this->hasMany(Course::class, 'category_id');
    }

    public function eligibilityRules(): HasMany
    {
        return $this->hasMany(EligibilityRule::class, 'category_id');
    }

    public function fitnessStandards(): HasMany
    {
        return $this->hasMany(FitnessStandard::class, 'category_id');
    }

    public function newsAnnouncements(): HasMany
    {
        return $this->hasMany(NewsAnnouncement::class, 'category_id');
    }
}
