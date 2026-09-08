<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['report_type', 'period_start', 'period_end', 'data', 'generated_at'])]
class ReportSnapshot extends Model
{
    protected function casts(): array
    {
        return ['period_start' => 'date', 'period_end' => 'date', 'data' => 'array', 'generated_at' => 'datetime'];
    }
}
