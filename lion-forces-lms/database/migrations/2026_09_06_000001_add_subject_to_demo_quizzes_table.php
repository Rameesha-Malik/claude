<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * "Assign a category to show them under category cards on the public
     * Demo Quiz page" -- reusing the existing Subject model as that
     * category rather than inventing a parallel "demo quiz category"
     * concept, since Subjects (English, Math, Current Affairs, ...) are
     * already exactly that and already admin-managed under Content
     * Library. Nullable: a demo quiz with no subject just isn't grouped
     * under a category card.
     */
    public function up(): void
    {
        Schema::table('demo_quizzes', function (Blueprint $table) {
            $table->foreignId('subject_id')->nullable()->after('title')->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('demo_quizzes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('subject_id');
        });
    }
};
