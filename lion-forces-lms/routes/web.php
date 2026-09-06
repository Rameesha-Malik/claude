<?php

use App\Http\Controllers\Admin\ActivityController as AdminActivityController;
use App\Http\Controllers\Admin\AssignmentController as AdminAssignmentController;
use App\Http\Controllers\Admin\BundleController as AdminBundleController;
use App\Http\Controllers\Admin\BundlePurchaseController as AdminBundlePurchaseController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\ContactInboxController as AdminContactInboxController;
use App\Http\Controllers\Admin\ContentLibraryController as AdminContentLibraryController;
use App\Http\Controllers\Admin\GuaranteedNotesController as AdminGuaranteedNotesController;
use App\Http\Controllers\Admin\ContentManagerController as AdminContentManagerController;
use App\Http\Controllers\Admin\CourseController as AdminCourseController;
use App\Http\Controllers\Admin\CourseQuestionController as AdminCourseQuestionController;
use App\Http\Controllers\Admin\EnrollmentController as AdminEnrollmentController;
use App\Http\Controllers\Admin\FavouriteQuestionController as AdminFavouriteQuestionController;
use App\Http\Controllers\Admin\LeaderboardController as AdminLeaderboardController;
use App\Http\Controllers\Admin\PerformanceController as AdminPerformanceController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\DemoQuizController as AdminDemoQuizController;
use App\Http\Controllers\Admin\FlashcardController as AdminFlashcardController;
use App\Http\Controllers\Admin\HallOfFameController as AdminHallOfFameController;
use App\Http\Controllers\Admin\InstructorController as AdminInstructorController;
use App\Http\Controllers\Admin\MockExamController as AdminMockExamController;
use App\Http\Controllers\Admin\NewsController as AdminNewsController;
use App\Http\Controllers\Admin\AlertController as AdminAlertController;
use App\Http\Controllers\Admin\NotificationController as AdminNotificationController;
use App\Http\Controllers\Admin\PaymentController as AdminPaymentController;
use App\Http\Controllers\Admin\PracticeTestController as AdminPracticeTestController;
use App\Http\Controllers\Admin\QuestionReportController as AdminQuestionReportController;
use App\Http\Controllers\Admin\QuizController as AdminQuizController;
use App\Http\Controllers\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Admin\ResourceController as AdminResourceController;
use App\Http\Controllers\Admin\ReviewController as AdminReviewController;
use App\Http\Controllers\Admin\SettingsController as AdminSettingsController;
use App\Http\Controllers\Admin\StagedTestController as AdminStagedTestController;
use App\Http\Controllers\Admin\StudentController as AdminStudentController;
use App\Http\Controllers\Admin\WebsiteController as AdminWebsiteController;
use App\Http\Controllers\DemoQuizController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicSiteController;
use App\Http\Controllers\QuestionCheckController;
use App\Http\Controllers\Student\AssignmentController as StudentAssignmentController;
use App\Http\Controllers\Student\AttemptController as StudentAttemptController;
use App\Http\Controllers\Student\BundleCheckoutController as StudentBundleCheckoutController;
use App\Http\Controllers\Student\CheckoutController as StudentCheckoutController;
use App\Http\Controllers\Student\NotePurchaseController as StudentNotePurchaseController;
use App\Http\Controllers\Student\CourseController as StudentCourseController;
use App\Http\Controllers\Student\DashboardController as StudentDashboardController;
use App\Http\Controllers\Student\MockExamController as StudentMockExamController;
use App\Http\Controllers\Student\NotificationController as StudentNotificationController;
use App\Http\Controllers\Student\PracticeTestController as StudentPracticeTestController;
use App\Http\Controllers\Student\RevisionListController as StudentRevisionListController;
use App\Http\Controllers\Student\QuizController as StudentQuizController;
use App\Http\Controllers\Student\StagedTestController as StudentStagedTestController;
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
Route::get('/practice-tests', [PublicSiteController::class, 'practiceTests'])->name('practice-tests');
Route::get('/notes', [PublicSiteController::class, 'notes'])->name('notes');
Route::get('/notes/{note}', [PublicSiteController::class, 'noteDetail'])->name('notes.show');
Route::get('/bundles', [PublicSiteController::class, 'bundles'])->name('bundles');
Route::get('/bundles/{bundle:slug}', [PublicSiteController::class, 'bundleDetail'])->name('bundles.show');

Route::get('/demo-quiz', [DemoQuizController::class, 'show'])->name('demo-quiz.show');
Route::post('/demo-quiz/start', [DemoQuizController::class, 'start'])->name('demo-quiz.start');
Route::get('/demo-quiz/{attempt}', [DemoQuizController::class, 'take'])->name('demo-quiz.take');
Route::post('/demo-quiz/{attempt}/submit', [DemoQuizController::class, 'submit'])->name('demo-quiz.submit');
Route::get('/demo-quiz/{attempt}/result', [DemoQuizController::class, 'result'])->name('demo-quiz.result');

// Instant per-question feedback shared by every attempt flow via
// QuestionRunner -- public (no auth) since the demo quiz above is a guest
// flow too; see QuestionCheckController for why this is a single endpoint.
Route::post('/questions/{question}/check-answer', [QuestionCheckController::class, 'check'])->name('questions.check-answer');
Route::post('/questions/{question}/report', [QuestionCheckController::class, 'report'])->name('questions.report');
Route::post('/questions/{question}/favourite', [QuestionCheckController::class, 'toggleFavourite'])->name('questions.favourite');

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
    Route::get('/revision-list', [StudentRevisionListController::class, 'index'])->name('student.revision-list');
    Route::get('/my-courses', [StudentCourseController::class, 'index'])->name('student.courses');
    Route::get('/my-courses/{course:slug}', [StudentCourseController::class, 'show'])->name('student.courses.show');
    Route::get('/courses/{course:slug}/checkout', [StudentCheckoutController::class, 'create'])->name('student.checkout.create');
    Route::post('/courses/{course:slug}/checkout', [StudentCheckoutController::class, 'store'])->name('student.checkout.store');
    Route::get('/bundles/{bundle:slug}/checkout', [StudentBundleCheckoutController::class, 'create'])->name('student.bundle-checkout.create');
    Route::post('/bundles/{bundle:slug}/checkout', [StudentBundleCheckoutController::class, 'store'])->name('student.bundle-checkout.store');
    Route::get('/notes/{note}/purchase', [StudentNotePurchaseController::class, 'create'])->name('student.notes.purchase.create');
    Route::post('/notes/{note}/purchase', [StudentNotePurchaseController::class, 'store'])->name('student.notes.purchase.store');
    Route::post('/lessons/{lesson}/complete', [StudentCourseController::class, 'markLessonComplete'])->name('student.lessons.complete');
    Route::post('/courses/{course:slug}/questions', [StudentCourseController::class, 'askQuestion'])->name('student.questions.store');
    Route::post('/courses/{course:slug}/review', [StudentCourseController::class, 'submitReview'])->name('student.reviews.store');
    Route::post('/assignments/{assignment}/submit', [StudentAssignmentController::class, 'submit'])->name('student.assignments.submit');

    Route::get('/practice-tests/{practiceTest}', [StudentPracticeTestController::class, 'show'])->name('student.practice-tests.show');
    Route::post('/practice-tests/{practiceTest}/submit', [StudentPracticeTestController::class, 'submit'])->name('student.practice-tests.submit');
    Route::get('/quizzes/{quiz}', [StudentQuizController::class, 'show'])->name('student.quizzes.show');
    Route::post('/quizzes/{quiz}/submit', [StudentQuizController::class, 'submit'])->name('student.quizzes.submit');
    Route::get('/attempts/{attempt}', [StudentAttemptController::class, 'show'])->name('student.attempts.show');

    Route::get('/mock-exams/{mockExam}', [StudentMockExamController::class, 'show'])->name('student.mock-exams.show');
    Route::post('/mock-exams/{mockExam}/start', [StudentMockExamController::class, 'start'])->name('student.mock-exams.start');
    Route::get('/mock-exams/{mockExam}/attempts/{attempt}/sections/{section}', [StudentMockExamController::class, 'showSection'])->name('student.mock-exams.section');
    Route::post('/mock-exams/{mockExam}/attempts/{attempt}/sections/{section}/submit', [StudentMockExamController::class, 'submitSection'])->name('student.mock-exams.section.submit');

    Route::get('/staged-tests/{stagedTest}', [StudentStagedTestController::class, 'show'])->name('student.staged-tests.show');
    Route::post('/staged-tests/{stagedTest}/start', [StudentStagedTestController::class, 'start'])->name('student.staged-tests.start');
    Route::get('/staged-tests/{stagedTest}/attempts/{attempt}/stages/{stage}', [StudentStagedTestController::class, 'showStage'])->name('student.staged-tests.stage');
    Route::post('/staged-tests/{stagedTest}/attempts/{attempt}/stages/{stage}/submit', [StudentStagedTestController::class, 'submitStage'])->name('student.staged-tests.stage.submit');

    Route::get('/notifications', [StudentNotificationController::class, 'index'])->name('student.notifications.index');
    Route::post('/notifications/{id}/read', [StudentNotificationController::class, 'markRead'])->name('student.notifications.read');
    Route::post('/notifications/read-all', [StudentNotificationController::class, 'markAllRead'])->name('student.notifications.read-all');
});

Route::middleware(['auth', 'verified', 'user_type:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');

    Route::middleware('not.content_manager')->prefix('website')->name('website.')->group(function () {
        Route::get('/', [AdminWebsiteController::class, 'index'])->name('index');
        Route::put('/settings', [AdminWebsiteController::class, 'updateSettings'])->name('settings.update');
        Route::post('/logo', [AdminWebsiteController::class, 'updateLogo'])->name('logo.update');
        Route::delete('/logo', [AdminWebsiteController::class, 'destroyLogo'])->name('logo.destroy');
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

    Route::middleware('not.content_manager')->prefix('students')->name('students.')->group(function () {
        Route::get('/', [AdminStudentController::class, 'index'])->name('index');
        Route::get('/search', [AdminStudentController::class, 'search'])->name('search');
        Route::post('/', [AdminStudentController::class, 'store'])->name('store');
        Route::get('/{student}', [AdminStudentController::class, 'show'])->name('show');
        Route::post('/{student}/toggle-suspend', [AdminStudentController::class, 'toggleSuspend'])->name('toggle-suspend');
        Route::post('/{student}/enroll', [AdminStudentController::class, 'enroll'])->name('enroll');
        Route::delete('/{student}', [AdminStudentController::class, 'destroy'])->name('destroy');
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
        Route::post('/{course}/toggle-status', [AdminCourseController::class, 'toggleStatus'])->name('toggle-status');
        Route::delete('/{course}', [AdminCourseController::class, 'destroy'])->name('destroy');

        Route::post('/{course}/packages', [AdminCourseController::class, 'storePackage'])->name('packages.store');
        Route::put('/packages/{package}', [AdminCourseController::class, 'updatePackage'])->name('packages.update');
        Route::delete('/packages/{package}', [AdminCourseController::class, 'destroyPackage'])->name('packages.destroy');

        Route::post('/{course}/lessons', [AdminCourseController::class, 'storeLesson'])->name('lessons.store');
        Route::put('/lessons/{lesson}', [AdminCourseController::class, 'updateLesson'])->name('lessons.update');
        Route::delete('/lessons/{lesson}', [AdminCourseController::class, 'destroyLesson'])->name('lessons.destroy');

        Route::post('/{course}/sections', [AdminCourseController::class, 'storeSection'])->name('sections.store');
        Route::put('/sections/{section}', [AdminCourseController::class, 'updateSection'])->name('sections.update');
        Route::delete('/sections/{section}', [AdminCourseController::class, 'destroySection'])->name('sections.destroy');

        Route::prefix('{course}/practice-tests')->name('practice-tests.')->group(function () {
            Route::get('/', [AdminPracticeTestController::class, 'index'])->name('index');
            Route::get('/create', [AdminPracticeTestController::class, 'create'])->name('create');
            Route::post('/', [AdminPracticeTestController::class, 'store'])->name('store');
            Route::get('/{practiceTest}/edit', [AdminPracticeTestController::class, 'edit'])->name('edit');
            Route::put('/{practiceTest}', [AdminPracticeTestController::class, 'update'])->name('update');
            Route::delete('/{practiceTest}', [AdminPracticeTestController::class, 'destroy'])->name('destroy');
        });

        Route::prefix('{course}/quizzes')->name('quizzes.')->group(function () {
            Route::get('/', [AdminQuizController::class, 'index'])->name('index');
            Route::get('/create', [AdminQuizController::class, 'create'])->name('create');
            Route::post('/', [AdminQuizController::class, 'store'])->name('store');
            Route::get('/{quiz}/edit', [AdminQuizController::class, 'edit'])->name('edit');
            Route::put('/{quiz}', [AdminQuizController::class, 'update'])->name('update');
            Route::delete('/{quiz}', [AdminQuizController::class, 'destroy'])->name('destroy');
        });

        Route::prefix('{course}/flashcards')->name('flashcards.')->group(function () {
            Route::get('/', [AdminFlashcardController::class, 'index'])->name('index');
            Route::post('/', [AdminFlashcardController::class, 'store'])->name('store');
            Route::put('/{flashcard}', [AdminFlashcardController::class, 'update'])->name('update');
            Route::post('/{flashcard}/status', [AdminFlashcardController::class, 'setStatus'])->name('status');
            Route::delete('/{flashcard}', [AdminFlashcardController::class, 'destroy'])->name('destroy');
        });

        Route::prefix('{course}/assignments')->name('assignments.')->group(function () {
            Route::get('/', [AdminAssignmentController::class, 'index'])->name('index');
            Route::post('/', [AdminAssignmentController::class, 'store'])->name('store');
            Route::put('/{assignment}', [AdminAssignmentController::class, 'update'])->name('update');
            Route::delete('/{assignment}', [AdminAssignmentController::class, 'destroy'])->name('destroy');
            Route::get('/{assignment}/submissions', [AdminAssignmentController::class, 'submissions'])->name('submissions');
            Route::post('/submissions/{submission}/grade', [AdminAssignmentController::class, 'grade'])->name('submissions.grade');
        });

        Route::prefix('{course}/mock-exams')->name('mock-exams.')->group(function () {
            Route::get('/', [AdminMockExamController::class, 'index'])->name('index');
            Route::get('/create', [AdminMockExamController::class, 'create'])->name('create');
            Route::post('/', [AdminMockExamController::class, 'store'])->name('store');
            Route::get('/{mockExam}/edit', [AdminMockExamController::class, 'edit'])->name('edit');
            Route::put('/{mockExam}', [AdminMockExamController::class, 'update'])->name('update');
            Route::delete('/{mockExam}', [AdminMockExamController::class, 'destroy'])->name('destroy');
            Route::post('/{mockExam}/sections', [AdminMockExamController::class, 'storeSection'])->name('sections.store');
            Route::put('/{mockExam}/sections/{section}', [AdminMockExamController::class, 'updateSection'])->name('sections.update');
            Route::delete('/{mockExam}/sections/{section}', [AdminMockExamController::class, 'destroySection'])->name('sections.destroy');
        });

        Route::prefix('{course}/staged-tests')->name('staged-tests.')->group(function () {
            Route::get('/', [AdminStagedTestController::class, 'index'])->name('index');
            Route::get('/create', [AdminStagedTestController::class, 'create'])->name('create');
            Route::post('/', [AdminStagedTestController::class, 'store'])->name('store');
            Route::get('/{stagedTest}/edit', [AdminStagedTestController::class, 'edit'])->name('edit');
            Route::put('/{stagedTest}', [AdminStagedTestController::class, 'update'])->name('update');
            Route::delete('/{stagedTest}', [AdminStagedTestController::class, 'destroy'])->name('destroy');
            Route::post('/{stagedTest}/stages', [AdminStagedTestController::class, 'storeStage'])->name('stages.store');
            Route::put('/{stagedTest}/stages/{stage}', [AdminStagedTestController::class, 'updateStage'])->name('stages.update');
            Route::delete('/{stagedTest}/stages/{stage}', [AdminStagedTestController::class, 'destroyStage'])->name('stages.destroy');
        });
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

    Route::prefix('guaranteed-notes')->name('guaranteed-notes.')->group(function () {
        Route::get('/', [AdminGuaranteedNotesController::class, 'index'])->name('index');

        // Reuses WebsiteController's Faq/Testimonial CRUD (note-scoped --
        // see storeFaq/storeTestimonial) under this prefix rather than
        // /admin/website's, so content managers (who can already manage
        // notes but not the site-wide Website page) can manage these too.
        Route::get('/testimonials', [AdminGuaranteedNotesController::class, 'testimonials'])->name('testimonials');
        Route::post('/testimonials', [AdminWebsiteController::class, 'storeTestimonial'])->name('testimonials.store');
        Route::put('/testimonials/{testimonial}', [AdminWebsiteController::class, 'updateTestimonial'])->name('testimonials.update');
        Route::delete('/testimonials/{testimonial}', [AdminWebsiteController::class, 'destroyTestimonial'])->name('testimonials.destroy');

        Route::get('/faqs', [AdminGuaranteedNotesController::class, 'faqs'])->name('faqs');
        Route::post('/faqs', [AdminWebsiteController::class, 'storeFaq'])->name('faqs.store');
        Route::put('/faqs/{faq}', [AdminWebsiteController::class, 'updateFaq'])->name('faqs.update');
        Route::delete('/faqs/{faq}', [AdminWebsiteController::class, 'destroyFaq'])->name('faqs.destroy');

        // Purchase verification is money-handling, same as Payments --
        // stays owner/staff-only even though a content manager can
        // otherwise manage the notes themselves as content.
        Route::middleware('not.content_manager')->group(function () {
            Route::get('/purchase-requests', [AdminGuaranteedNotesController::class, 'purchaseRequests'])->name('purchase-requests');
            Route::post('/purchase-requests/{purchase}/verify', [AdminGuaranteedNotesController::class, 'verify'])->name('purchase-requests.verify');
            Route::post('/purchase-requests/{purchase}/reject', [AdminGuaranteedNotesController::class, 'reject'])->name('purchase-requests.reject');
        });
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

    Route::middleware('not.content_manager')->prefix('payments')->name('payments.')->group(function () {
        Route::get('/', [AdminPaymentController::class, 'index'])->name('index');
        Route::post('/{payment}/verify', [AdminPaymentController::class, 'verify'])->name('verify');
        Route::post('/{payment}/reject', [AdminPaymentController::class, 'reject'])->name('reject');
    });

    Route::middleware('not.content_manager')->prefix('enrollments')->name('enrollments.')->group(function () {
        Route::get('/', [AdminEnrollmentController::class, 'index'])->name('index');
        Route::post('/', [AdminEnrollmentController::class, 'store'])->name('store');
        Route::post('/bulk', [AdminEnrollmentController::class, 'bulk'])->name('bulk');
        Route::delete('/{enrollment}', [AdminEnrollmentController::class, 'destroy'])->name('destroy');
    });
    Route::get('/leaderboard', [AdminLeaderboardController::class, 'index'])->name('leaderboard.index');
    Route::get('/performance', [AdminPerformanceController::class, 'index'])->name('performance.index');
    Route::get('/activity', [AdminActivityController::class, 'index'])->name('activity.index');

    Route::prefix('bundles')->name('bundles.')->group(function () {
        Route::get('/', [AdminBundleController::class, 'index'])->name('index');
        Route::get('/create', [AdminBundleController::class, 'create'])->name('create');
        Route::post('/', [AdminBundleController::class, 'store'])->name('store');
        Route::get('/{bundle}/edit', [AdminBundleController::class, 'edit'])->name('edit');
        Route::put('/{bundle}', [AdminBundleController::class, 'update'])->name('update');
        Route::delete('/{bundle}', [AdminBundleController::class, 'destroy'])->name('destroy');
    });

    Route::middleware('not.content_manager')->prefix('bundle-purchases')->name('bundle-purchases.')->group(function () {
        Route::get('/', [AdminBundlePurchaseController::class, 'index'])->name('index');
        Route::post('/{purchase}/verify', [AdminBundlePurchaseController::class, 'verify'])->name('verify');
        Route::post('/{purchase}/reject', [AdminBundlePurchaseController::class, 'reject'])->name('reject');
    });

    Route::prefix('contact-inbox')->name('contact-inbox.')->group(function () {
        Route::get('/', [AdminContactInboxController::class, 'index'])->name('index');
        Route::post('/{submission}/toggle-handled', [AdminContactInboxController::class, 'toggleHandled'])->name('toggle-handled');
    });

    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/', [AdminReportController::class, 'index'])->name('index');
        Route::get('/export/{type}', [AdminReportController::class, 'export'])->name('export');
    });

    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [AdminNotificationController::class, 'index'])->name('index');
        Route::post('/', [AdminNotificationController::class, 'store'])->name('store');
    });

    // The admin's own alert inbox -- distinct from the "notifications"
    // group above, which is the broadcast-composer (admin -> students).
    Route::prefix('alerts')->name('alerts.')->group(function () {
        Route::get('/', [AdminAlertController::class, 'index'])->name('index');
        Route::post('/{id}/read', [AdminAlertController::class, 'markRead'])->name('read');
        Route::post('/mark-all-read', [AdminAlertController::class, 'markAllRead'])->name('mark-all-read');
    });

    Route::prefix('qa')->name('qa.')->group(function () {
        Route::get('/', [AdminCourseQuestionController::class, 'index'])->name('index');
        Route::post('/{question}/reply', [AdminCourseQuestionController::class, 'reply'])->name('reply');
    });

    Route::prefix('reviews')->name('reviews.')->group(function () {
        Route::get('/', [AdminReviewController::class, 'index'])->name('index');
        Route::post('/{review}/approve', [AdminReviewController::class, 'approve'])->name('approve');
        Route::post('/{review}/hide', [AdminReviewController::class, 'hide'])->name('hide');
        Route::delete('/{review}', [AdminReviewController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('reported-questions')->name('reported-questions.')->group(function () {
        Route::get('/', [AdminQuestionReportController::class, 'index'])->name('index');
        Route::post('/{report}/resolve', [AdminQuestionReportController::class, 'resolve'])->name('resolve');
        Route::post('/{report}/dismiss', [AdminQuestionReportController::class, 'dismiss'])->name('dismiss');
    });

    Route::get('/favourite-questions', [AdminFavouriteQuestionController::class, 'index'])->name('favourite-questions.index');

    Route::prefix('demo-quiz')->name('demo-quiz.')->group(function () {
        Route::get('/', [AdminDemoQuizController::class, 'index'])->name('index');
        Route::get('/page-content', [AdminDemoQuizController::class, 'pageContent'])->name('page-content');
        Route::put('/page-content', [AdminDemoQuizController::class, 'updatePageContent'])->name('page-content.update');
        Route::get('/create', [AdminDemoQuizController::class, 'create'])->name('create');
        Route::post('/', [AdminDemoQuizController::class, 'store'])->name('store');
        Route::get('/{demoQuiz}/edit', [AdminDemoQuizController::class, 'edit'])->name('edit');
        Route::put('/{demoQuiz}', [AdminDemoQuizController::class, 'update'])->name('update');
        Route::delete('/{demoQuiz}', [AdminDemoQuizController::class, 'destroy'])->name('destroy');
    });

    Route::middleware('not.content_manager')->prefix('settings')->name('settings.')->group(function () {
        Route::get('/', [AdminSettingsController::class, 'index'])->name('index');
        Route::post('/staff', [AdminSettingsController::class, 'storeStaff'])->name('staff.store');
        Route::put('/staff/{staff}/role', [AdminSettingsController::class, 'updateStaffRole'])->name('staff.role');
        Route::post('/staff/{staff}/toggle-active', [AdminSettingsController::class, 'toggleStaffActive'])->name('staff.toggle-active');
        Route::put('/payment', [AdminSettingsController::class, 'updatePaymentSettings'])->name('payment.update');
    });

    Route::middleware('not.content_manager')->prefix('content-managers')->name('content-managers.')->group(function () {
        Route::get('/', [AdminContentManagerController::class, 'index'])->name('index');
        Route::post('/', [AdminContentManagerController::class, 'store'])->name('store');
        Route::put('/{manager}/courses', [AdminContentManagerController::class, 'updateCourses'])->name('courses');
        Route::delete('/{manager}', [AdminContentManagerController::class, 'destroy'])->name('destroy');
    });
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
