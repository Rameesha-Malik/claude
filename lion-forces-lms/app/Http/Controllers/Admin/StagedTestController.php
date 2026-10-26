<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\QuestionBank;
use App\Models\StagedTest;
use App\Models\StagedTestStage;
use App\Models\StagedTestStageGroup;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * "Full Test config" (admin reference screenshot, client-specified
 * special requirement): staged tests as a standalone top-level page --
 * previously only reachable nested inside a specific course's edit page
 * (course_id was required). Course is now an optional field on the test
 * itself, picked from a dropdown, rather than a URL segment -- one
 * controller, no parallel nested/top-level CRUD.
 *
 * Also adds "Stage groups": merge several stages so a candidate attempts
 * all of them before being gated on their COMBINED score, instead of each
 * stage individually -- see submitStage() in the student controller for
 * where that's actually enforced; this controller only manages the
 * group/stage records themselves.
 */
class StagedTestController extends Controller
{
    public function index(Request $request): Response
    {
        // Same scoping as the other course-content admin pages -- a
        // content manager only sees staged tests for their own courses.
        // A staged test with no course at all (course_id is optional) is
        // excluded for them too, same reasoning as Question Bank's
        // untagged-question case: nothing proves it's theirs to manage.
        $isContentManager = $request->user()->hasRole('content_manager');
        $managedCourseIds = $isContentManager ? $request->user()->managedCourses()->pluck('courses.id') : null;

        return Inertia::render('Admin/FullTestConfig/Index', [
            'tests' => StagedTest::with('course:id,title')->withCount('stages')
                ->when($isContentManager, fn ($q) => $q->whereIn('course_id', $managedCourseIds))
                ->latest()->get(),
            'courses' => Course::orderBy('title')->when($isContentManager, fn ($q) => $q->whereIn('id', $managedCourseIds))->get(['id', 'title']),
        ]);
    }

    public function edit(Request $request, StagedTest $stagedTest): Response
    {
        $this->assertManages($request, $stagedTest);

        $stagedTest->load(['stages.questions', 'stageGroups']);

        return Inertia::render('Admin/FullTestConfig/Edit', [
            'stagedTest' => $stagedTest,
            'courses' => Course::orderBy('title')->get(['id', 'title']),
            'subjects' => Subject::orderBy('name')->get(['id', 'name']),
            'questionBank' => QuestionBank::select('id', 'subject_id', 'question_text', 'difficulty')
                ->orderByDesc('id')
                ->limit(300)
                ->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        // No existing record to check here (this creates one) -- just the
        // target course, and a content manager must pick one of their own
        // rather than leaving it course-less.
        abort_if(
            $request->user()->hasRole('content_manager')
                && (empty($data['course_id']) || ! $request->user()->canManageCourse(Course::findOrFail($data['course_id']))),
            403
        );

        $test = StagedTest::create($data);

        return redirect()->route('admin.full-test-config.edit', $test)->with('success', 'Test created. Now add stages.');
    }

    public function update(Request $request, StagedTest $stagedTest)
    {
        $this->assertManages($request, $stagedTest);

        $data = $this->validated($request);
        // Also check the course they're re-tagging it to, if different --
        // same re-tagging-to-escalate guard used in Question Bank's fix.
        abort_if(
            $request->user()->hasRole('content_manager')
                && (empty($data['course_id']) || ! $request->user()->canManageCourse(Course::findOrFail($data['course_id']))),
            403
        );

        $stagedTest->update($data);

        return back()->with('success', 'Test updated.');
    }

    public function destroy(Request $request, StagedTest $stagedTest)
    {
        $this->assertManages($request, $stagedTest);

        $stagedTest->delete();

        return redirect()->route('admin.full-test-config.index')->with('success', 'Test removed.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'title' => 'required|string|max:255',
            'course_id' => 'nullable|exists:courses,id',
            'target_exam_name' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);
    }

    // Shared by every action below that takes an existing StagedTest --
    // a content manager may only touch one tagged to a course they manage;
    // a course-less one (course_id is optional) is off-limits to them too,
    // since nothing proves it's theirs.
    private function assertManages(Request $request, StagedTest $stagedTest): void
    {
        abort_if(
            $request->user()->hasRole('content_manager')
                && (! $stagedTest->course_id || ! $request->user()->canManageCourse($stagedTest->course)),
            403
        );
    }

    // --- Stages ---

    public function storeStage(Request $request, StagedTest $stagedTest)
    {
        $this->assertManages($request, $stagedTest);

        $data = $this->stageValidated($request);
        $questionIds = $data['question_ids'] ?? [];
        unset($data['question_ids']);
        $data['order'] = $stagedTest->stages()->count() + 1;

        $stage = $stagedTest->stages()->create($data);
        $this->syncStageQuestions($stage, $questionIds);

        return back()->with('success', 'Stage added.');
    }

    public function updateStage(Request $request, StagedTest $stagedTest, StagedTestStage $stage)
    {
        $this->assertManages($request, $stagedTest);

        $data = $this->stageValidated($request);
        $questionIds = $data['question_ids'] ?? [];
        unset($data['question_ids']);

        $stage->update($data);
        $this->syncStageQuestions($stage, $questionIds);

        return back()->with('success', 'Stage updated.');
    }

    public function destroyStage(Request $request, StagedTest $stagedTest, StagedTestStage $stage)
    {
        $this->assertManages($request, $stagedTest);

        $stage->delete();

        return back()->with('success', 'Stage removed.');
    }

    private function stageValidated(Request $request): array
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'stage_group_id' => 'nullable|exists:staged_test_stage_groups,id',
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

    // --- Stage groups ("Merge stages") ---

    public function storeGroup(Request $request, StagedTest $stagedTest)
    {
        $this->assertManages($request, $stagedTest);

        $data = $request->validate([
            'name' => 'nullable|string|max:255',
            'pass_threshold_percent' => 'required|numeric|min:0|max:100',
            'stage_ids' => 'required|array|min:2',
            'stage_ids.*' => 'exists:staged_test_stages,id',
        ]);

        $group = $stagedTest->stageGroups()->create([
            'name' => $data['name'] ?? null,
            'pass_threshold_percent' => $data['pass_threshold_percent'],
            'order' => $stagedTest->stageGroups()->count() + 1,
        ]);

        $stagedTest->stages()->whereIn('id', $data['stage_ids'])->update(['stage_group_id' => $group->id]);

        return back()->with('success', 'Stages merged into a group.');
    }

    public function updateGroup(Request $request, StagedTest $stagedTest, StagedTestStageGroup $group)
    {
        $this->assertManages($request, $stagedTest);

        $data = $request->validate([
            'name' => 'nullable|string|max:255',
            'pass_threshold_percent' => 'required|numeric|min:0|max:100',
        ]);

        $group->update($data);

        return back()->with('success', 'Group updated.');
    }

    public function destroyGroup(Request $request, StagedTest $stagedTest, StagedTestStageGroup $group)
    {
        $this->assertManages($request, $stagedTest);

        // Ungroups its stages (nullOnDelete on stage_group_id) rather than
        // deleting them -- "unmerge", not "remove these stages".
        $group->delete();

        return back()->with('success', 'Group removed -- its stages now pass individually again.');
    }
}
