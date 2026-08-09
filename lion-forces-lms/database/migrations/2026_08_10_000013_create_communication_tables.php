<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Laravel's own notifications table drives in-app alerts for
        // individual students (announcement, test reminder, Q&A reply,
        // payment status change) via the standard Notifiable trait.
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->morphs('notifiable');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });

        // Admin-side compose history: what was broadcast, to whom, and when
        // — separate from the per-user notifications table above, which
        // only tracks delivery/read state per recipient.
        Schema::create('notification_broadcasts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('body');
            $table->enum('target_type', ['all', 'course', 'package'])->default('all');
            $table->foreignId('target_course_id')->nullable()->constrained('courses')->nullOnDelete();
            $table->foreignId('target_package_id')->nullable()->constrained('course_packages')->nullOnDelete();
            $table->foreignId('sent_by')->constrained('users')->cascadeOnDelete();
            $table->unsignedInteger('recipient_count')->default(0);
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_broadcasts');
        Schema::dropIfExists('notifications');
    }
};
