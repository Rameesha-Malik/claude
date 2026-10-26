<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Client: some MCQs show a picture for an answer option instead of text
 * (e.g. "which of these four insignia is correct") -- question_bank
 * already has its own image_path for a question-level image, but each
 * option only ever had option_text. Nullable and additive: an option can
 * still be plain text as before, or now carry an image instead.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('question_options', function (Blueprint $table) {
            $table->string('image_path')->nullable()->after('option_text');
        });
    }

    public function down(): void
    {
        Schema::table('question_options', function (Blueprint $table) {
            $table->dropColumn('image_path');
        });
    }
};
