<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * One-off, not part of DatabaseSeeder's run() chain -- run directly with
 * `php artisan db:seed --class=FreshStudentDemoSeeder` to check what a
 * brand-new student sees right after signing up. Deliberately mirrors
 * RegisteredUserController::store() exactly: name/email/password only --
 * user_type defaults to 'student' and is_active defaults to true at the
 * DB level (see extend_users_table migration), same as a real signup, no
 * role assigned (nothing in this app checks hasRole('student') -- access
 * is gated purely by user_type), no profile fields, no enrollments.
 * email_verified_at is set so the account can actually reach the
 * dashboard instead of sitting on the "verify your email" prompt --
 * everything else is exactly what a real new account looks like.
 */
class FreshStudentDemoSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::updateOrCreate(
            ['email' => 'fresh.student@example.com'],
            [
                'name' => 'Fresh Student',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
        );

        $this->command?->info("Fresh student account ready: {$user->email} / password");
    }
}
