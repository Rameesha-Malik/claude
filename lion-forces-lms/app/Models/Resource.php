<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['title', 'category', 'description', 'file_path', 'external_link', 'downloads_count', 'is_published'])]
class Resource extends Model
{
    protected $table = 'resources';

    protected function casts(): array
    {
        return ['is_published' => 'boolean'];
    }
}
