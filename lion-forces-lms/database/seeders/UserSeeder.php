<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $owner = User::updateOrCreate(
            ['email' => 'admin@lionforcesacademy.com'],
            [
                'name' => 'Academy Admin',
                'user_type' => 'admin',
                'password' => bcrypt('password'), // CHANGE before going live
                'email_verified_at' => now(),
            ],
        );
        $owner->assignRole('owner');

        $student = User::updateOrCreate(
            ['email' => 'student@example.com'],
            [
                'name' => 'Demo Student',
                'user_type' => 'student',
                'password' => bcrypt('password'), // CHANGE before going live
                'email_verified_at' => now(),
            ],
        );
        $student->assignRole('student');
    }
}
