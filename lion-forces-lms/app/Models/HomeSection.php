<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['section_key', 'title', 'content', 'order', 'is_enabled'])]
class HomeSection extends Model
{
    protected function casts(): array
    {
        return ['content' => 'array', 'is_enabled' => 'boolean'];
    }
}
