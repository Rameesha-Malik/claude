<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

#[Fillable(['key', 'value', 'type'])]
class Setting extends Model
{
    /**
     * Read a setting by key, with a fallback. Cached indefinitely and
     * invalidated on save() below — settings change rarely but are read on
     * almost every page, so this keeps the site-content-management layer
     * from adding a query per key per request.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        return Cache::rememberForever("setting:{$key}", function () use ($key, $default) {
            $row = static::where('key', $key)->first();

            if (! $row) {
                return $default;
            }

            return match ($row->type) {
                'boolean' => (bool) $row->value,
                'json' => json_decode($row->value, true),
                default => $row->value,
            };
        });
    }

    public static function set(string $key, mixed $value, string $type = 'string'): void
    {
        static::updateOrCreate(
            ['key' => $key],
            ['value' => $type === 'json' ? json_encode($value) : $value, 'type' => $type],
        );

        Cache::forget("setting:{$key}");
    }
}
