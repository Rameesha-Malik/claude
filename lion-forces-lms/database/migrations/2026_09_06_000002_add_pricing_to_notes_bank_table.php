<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * "Guaranteed Notes" as its own sellable product line -- previously
     * every notes_bank row was either free-to-browse (public Notes page)
     * or gated behind a course/package (course_notes / note_assignments).
     * Nothing let an admin sell a specific note directly with its own
     * price. price=null (or 0) still means "free"; no separate "access"
     * column needed, it's derived from price.
     */
    public function up(): void
    {
        Schema::table('notes_bank', function (Blueprint $table) {
            $table->decimal('price', 10, 2)->nullable()->after('file_path');
            $table->boolean('is_published')->default(true)->after('price');
        });
    }

    public function down(): void
    {
        Schema::table('notes_bank', function (Blueprint $table) {
            $table->dropColumn(['price', 'is_published']);
        });
    }
};
