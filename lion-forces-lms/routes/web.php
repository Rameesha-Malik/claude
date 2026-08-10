<?php

use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\ContactInboxController as AdminContactInboxController;
use App\Http\Controllers\Admin\ContentLibraryController as AdminContentLibraryController;
use App\Http\Controllers\Admin\CourseController as AdminCourseController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\HallOfFameController as AdminHallOfFameController;
use App\Http\Controllers\Admin\InstructorController as AdminInstructorController;
use App\Http\Controllers\Admin\NewsController as AdminNewsController;
use App\Http\Controllers\Admin\PaymentController as AdminPaymentController;
use App\Http\Controllers\Admin\ResourceController as AdminResourceController;
use App\Http\Controllers\Admin\StudentController as AdminStudentController;
use App\Http\Controllers\Admin\WebsiteController as AdminWebsiteController;
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

Route::middleware(['auth', 'verified', 'user_type:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');

    Route::prefix('website')->name('website.')->group(function () {
        Route::get('/', [AdminWebsiteController::class, 'index'])->name('index');
        Route::put('/settings', [AdminWebsiteController::class, 'updateSettings'])->name('settings.update');
        Route::put('/announcement', [AdminWebsiteController::class, 'updateAnnouncement'])->name('announcement.update');
        Route::put('/home-sections/{homeSection}', [AdminWebsiteController::class, 'updateHomeSection'])->name('home-sections.update');

        Route::post('/stats', [AdminWebsiteController::class, 'storeStat'])->name('stats.store');
        Route::put('/stats/{stat}', [AdminWebsiteController::class, 'updateStat'])->name('stats.update');
        Route::delete('/stats/{stat}', [AdminWebsiteController::class, 'destroyStat'])->name('stats.destroy');

        Route::post('/services', [AdminWebsiteController::class, 'storeService'])->name('services.store');
        Route::put('/services/{service}', [AdminWebsiteController::class, 'updateService'])->name('services.update');
        Route::delete('/services/{service}', [AdminWebsiteController::class, 'destroyService'])->name('services.destroy');

        Route::post('/faqs', [AdminWebsiteController::class, 'storeFaq'])->name('faqs.store');
        Route::put('/faqs/{faq}', [AdminWebsiteController::class, 'updateFaq'])->name('faqs.update');
        Route::delete('/faqs/{faq}', [AdminWebsiteController::class, 'destroyFaq'])->name('faqs.destroy');

        Route::post('/testimonials', [AdminWebsiteController::class, 'storeTestimonial'])->name('testimonials.store');
        Route::put('/testimonials/{testimonial}', [AdminWebsiteController::class, 'updateTestimonial'])->name('testimonials.update');
        Route::delete('/testimonials/{testimonial}', [AdminWebsiteController::class, 'destroyTestimonial'])->name('testimonials.destroy');
    });

    Route::prefix('students')->name('students.')->group(function () {
        Route::get('/', [AdminStudentController::class, 'index'])->name('index');
        Route::get('/{student}', [AdminStudentController::class, 'show'])->name('show');
        Route::post('/{student}/toggle-suspend', [AdminStudentController::class, 'toggleSuspend'])->name('toggle-suspend');
        Route::post('/{student}/enroll', [AdminStudentController::class, 'enroll'])->name('enroll');
        Route::put('/enrollments/{enrollment}/status', [AdminStudentController::class, 'updateEnrollmentStatus'])->name('enrollments.status');
    });

    Route::prefix('categories')->name('categories.')->group(function () {
        Route::get('/', [AdminCategoryController::class, 'index'])->name('index');
        Route::post('/', [AdminCategoryController::class, 'store'])->name('store');
        Route::put('/{category}', [AdminCategoryController::class, 'update'])->name('update');
        Route::delete('/{category}', [AdminCategoryController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('courses')->name('courses.')->group(function () {
        Route::get('/', [AdminCourseController::class, 'index'])->name('index');
        Route::get('/create', [AdminCourseController::class, 'create'])->name('create');
        Route::post('/', [AdminCourseController::class, 'store'])->name('store');
        Route::get('/{course}/edit', [AdminCourseController::class, 'edit'])->name('edit');
        Route::put('/{course}', [AdminCourseController::class, 'update'])->name('update');
        Route::delete('/{course}', [AdminCourseController::class, 'destroy'])->name('destroy');

        Route::post('/{course}/packages', [AdminCourseController::class, 'storePackage'])->name('packages.store');
        Route::put('/packages/{package}', [AdminCourseController::class, 'updatePackage'])->name('packages.update');
        Route::delete('/packages/{package}', [AdminCourseController::class, 'destroyPackage'])->name('packages.destroy');

        Route::post('/{course}/lessons', [AdminCourseController::class, 'storeLesson'])->name('lessons.store');
        Route::put('/lessons/{lesson}', [AdminCourseController::class, 'updateLesson'])->name('lessons.update');
        Route::delete('/lessons/{lesson}', [AdminCourseController::class, 'destroyLesson'])->name('lessons.destroy');
    });

    Route::prefix('content-library')->name('content-library.')->group(function () {
        Route::get('/', [AdminContentLibraryController::class, 'index'])->name('index');
        Route::post('/subjects', [AdminContentLibraryController::class, 'storeSubject'])->name('subjects.store');
        Route::post('/questions', [AdminContentLibraryController::class, 'storeQuestion'])->name('questions.store');
        Route::put('/questions/{question}', [AdminContentLibraryController::class, 'updateQuestion'])->name('questions.update');
        Route::delete('/questions/{question}', [AdminContentLibraryController::class, 'destroyQuestion'])->name('questions.destroy');
        Route::post('/notes', [AdminContentLibraryController::class, 'storeNote'])->name('notes.store');
        Route::put('/notes/{note}', [AdminContentLibraryController::class, 'updateNote'])->name('notes.update');
        Route::delete('/notes/{note}', [AdminContentLibraryController::class, 'destroyNote'])->name('notes.destroy');
    });

    Route::prefix('news')->name('news.')->group(function () {
        Route::get('/', [AdminNewsController::class, 'index'])->name('index');
        Route::post('/', [AdminNewsController::class, 'store'])->name('store');
        Route::put('/{news}', [AdminNewsController::class, 'update'])->name('update');
        Route::delete('/{news}', [AdminNewsController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('resources')->name('resources.')->group(function () {
        Route::get('/', [AdminResourceController::class, 'index'])->name('index');
        Route::post('/', [AdminResourceController::class, 'store'])->name('store');
        Route::put('/{resource}', [AdminResourceController::class, 'update'])->name('update');
        Route::delete('/{resource}', [AdminResourceController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('instructors')->name('instructors.')->group(function () {
        Route::get('/', [AdminInstructorController::class, 'index'])->name('index');
        Route::post('/', [AdminInstructorController::class, 'store'])->name('store');
        Route::put('/{instructor}', [AdminInstructorController::class, 'update'])->name('update');
        Route::delete('/{instructor}', [AdminInstructorController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('hall-of-fame')->name('hall-of-fame.')->group(function () {
        Route::get('/', [AdminHallOfFameController::class, 'index'])->name('index');
        Route::post('/', [AdminHallOfFameController::class, 'store'])->name('store');
        Route::put('/{hallOfFame}', [AdminHallOfFameController::class, 'update'])->name('update');
        Route::delete('/{hallOfFame}', [AdminHallOfFameController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('payments')->name('payments.')->group(function () {
        Route::get('/', [AdminPaymentController::class, 'index'])->name('index');
        Route::post('/{payment}/verify', [AdminPaymentController::class, 'verify'])->name('verify');
        Route::post('/{payment}/reject', [AdminPaymentController::class, 'reject'])->name('reject');
    });

    Route::prefix('contact-inbox')->name('contact-inbox.')->group(function () {
        Route::get('/', [AdminContactInboxController::class, 'index'])->name('index');
        Route::post('/{submission}/toggle-handled', [AdminContactInboxController::class, 'toggleHandled'])->name('toggle-handled');
    });
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
