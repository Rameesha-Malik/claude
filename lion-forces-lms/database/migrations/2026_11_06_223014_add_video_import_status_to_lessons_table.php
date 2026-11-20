<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            // null for every lesson type except video_youtube -- those
            // never go through the import pipeline, so there's nothing to
            // track. For video_youtube: pending (just saved, job not run
            // yet) -> processing (job downloading) -> ready (file_path now
            // holds a self-hosted copy, safe to stream) -> failed.
            $table->enum('video_import_status', ['pending', 'processing', 'ready', 'failed'])->nullable()->after('external_url');
            $table->text('video_import_error')->nullable()->after('video_import_status');
        });
    }

    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->dropColumn(['video_import_status', 'video_import_error']);
        });
    }
};
