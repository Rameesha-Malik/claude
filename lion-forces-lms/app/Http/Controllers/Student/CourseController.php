<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function index(Request $request): Response
    {
        $enrollments = $request->user()->enrollments()
            ->with(['course.category', 'package'])
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Student/MyCourses', ['enrollments' => $enrollments]);
    }

    public function show(Request $request, Course $course): Response
    {
        $enrollment = Enrollment::where('user_id', $request->user()->id)
            ->where('course_id', $course->id)
            ->where('status', 'active')
            ->firstOrFail();

        $user = $request->user();

        $course->load([
            'lessons' => fn ($q) => $q->orderBy('order'),
            'sharedNotes',
            'instructor',
            'practiceTests' => fn ($q) => $q->where('is_active', true)->withCount('questions'),
            'mockExams' => fn ($q) => $q->where('is_active', true)->withCount('sections'),
        ]);

        // Personal/Guaranteed notes: assigned directly to this student, or
        // to the package they're enrolled under.
        $personalNotes = \App\Models\NoteAssignment::where(function ($q) use ($user, $enrollment) {
            $q->where('assignable_type', \App\Models\User::class)->where('assignable_id', $user->id);
            if ($enrollment->package_id) {
                $q->orWhere(function ($q2) use ($enrollment) {
                    $q2->where('assignable_type', \App\Models\CoursePackage::class)->where('assignable_id', $enrollment->package_id);
                });
            }
        })->with('note')->get()->pluck('note');

        $lessonProgress = $user->lessonProgress()
            ->whereIn('lesson_id', $course->lessons->pluck('id'))
            ->get()
            ->keyBy('lesson_id');

        $questions = \App\Models\CourseQuestion::where('course_id', $course->id)
            ->where('user_id', $user->id) // private 1:1 — only this student's own thread
            ->with('replies.admin:id,name')
            ->latest()
            ->get();

        return Inertia::render('Student/CourseLearning', [
            'course' => $course,
            'enrollment' => $enrollment,
            'personalNotes' => $personalNotes,
            'lessonProgress' => $lessonProgress,
            'questions' => $questions,
        ]);
    }

    public function markLessonComplete(Request $request, \App\Models\Lesson $lesson)
    {
        \App\Models\LessonProgress::updateOrCreate(
            ['user_id' => $request->user()->id, 'lesson_id' => $lesson->id],
            ['is_completed' => true, 'completed_at' => now()],
        );

        return back();
    }

    public function askQuestion(Request $request, Course $course)
    {
        $data = $request->validate([
            'lesson_id' => 'nullable|exists:lessons,id',
            'question_text' => 'required|string|max:2000',
        ]);

        \App\Models\CourseQuestion::create([
            'course_id' => $course->id,
            'user_id' => $request->user()->id,
            'lesson_id' => $data['lesson_id'] ?? null,
            'question_text' => $data['question_text'],
        ]);

        return back()->with('success', 'Your question has been sent.');
    }
}
