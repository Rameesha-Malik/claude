<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Auto-off after deadline (§2.6) — computed from deadline_date at
        // read time, no cron needed to "expire" it; expired items simply
        // stop appearing in the public query and remain in an admin-only
        // archive view (same table, just filtered).
        Schema::create('news_announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('organization')->nullable(); // Army/Navy/PAF/ISSB/LCC badge
            $table->foreignId('category_id')->nullable()->constrained('course_categories')->nullOnDelete();
            $table->date('deadline_date')->nullable();
            $table->string('application_link')->nullable();
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['is_active', 'deadline_date']);
        });

        Schema::create('resources', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('category')->nullable();
            $table->text('description')->nullable();
            $table->string('file_path')->nullable();
            $table->string('external_link')->nullable();
            $table->unsignedInteger('downloads_count')->default(0);
            $table->boolean('is_published')->default(true);
            $table->timestamps();
        });

        Schema::create('hall_of_fame', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('photo_path')->nullable();
            $table->text('achievement_text');
            $table->foreignId('course_id')->nullable()->constrained('courses')->nullOnDelete();
            $table->unsignedInteger('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Backs the Eligibility Calculator (§2.10): enter age/height/
        // education, see which categories qualify.
        Schema::create('eligibility_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('course_categories')->cascadeOnDelete();
            $table->enum('gender', ['male', 'female', 'any'])->default('any');
            $table->unsignedTinyInteger('min_age')->nullable();
            $table->unsignedTinyInteger('max_age')->nullable();
            $table->unsignedSmallInteger('min_height_cm')->nullable();
            $table->string('education_requirement')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Physical Fitness Standards page (§2.10): 1.6km run, push-ups,
        // sit-ups, chin-ups, height/weight, per service and gender.
        Schema::create('fitness_standards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('course_categories')->cascadeOnDelete();
            $table->enum('gender', ['male', 'female', 'any'])->default('any');
            $table->string('test_name'); // e.g. "1.6 km Run", "Push-ups"
            $table->string('standard_value'); // free text: "under 8 minutes", "min 15 reps"
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();
        });

        Schema::create('contact_submissions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('subject')->nullable();
            $table->text('message');
            $table->boolean('is_handled')->default(false);
            $table->timestamps();

            $table->index('is_handled');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_submissions');
        Schema::dropIfExists('fitness_standards');
        Schema::dropIfExists('eligibility_rules');
        Schema::dropIfExists('hall_of_fame');
        Schema::dropIfExists('resources');
        Schema::dropIfExists('news_announcements');
    }
};
