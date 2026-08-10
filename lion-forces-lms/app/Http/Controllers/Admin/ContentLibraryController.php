<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NotesBank;
use App\Models\QuestionBank;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContentLibraryController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Admin/ContentLibrary/Index', [
            'questions' => QuestionBank::with(['subject', 'options'])
                ->when($request->subject_id, fn ($q, $s) => $q->where('subject_id', $s))
                ->latest()
                ->paginate(10, ['*'], 'questions_page')
                ->withQueryString(),
            'notes' => NotesBank::with('subject')
                ->latest()
                ->paginate(10, ['*'], 'notes_page')
                ->withQueryString(),
            'subjects' => Subject::orderBy('name')->get(),
            'filters' => $request->only(['subject_id']),
        ]);
    }

    public function storeSubject(Request $request)
    {
        $data = $request->validate(['name' => 'required|string|max:100|unique:subjects,name']);
        Subject::create(['name' => $data['name'], 'slug' => \Illuminate\Support\Str::slug($data['name'])]);

        return back()->with('success', 'Subject added.');
    }

    // --- Question Bank ---
    public function storeQuestion(Request $request)
    {
        $data = $request->validate([
            'subject_id' => 'nullable|exists:subjects,id',
            'question_text' => 'required|string|max:2000',
            'explanation' => 'nullable|string|max:2000',
            'difficulty' => 'required|in:easy,medium,hard',
            'options' => 'required|array|min:2',
            'options.*.option_text' => 'required|string|max:500',
            'options.*.is_correct' => 'boolean',
        ]);

        $question = QuestionBank::create([
            ...collect($data)->except('options')->toArray(),
            'created_by' => $request->user()->id,
        ]);

        foreach ($data['options'] as $i => $option) {
            $question->options()->create([
                'option_text' => $option['option_text'],
                'is_correct' => $option['is_correct'] ?? false,
                'order' => $i + 1,
            ]);
        }

        return back()->with('success', 'Question added to the bank.');
    }

    public function updateQuestion(Request $request, QuestionBank $question)
    {
        $data = $request->validate([
            'subject_id' => 'nullable|exists:subjects,id',
            'question_text' => 'required|string|max:2000',
            'explanation' => 'nullable|string|max:2000',
            'difficulty' => 'required|in:easy,medium,hard',
            'options' => 'required|array|min:2',
            'options.*.id' => 'nullable|exists:question_options,id',
            'options.*.option_text' => 'required|string|max:500',
            'options.*.is_correct' => 'boolean',
        ]);

        $question->update(collect($data)->except('options')->toArray());

        $question->options()->delete();
        foreach ($data['options'] as $i => $option) {
            $question->options()->create([
                'option_text' => $option['option_text'],
                'is_correct' => $option['is_correct'] ?? false,
                'order' => $i + 1,
            ]);
        }

        return back()->with('success', 'Question updated — change reflects in every course using it.');
    }

    public function destroyQuestion(QuestionBank $question)
    {
        $question->delete();

        return back()->with('success', 'Question removed from the bank.');
    }

    // --- Notes Bank ---
    public function storeNote(Request $request)
    {
        $data = $request->validate([
            'subject_id' => 'nullable|exists:subjects,id',
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
        ]);

        NotesBank::create($data + ['created_by' => $request->user()->id]);

        return back()->with('success', 'Note added to the bank.');
    }

    public function updateNote(Request $request, NotesBank $note)
    {
        $note->update($request->validate([
            'subject_id' => 'nullable|exists:subjects,id',
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
        ]));

        return back()->with('success', 'Note updated — change reflects in every course using it.');
    }

    public function destroyNote(NotesBank $note)
    {
        $note->delete();

        return back()->with('success', 'Note removed from the bank.');
    }
}
