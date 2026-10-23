<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Course categories = the real service list from the SRS:
        // LCC, PMA, ISSB, AFNS, Navy, Air Force, ASF, Police.
        Schema::create('course_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('icon')->nullable();
            $table->text('description')->nullable();
            $table->unsignedInteger('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Subjects tag Question Bank + Notes Bank items (English, Current
        // Affairs, IQ, ...) — this is what makes one item reusable across
        // every course/exam that needs it.
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();
        });

        Schema::create('instructors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('photo_path')->nullable();
            $table->string('qualification')->nullable();
            $table->string('experience')->nullable();
            $table->text('bio')->nullable();
            $table->unsignedInteger('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('instructors');
        Schema::dropIfExists('subjects');
        Schema::dropIfExists('course_categories');
    }
};
