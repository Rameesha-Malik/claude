<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Client (WhatsApp), explicit correction of an earlier judgment call:
     * "Demo Quizzes >>> Category >>> like Army, navy airforce >>> each
     * category have its own demos like army >>> lcc >>> pma etc." An
     * earlier pass grouped demo quizzes by Subject (English/Math/Current
     * Affairs) -- that's a real relationship (which subject the questions
     * come from) but not the grouping the client means here. "LCC" / "PMA"
     * / "Navy" / "Air Force" are the exact names already sitting in
     * course_categories (the same categories Courses are grouped under
     * everywhere else in the app) -- reusing that instead of inventing a
     * parallel "demo quiz category" concept. subject_id stays as-is (still
     * a real, separate fact about the quiz); this is additive.
     */
    public function up(): void
    {
        Schema::table('demo_quizzes', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->after('subject_id')->constrained('course_categories')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('demo_quizzes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('category_id');
        });
    }
};
