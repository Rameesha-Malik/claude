<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    /**
     * "Content managers" -- team members who can add/edit content in
     * courses they're assigned to, but can't touch students, enrollments,
     * or settings. Narrower than the existing 'staff' role (which already
     * includes "manage students"), so this is a new role rather than a
     * tweak to 'staff'. Enforced by RestrictContentManagers middleware
     * (only ever checks accounts that actually hold this role -- owner/
     * staff/every other account is untouched) and per-course checks in
     * CourseController.
     */
    public function up(): void
    {
        Schema::create('content_manager_courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['user_id', 'course_id']);
        });

        $permissions = [
            'manage courses', 'manage content library', 'manage question bank', 'manage notes bank',
        ];
        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        Role::findOrCreate('content_manager', 'web')->syncPermissions($permissions);
    }

    public function down(): void
    {
        Schema::dropIfExists('content_manager_courses');
        Role::where('name', 'content_manager')->delete();
    }
};
