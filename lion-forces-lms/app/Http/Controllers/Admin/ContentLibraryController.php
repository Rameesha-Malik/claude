<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\NotesBank;
use App\Models\QuestionBank;
use App\Models\Subject;
use App\Models\Topic;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ContentLibraryController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Admin/ContentLibrary/Index', [
            'questions' => QuestionBank::with(['subject', 'topic', 'options'])
                ->when($request->subject_id, fn ($q, $s) => $q->where('subject_id', $s))
                ->latest()
                ->paginate(10, ['*'], 'questions_page')
                ->withQueryString(),
            'notes' => NotesBank::with('subject')
                ->latest()
                ->paginate(10, ['*'], 'notes_page')
                ->withQueryString(),
            'subjects' => Subject::orderBy('name')->get(),
            // All topics, each carrying its subject_id -- the frontend
            // filters this client-side to whichever subject is picked in
            // the question form, same as it already does with Subjects
            // for the question list filter.
            'topics' => Topic::orderBy('name')->get(['id', 'subject_id', 'name']),
            'filters' => $request->only(['subject_id']),
            // Only present right after a bulk-upload redirect -- pull() so
            // it doesn't linger in the session past this one page load.
            'bulkUploadResult' => session()->pull('bulkUploadResult'),
        ]);
    }

    public function storeSubject(Request $request)
    {
        $data = $request->validate(['name' => 'required|string|max:100|unique:subjects,name']);
        Subject::create(['name' => $data['name'], 'slug' => \Illuminate\Support\Str::slug($data['name'])]);

        return back()->with('success', 'Subject added.');
    }

    public function storeTopic(Request $request)
    {
        $data = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'name' => 'required|string|max:100',
        ]);
        Topic::create($data);

        return back()->with('success', 'Topic added.');
    }

    // --- Question Bank ---
    public function storeQuestion(Request $request)
    {
        $data = $request->validate([
            'subject_id' => 'nullable|exists:subjects,id',
            'topic_id' => 'nullable|exists:topics,id',
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

        ActivityLog::record('added', 'MCQ', $question->id, 'MCQ added.');

        return back()->with('success', 'Question added to the bank.');
    }

    // Client: "no need to change or upload each mcq one by one" -- the
    // single-question form above was the only way in, fine for a handful
    // of questions but not for "a bank of 200". CSV columns: Subject,
    // Topic, Difficulty, Question, Option A, Option B, Option C,
    // Option D, Correct Answer (A/B/C/D), Explanation. Subject/Topic are
    // matched by name (case-insensitive) or created on the fly, same as
    // typing a new one into the single-question form's dropdowns would
    // require doing by hand first -- this does it inline per row instead.
    public function bulkUploadQuestions(Request $request)
    {
        $request->validate(['csv' => 'required|file|mimes:csv,txt|max:2048']);

        $handle = fopen($request->file('csv')->getRealPath(), 'r');
        $header = fgetcsv($handle);
        $rowNumber = 1;
        $added = 0;
        $errors = [];

        while (($row = fgetcsv($handle)) !== false) {
            $rowNumber++;
            if (count(array_filter($row, fn ($v) => trim((string) $v) !== '')) === 0) {
                continue; // skip fully blank rows (trailing newline etc.)
            }

            [$subjectName, $topicName, $difficulty, $questionText, $optA, $optB, $optC, $optD, $correct, $explanation] = array_pad($row, 10, null);

            $subjectName = trim((string) $subjectName);
            $questionText = trim((string) $questionText);
            $options = [trim((string) $optA), trim((string) $optB), trim((string) $optC), trim((string) $optD)];
            $correct = strtoupper(trim((string) $correct));
            $difficulty = strtolower(trim((string) $difficulty)) ?: 'medium';

            if ($subjectName === '' || $questionText === '' || in_array('', $options, true)) {
                $errors[] = "Row {$rowNumber}: missing Subject, Question, or one of the four options.";

                continue;
            }
            if (! in_array($difficulty, ['easy', 'medium', 'hard'], true)) {
                $errors[] = "Row {$rowNumber}: Difficulty must be easy, medium, or hard (got \"{$difficulty}\").";

                continue;
            }
            $correctIndex = array_search($correct, ['A', 'B', 'C', 'D'], true);
            if ($correctIndex === false) {
                $errors[] = "Row {$rowNumber}: Correct Answer must be A, B, C, or D (got \"{$correct}\").";

                continue;
            }

            $subject = Subject::firstOrCreate(['slug' => Str::slug($subjectName)], ['name' => $subjectName]);
            $topic = null;
            $topicName = trim((string) $topicName);
            if ($topicName !== '') {
                $topic = Topic::firstOrCreate(['subject_id' => $subject->id, 'name' => $topicName]);
            }

            $question = QuestionBank::create([
                'subject_id' => $subject->id,
                'topic_id' => $topic?->id,
                'question_text' => $questionText,
                'explanation' => trim((string) $explanation) ?: null,
                'difficulty' => $difficulty,
                'created_by' => $request->user()->id,
            ]);

            foreach ($options as $i => $optionText) {
                $question->options()->create([
                    'option_text' => $optionText,
                    'is_correct' => $i === $correctIndex,
                    'order' => $i + 1,
                ]);
            }

            $added++;
        }
        fclose($handle);

        if ($added > 0) {
            ActivityLog::record('added', 'MCQ', null, "{$added} MCQs bulk-uploaded.");
        }

        return back()->with('bulkUploadResult', ['added' => $added, 'errors' => $errors]);
    }

    public function updateQuestion(Request $request, QuestionBank $question)
    {
        $data = $request->validate([
            'subject_id' => 'nullable|exists:subjects,id',
            'topic_id' => 'nullable|exists:topics,id',
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

        ActivityLog::record('edited', 'MCQ', $question->id, 'MCQ updated.');

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
            'price' => 'nullable|numeric|min:0',
            'is_published' => 'boolean',
        ]);

        $note = NotesBank::create($data + ['created_by' => $request->user()->id]);
        ActivityLog::record('added', 'Note', $note->id, "Note \"{$note->title}\" was added.");

        return back()->with('success', 'Note added to the bank.');
    }

    public function updateNote(Request $request, NotesBank $note)
    {
        $note->update($request->validate([
            'subject_id' => 'nullable|exists:subjects,id',
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'is_published' => 'boolean',
        ]));

        ActivityLog::record('edited', 'Note', $note->id, "Note \"{$note->title}\" was updated.");

        return back()->with('success', 'Note updated — change reflects in every course using it.');
    }

    public function destroyNote(NotesBank $note)
    {
        $note->delete();

        return back()->with('success', 'Note removed from the bank.');
    }
}
