<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicSiteController;
use App\Http\Controllers\Student\CourseController as StudentCourseController;
use App\Http\Controllers\Student\DashboardController as StudentDashboardController;
use Illuminate\Support\Facades\Route;

Route::get('/', [PublicSiteController::class, 'home'])->name('home');
Route::get('/courses', [PublicSiteController::class, 'courses'])->name('courses');
Route::get('/courses/{course:slug}', [PublicSiteController::class, 'courseDetail'])->name('courses.show');
Route::get('/about', [PublicSiteController::class, 'about'])->name('about');
Route::get('/contact', [PublicSiteController::class, 'contact'])->name('contact');
Route::post('/contact', [PublicSiteController::class, 'submitContact'])->name('contact.submit');
Route::get('/news', [PublicSiteController::class, 'news'])->name('news');
Route::get('/resources', [PublicSiteController::class, 'resources'])->name('resources');
Route::get('/how-to-buy', [PublicSiteController::class, 'howToBuy'])->name('how-to-buy');

// Neutral post-login landing: AuthenticatedSessionController always
// redirects here regardless of role, so it can't itself be gated to one
// user_type. It only ever dispatches onward.
//
// Deliberately a DIFFERENT URI from the student portal's own prefix below
// ('/portal', not '/dashboard') — two routes sharing an identical
// {method, URI} pair silently evict each other from Laravel's route
// collection, including from the named-route lookup table, not just URI
// resolution. Confirmed via `route:list`, not assumed: registering
// GET /dashboard here and GET /dashboard again via the group's index
// route made `route('dashboard')` throw RouteNotFoundException even
// though this definition runs first.
Route::get('/dashboard', function () {
    return match (auth()->user()->user_type) {
        'admin' => redirect()->route('admin.dashboard'),
        default => redirect()->route('student.dashboard'),
    };
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified', 'user_type:student'])->prefix('portal')->group(function () {
    Route::get('/', [StudentDashboardController::class, 'index'])->name('student.dashboard');
    Route::get('/my-courses', [StudentCourseController::class, 'index'])->name('student.courses');
    Route::get('/my-courses/{course:slug}', [StudentCourseController::class, 'show'])->name('student.courses.show');
    Route::post('/lessons/{lesson}/complete', [StudentCourseController::class, 'markLessonComplete'])->name('student.lessons.complete');
    Route::post('/courses/{course:slug}/questions', [StudentCourseController::class, 'askQuestion'])->name('student.questions.store');
});

Route::middleware(['auth', 'verified', 'user_type:admin'])->prefix('admin')->group(function () {
    // Placeholder until the full Admin Panel module is built — keeps the
    // post-login redirect for admin/staff/owner accounts working now
    // rather than leaving it dangling mid-build.
    Route::get('/', fn () => \Inertia\Inertia::render('Admin/Dashboard'))->name('admin.dashboard');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
