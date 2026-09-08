<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    /**
     * Owner has every permission. Staff gets a working subset — content and
     * day-to-day operations, but not user/role management or payment
     * verification, which stay Owner-only. Adjust from the admin Settings
     * screen once built; this is the sane starting point, not a hard rule.
     */
    public function run(): void
    {
        $permissions = [
            // Website management
            'manage site content', 'manage navigation', 'manage announcements',
            // Students
            'manage students', 'view students',
            // Courses
            'manage courses', 'manage content library', 'manage question bank',
            'manage notes bank', 'manage tests', 'manage flashcards',
            // Engagement
            'reply to qa', 'manage reviews', 'manage testimonials',
            // Comms
            'send notifications', 'manage resources', 'manage news',
            // Money
            'verify payments', 'manage enrollments',
            // Admin
            'view reports', 'manage settings', 'manage staff', 'manage roles',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $owner = Role::findOrCreate('owner', 'web');
        $owner->syncPermissions($permissions);

        $staff = Role::findOrCreate('staff', 'web');
        $staff->syncPermissions([
            'manage site content', 'manage navigation', 'manage announcements',
            'manage students', 'view students',
            'manage courses', 'manage content library', 'manage question bank',
            'manage notes bank', 'manage tests', 'manage flashcards',
            'reply to qa', 'manage reviews', 'manage testimonials',
            'send notifications', 'manage resources', 'manage news',
            'view reports',
        ]);

        // Student carries no admin permissions — access to their own data
        // is scoped by ownership in controllers/policies, not by a
        // permission check.
        Role::findOrCreate('student', 'web');
    }
}
