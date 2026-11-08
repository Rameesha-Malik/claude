<?php

use App\Models\Course;
use App\Models\User;

// Covers the admin's core course CRUD loop (create -> edit -> update ->
// delete) against the real validation rules in CourseController, not a
// hand-rolled guess at what fields it needs.

beforeEach(function () {
    $this->admin = User::factory()->create(['user_type' => 'admin']);
});

test('admin course list page loads', function () {
    $this->actingAs($this->admin)->get(route('admin.courses.index'))->assertOk();
});

test('admin can create a course with only the required fields', function () {
    $response = $this->actingAs($this->admin)->post(route('admin.courses.store'), [
        'title' => 'Test Prep Course',
        'status' => 'draft',
    ]);

    $course = Course::where('title', 'Test Prep Course')->first();

    expect($course)->not->toBeNull();
    expect($course->status)->toBe('draft');
    expect($course->slug)->not->toBeEmpty();
    $response->assertRedirect(route('admin.courses.edit', $course));
});

test('creating a course without a title fails validation', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.courses.store'), ['status' => 'draft'])
        ->assertSessionHasErrors('title');

    expect(Course::count())->toBe(0);
});

test('admin can update a course', function () {
    $course = Course::create(['title' => 'Original Title', 'slug' => 'original-title', 'status' => 'draft']);

    $this->actingAs($this->admin)
        ->put(route('admin.courses.update', $course), [
            'title' => 'Updated Title',
            'status' => 'published',
        ])
        ->assertRedirect();

    expect($course->fresh()->title)->toBe('Updated Title');
    expect($course->fresh()->status)->toBe('published');
});

test('admin can delete a course', function () {
    $course = Course::create(['title' => 'Disposable Course', 'slug' => 'disposable-course', 'status' => 'draft']);

    $this->actingAs($this->admin)->delete(route('admin.courses.destroy', $course));

    expect(Course::find($course->id))->toBeNull();
});

test('a student cannot create a course', function () {
    $student = User::factory()->create(['user_type' => 'student']);

    $this->actingAs($student)
        ->post(route('admin.courses.store'), ['title' => 'Should Not Exist', 'status' => 'draft'])
        ->assertForbidden();

    expect(Course::count())->toBe(0);
});
