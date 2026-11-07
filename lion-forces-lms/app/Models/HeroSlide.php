<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['branch_key', 'branch', 'title', 'motto', 'motto_translation', 'description', 'cta_href', 'image_path', 'crest_path', 'order'])]
class HeroSlide extends Model
{
    //
}
