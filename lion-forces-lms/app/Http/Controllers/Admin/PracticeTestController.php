<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\PracticeTest;
use App\Models\QuestionBank;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PracticeTestController extends Controller
{
    public function index(Request $request, Course $course): Response
    {
        abort_unless($request->user()->canManageCourse($course), 403);

        return Inertia::render('Admin/PracticeTests/Index', [
            'course' => $course->only('id', 'title'),
            'tests' => $course->practiceTests()->withCount('questions')->get(),
        ]);
    }

    public function adminIndex(Request $request): Response
    {
        $isContentManager = $request->user()->hasRole('content_manager');
        $managedCourseIds = $isContentManager ? $request->user()->managedCourses()->pluck('courses.id') : null;

        return Inertia::render('Admin/PracticeTests/AllIndex', [
            'tests' => PracticeTest::with('course:id,title')->withCount('questions')
                ->when($isContentManager, fn ($q) => $q->whereIn('course_id', $managedCourseIds))
                ->orderByDesc('id')->get(),
            'courses' => Course::orderBy('title')->when($isContentManager, fn ($q) => $q->whereIn('id', $managedCourseIds))->get(['id', 'title']),
        ]);
    }

    public function create(Request $request, Course $course): Response
    {
        abort_unless($request->user()->canManageCourse($course), 403);

        return $this->form($course);
    }

    public function edit(Request $request, Course $course, PracticeTest $practiceTest): Response
    {
        abort_unless($request->user()->canManageCourse($course), 403);

        $practiceTest->load('questions.options');

        return $this->form($course, $practiceTest);
    }

    private function form(Course $course, ?PracticeTest $practiceTest = null): Response
    {
        return Inertia::render('Admin/PracticeTests/Form', [
            'course' => $course->only('id', 'title'),
            'practiceTest' => $practiceTest,
            'subjects' => Subject::orderBy('name')->get(['id', 'name']),
            'questionBank' => QuestionBank::with('options:id,question_id,option_text,is_correct')
                ->select('id', 'subject_id', 'question_text', 'difficulty')
                ->orderByDesc('id')
                ->limit(200)
                ->get(),
        ]);
    }

    public function store(Request $request, Course $course)
    {
        abort_unless($request->user()->canManageCourse($course), 403);

        $data = $this->validated($request);
        $questionIds = $data['question_ids'] ?? [];
        unset($data['question_ids']);

        $test = $course->practiceTests()->create($data);
        $this->syncQuestions($test, $questionIds);

        return redirect()->route('admin.courses.practice-tests.index', $course)->with('success', 'Practice test created.');
    }

    public function update(Request $request, Course $course, PracticeTest $practiceTest)
    {
        abort_unless($request->user()->canManageCourse($course), 403);

        $data = $this->validated($request);
        $questionIds = $data['question_ids'] ?? [];
        unset($data['question_ids']);

        $practiceTest->update($data);
        $this->syncQuestions($practiceTest, $questionIds);

        return back()->with('success', 'Practice test updated.');
    }

    public function destroy(Request $request, Course $course, PracticeTest $practiceTest)
    {
        abort_unless($request->user()->canManageCourse($course), 403);

        $practiceTest->delete();

        return redirect()->route('admin.courses.practice-tests.index', $course)->with('success', 'Practice test removed.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'title' => 'required|string|max:255',
            'timer_enabled' => 'boolean',
            'duration_minutes' => 'nullable|integer|min:1',
            'question_selection_mode' => 'required|in:manual,auto',
            'subject_id' => 'nullable|exists:subjects,id',
            'auto_question_count' => 'nullable|integer|min:1',
            'shuffle_questions' => 'boolean',
            'marks_per_question' => 'required|numeric|min:0',
            'negative_marking' => 'required|numeric|min:0',
            'is_repeatable' => 'boolean',
            'is_active' => 'boolean',
            'question_ids' => 'nullable|array',
            'question_ids.*' => 'exists:question_bank,id',
        ]);
    }

    private function syncQuestions(PracticeTest $test, array $questionIds): void
    {
        if ($test->question_selection_mode !== 'manual') {
            $test->questions()->sync([]);

            return;
        }

        $sync = [];
        foreach (array_values($questionIds) as $i => $id) {
            $sync[$id] = ['order' => $i + 1];
        }
        $test->questions()->sync($sync);
    }
}
