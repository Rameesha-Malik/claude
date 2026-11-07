<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'email', 'phone', 'subject', 'message', 'is_handled'])]
class ContactSubmission extends Model
{
    protected function casts(): array
    {
        return ['is_handled' => 'boolean'];
    }
}
