<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // 'admin' covers both Owner and Staff — the distinction between
            // them is a spatie role/permission set, not a schema column.
            $table->enum('user_type', ['admin', 'student'])->default('student')->after('id');
            $table->string('phone')->nullable()->after('email');
            $table->string('avatar_path')->nullable()->after('phone');
            $table->boolean('is_active')->default(true)->after('avatar_path'); // suspend toggle
            $table->timestamp('suspended_at')->nullable()->after('is_active');
            $table->json('notification_preferences')->nullable()->after('suspended_at');
            // Student's self-selected target exam, when not set per-course by admin.
            $table->string('target_exam_name')->nullable()->after('notification_preferences');
            $table->date('target_exam_date')->nullable()->after('target_exam_name');

            $table->index('user_type');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'user_type', 'phone', 'avatar_path', 'is_active', 'suspended_at',
                'notification_preferences', 'target_exam_name', 'target_exam_date',
            ]);
        });
    }
};
