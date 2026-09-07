<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\QuestionBank;
use App\Models\Quiz;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuizController extends Controller
{
    public function index(Course $course): Response
    {
        return Inertia::render('Admin/Quizzes/Index', [
            'course' => $course->only('id', 'title'),
            'quizzes' => $course->quizzes()->withCount('questions')->get(),
        ]);
    }

    public function create(Course $course): Response
    {
        return $this->form($course);
    }

    public function edit(Course $course, Quiz $quiz): Response
    {
        $quiz->load('questions.options');

        return $this->form($course, $quiz);
    }

    private function form(Course $course, ?Quiz $quiz = null): Response
    {
        return Inertia::render('Admin/Quizzes/Form', [
            'course' => $course->only('id', 'title'),
            'quiz' => $quiz,
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
        $data = $this->validated($request);
        $questionIds = $data['question_ids'] ?? [];
        unset($data['question_ids']);

        $quiz = $course->quizzes()->create($data + ['order' => $course->quizzes()->max('order') + 1]);
        $this->syncQuestions($quiz, $questionIds);

        return redirect()->route('admin.courses.quizzes.index', $course)->with('success', 'Quiz created.');
    }

    public function update(Request $request, Course $course, Quiz $quiz)
    {
        $data = $this->validated($request);
        $questionIds = $data['question_ids'] ?? [];
        unset($data['question_ids']);

        $quiz->update($data);
        $this->syncQuestions($quiz, $questionIds);

        return back()->with('success', 'Quiz updated.');
    }

    public function destroy(Course $course, Quiz $quiz)
    {
        $quiz->delete();

        return redirect()->route('admin.courses.quizzes.index', $course)->with('success', 'Quiz removed.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'title' => 'required|string|max:255',
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

    private function syncQuestions(Quiz $quiz, array $questionIds): void
    {
        if ($quiz->question_selection_mode !== 'manual') {
            $quiz->questions()->sync([]);

            return;
        }

        $sync = [];
        foreach (array_values($questionIds) as $i => $id) {
            $sync[$id] = ['order' => $i + 1];
        }
        $quiz->questions()->sync($sync);
    }
}
