<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Lets the admin upload a real crest/logo per hero slide (Army/Navy/Air
 * Force), instead of the bundled crest image being the only option.
 * Null falls back to that bundled crest, same pattern as image_path.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hero_slides', function (Blueprint $table) {
            $table->string('crest_path')->nullable()->after('image_path');
        });
    }

    public function down(): void
    {
        Schema::table('hero_slides', function (Blueprint $table) {
            $table->dropColumn('crest_path');
        });
    }
};
