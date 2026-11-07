<?php

use App\Models\CoursePackage;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Client: "remove all package just add one these [FSc set]" -- every
     * other package (the per-course "Standard"/"Guaranteed Package" seed
     * content, and the Graduate-track pair added alongside the FSc set
     * last time) gets hidden from the public pricing pages, leaving only
     * the three FSc "Initial Test Preparation 2026" packages.
     *
     * Deactivating rather than deleting: is_active=false already hides a
     * package everywhere it's queried (How to Buy, course detail sidebar),
     * and existing enrollments/payments still reference package_id, so
     * hard-deleting risks either a foreign key failure or silently
     * orphaning historical purchase records. Reversible if this was a
     * misread of what "remove" meant.
     */
    public function up(): void
    {
        $keep = [
            'FSc — Notes + App Access',
            'FSc — Crash Course Classes',
            'FSc — Full Online Classes',
        ];

        CoursePackage::whereNotIn('name', $keep)->update(['is_active' => false]);
        CoursePackage::whereIn('name', $keep)->update(['is_active' => true]);
    }

    public function down(): void
    {
        CoursePackage::query()->update(['is_active' => true]);
    }
};
