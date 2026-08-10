<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DemoQuiz;
use App\Models\QuestionBank;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The public, no-login trial quiz (blueprint SS2.8) linked from the
 * homepage. Deliberately not course-scoped -- it exists to showcase the
 * platform to a visitor before they sign up, not to test a specific course.
 */
class DemoQuizController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/DemoQuiz/Index', [
            'quizzes' => DemoQuiz::withCount(['questions', 'attempts'])->latest()->get(),
        ]);
    }

    public function create(): Response
    {
        return $this->form();
    }

    public function edit(DemoQuiz $demoQuiz): Response
    {
        $demoQuiz->load('questions.options');

        return $this->form($demoQuiz);
    }

    private function form(?DemoQuiz $demoQuiz = null): Response
    {
        return Inertia::render('Admin/DemoQuiz/Form', [
            'demoQuiz' => $demoQuiz,
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
        $questionIds = $data['question_ids'] ?? [];
        unset($data['question_ids']);

        $quiz = DemoQuiz::create($data);
        $this->syncQuestions($quiz, $questionIds);

        return redirect()->route('admin.demo-quiz.index')->with('success', 'Demo quiz created.');
    }

    public function update(Request $request, DemoQuiz $demoQuiz)
    {
        $data = $this->validated($request);
        $questionIds = $data['question_ids'] ?? [];
        unset($data['question_ids']);

        $demoQuiz->update($data);
        $this->syncQuestions($demoQuiz, $questionIds);

        return back()->with('success', 'Demo quiz updated.');
    }

    public function destroy(DemoQuiz $demoQuiz)
    {
        $demoQuiz->delete();

        return redirect()->route('admin.demo-quiz.index')->with('success', 'Demo quiz removed.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'title' => 'required|string|max:255',
            'duration_minutes' => 'required|integer|min:1',
            'shuffle_questions' => 'boolean',
            'is_active' => 'boolean',
            'question_ids' => 'nullable|array',
            'question_ids.*' => 'exists:question_bank,id',
        ]);
    }

    private function syncQuestions(DemoQuiz $quiz, array $questionIds): void
    {
        $sync = [];
        foreach (array_values($questionIds) as $i => $id) {
            $sync[$id] = ['order' => $i + 1];
        }
        $quiz->questions()->sync($sync);
    }
}
