<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Flashcard;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FlashcardController extends Controller
{
    public function index(Course $course): Response
    {
        return Inertia::render('Admin/Flashcards/Index', [
            'course' => $course->only('id', 'title'),
            'flashcards' => $course->flashcards()->orderByDesc('created_at')->get(),
        ]);
    }

    public function store(Request $request, Course $course)
    {
        $data = $request->validate([
            'front_text' => 'required|string|max:1000',
            'back_text' => 'required|string|max:1000',
        ]);

        // Admin-authored cards are approved on creation -- the admin *is*
        // the reviewer here. The pending/rejected states exist for the
        // auto-generated pipeline the flashcards table was designed for
        // (source_note_id/source_lesson_id, is_auto_generated) -- not
        // built yet, so nothing ever lands as 'pending' today.
        $course->flashcards()->create($data + [
            'status' => 'approved',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return back()->with('success', 'Flashcard added.');
    }

    public function update(Request $request, Course $course, Flashcard $flashcard)
    {
        $flashcard->update($request->validate([
            'front_text' => 'required|string|max:1000',
            'back_text' => 'required|string|max:1000',
        ]));

        return back()->with('success', 'Flashcard updated.');
    }

    public function setStatus(Request $request, Course $course, Flashcard $flashcard)
    {
        $data = $request->validate(['status' => 'required|in:approved,rejected']);

        $flashcard->update([
            'status' => $data['status'],
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return back()->with('success', $data['status'] === 'approved' ? 'Flashcard approved.' : 'Flashcard rejected.');
    }

    public function destroy(Course $course, Flashcard $flashcard)
    {
        $flashcard->delete();

        return back()->with('success', 'Flashcard removed.');
    }
}
