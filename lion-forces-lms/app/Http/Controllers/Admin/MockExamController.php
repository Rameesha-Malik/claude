<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\MockExam;
use App\Models\MockExamSection;
use App\Models\QuestionBank;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MockExamController extends Controller
{
    public function index(Course $course): Response
    {
        return Inertia::render('Admin/MockExams/Index', [
            'course' => $course->only('id', 'title'),
            'exams' => $course->mockExams()->withCount('sections')->get(),
        ]);
    }

    public function create(Course $course): Response
    {
        return $this->form($course);
    }

    public function edit(Course $course, MockExam $mockExam): Response
    {
        $mockExam->load('sections.questions');

        return $this->form($course, $mockExam);
    }

    private function form(Course $course, ?MockExam $mockExam = null): Response
    {
        return Inertia::render('Admin/MockExams/Form', [
            'course' => $course->only('id', 'title'),
            'mockExam' => $mockExam,
            'subjects' => Subject::orderBy('name')->get(['id', 'name']),
            'questionBank' => QuestionBank::select('id', 'subject_id', 'question_text', 'difficulty')
                ->orderByDesc('id')
                ->limit(300)
                ->get(),
        ]);
    }

    public function store(Request $request, Course $course)
    {
        $data = $this->validated($request);
        $exam = $course->mockExams()->create($data);

        return redirect()->route('admin.courses.mock-exams.edit', [$course, $exam])->with('success', 'Mock exam created. Now add sections.');
    }

    public function update(Request $request, Course $course, MockExam $mockExam)
    {
        $mockExam->update($this->validated($request));

        return back()->with('success', 'Mock exam updated.');
    }

    public function destroy(Course $course, MockExam $mockExam)
    {
        $mockExam->delete();

        return redirect()->route('admin.courses.mock-exams.index', $course)->with('success', 'Mock exam removed.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'title' => 'required|string|max:255',
            'target_exam_name' => 'nullable|string|max:255',
            'total_duration_minutes' => 'nullable|integer|min:1',
            'attempt_limit' => 'nullable|integer|min:1',
            'fullscreen_required' => 'boolean',
            'disallow_back_navigation' => 'boolean',
            'available_from' => 'nullable|date',
            'available_until' => 'nullable|date',
            'is_active' => 'boolean',
        ]);
    }

    // --- Sections ---

    public function storeSection(Request $request, Course $course, MockExam $mockExam)
    {
        $data = $this->sectionValidated($request);
        $questionIds = $data['question_ids'] ?? [];
        unset($data['question_ids']);
        $data['order'] = $mockExam->sections()->count() + 1;

        $section = $mockExam->sections()->create($data);
        $this->syncSectionQuestions($section, $questionIds);

        return back()->with('success', 'Section added.');
    }

    public function updateSection(Request $request, Course $course, MockExam $mockExam, MockExamSection $section)
    {
        $data = $this->sectionValidated($request);
        $questionIds = $data['question_ids'] ?? [];
        unset($data['question_ids']);

        $section->update($data);
        $this->syncSectionQuestions($section, $questionIds);

        return back()->with('success', 'Section updated.');
    }

    public function destroySection(Course $course, MockExam $mockExam, MockExamSection $section)
    {
        $section->delete();

        return back()->with('success', 'Section removed.');
    }

    private function sectionValidated(Request $request): array
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'duration_minutes' => 'nullable|integer|min:1',
            'marks_per_question' => 'required|numeric|min:0',
            'negative_marking' => 'required|numeric|min:0',
            'question_ids' => 'nullable|array',
            'question_ids.*' => 'exists:question_bank,id',
        ]);
    }

    private function syncSectionQuestions(MockExamSection $section, array $questionIds): void
    {
        $sync = [];
        foreach (array_values($questionIds) as $i => $id) {
            $sync[$id] = ['order' => $i + 1];
        }
        $section->questions()->sync($sync);
    }
}
