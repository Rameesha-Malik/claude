<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\QuestionBank;
use App\Models\StagedTest;
use App\Models\StagedTestStage;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StagedTestController extends Controller
{
    public function index(Course $course): Response
    {
        return Inertia::render('Admin/StagedTests/Index', [
            'course' => $course->only('id', 'title'),
            'tests' => $course->stagedTests()->withCount('stages')->get(),
        ]);
    }

    public function create(Course $course): Response
    {
        return $this->form($course);
    }

    public function edit(Course $course, StagedTest $stagedTest): Response
    {
        $stagedTest->load('stages.questions');

        return $this->form($course, $stagedTest);
    }

    private function form(Course $course, ?StagedTest $stagedTest = null): Response
    {
        return Inertia::render('Admin/StagedTests/Form', [
            'course' => $course->only('id', 'title'),
            'stagedTest' => $stagedTest,
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
        $test = $course->stagedTests()->create($data);

        return redirect()->route('admin.courses.staged-tests.edit', [$course, $test])->with('success', 'Staged test created. Now add stages.');
    }

    public function update(Request $request, Course $course, StagedTest $stagedTest)
    {
        $stagedTest->update($this->validated($request));

        return back()->with('success', 'Staged test updated.');
    }

    public function destroy(Course $course, StagedTest $stagedTest)
    {
        $stagedTest->delete();

        return redirect()->route('admin.courses.staged-tests.index', $course)->with('success', 'Staged test removed.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'title' => 'required|string|max:255',
            'target_exam_name' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);
    }

    // --- Stages ---

    public function storeStage(Request $request, Course $course, StagedTest $stagedTest)
    {
        $data = $this->stageValidated($request);
        $questionIds = $data['question_ids'] ?? [];
        unset($data['question_ids']);
        $data['order'] = $stagedTest->stages()->count() + 1;

        $stage = $stagedTest->stages()->create($data);
        $this->syncStageQuestions($stage, $questionIds);

        return back()->with('success', 'Stage added.');
    }

    public function updateStage(Request $request, Course $course, StagedTest $stagedTest, StagedTestStage $stage)
    {
        $data = $this->stageValidated($request);
        $questionIds = $data['question_ids'] ?? [];
        unset($data['question_ids']);

        $stage->update($data);
        $this->syncStageQuestions($stage, $questionIds);

        return back()->with('success', 'Stage updated.');
    }

    public function destroyStage(Course $course, StagedTest $stagedTest, StagedTestStage $stage)
    {
        $stage->delete();

        return back()->with('success', 'Stage removed.');
    }

    private function stageValidated(Request $request): array
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'duration_minutes' => 'nullable|integer|min:1',
            'pass_threshold_percent' => 'required|numeric|min:0|max:100',
            'marks_per_question' => 'required|numeric|min:0',
            'negative_marking' => 'required|numeric|min:0',
            'question_ids' => 'nullable|array',
            'question_ids.*' => 'exists:question_bank,id',
        ]);
    }

    private function syncStageQuestions(StagedTestStage $stage, array $questionIds): void
    {
        $sync = [];
        foreach (array_values($questionIds) as $i => $id) {
            $sync[$id] = ['order' => $i + 1];
        }
        $stage->questions()->sync($sync);
    }
}
