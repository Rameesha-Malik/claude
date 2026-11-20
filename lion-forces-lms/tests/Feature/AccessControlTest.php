<?php

use App\Models\User;

// The whole app's security model rests on two gates: user_type (which
// portal you're even allowed in) and is_active (whether a student account
// has been de-activated). These tests exercise both directly against the
// real routes/middleware, instead of trusting that EnsureUserType and
// CheckStudentActive are wired up correctly everywhere.

test('a guest is redirected to login from the student portal', function () {
    $this->get('/portal')->assertRedirect('/login');
});

test('a guest is redirected to login from the admin panel', function () {
    $this->get('/admin')->assertRedirect('/login');
});

test('a student can reach their own dashboard', function () {
    $student = User::factory()->create(['user_type' => 'student']);

    $this->actingAs($student)->get('/portal')->assertOk();
});

test('an admin can reach their own dashboard', function () {
    $admin = User::factory()->create(['user_type' => 'admin']);

    $this->actingAs($admin)->get('/admin')->assertOk();
});

test('a student is forbidden from the admin panel', function () {
    $student = User::factory()->create(['user_type' => 'student']);

    $this->actingAs($student)->get('/admin')->assertForbidden();
});

test('an admin is forbidden from the student portal', function () {
    $admin = User::factory()->create(['user_type' => 'admin']);

    $this->actingAs($admin)->get('/portal')->assertForbidden();
});

test('a de-activated student cannot reach the student portal', function () {
    $student = User::factory()->create(['user_type' => 'student', 'is_active' => false]);

    $this->actingAs($student)->get('/portal')->assertForbidden();
});

test('the neutral /dashboard route sends a student to the student portal', function () {
    $student = User::factory()->create(['user_type' => 'student']);

    $this->actingAs($student)->get('/dashboard')->assertRedirect(route('student.dashboard'));
});

test('the neutral /dashboard route sends an admin to the admin panel', function () {
    $admin = User::factory()->create(['user_type' => 'admin']);

    $this->actingAs($admin)->get('/dashboard')->assertRedirect(route('admin.dashboard'));
});
