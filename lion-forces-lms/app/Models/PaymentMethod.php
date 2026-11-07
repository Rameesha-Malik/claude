<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['icon', 'name', 'description', 'order'])]
class PaymentMethod extends Model
{
    //
}
