<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CourseQuestion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Students can ask a private, per-course question (Student\CourseController
 * @askQuestion) but nothing on the admin side ever surfaced or answered
 * them -- this closes that loop.
 *
 * "Lecture Q&A" / "Course Q&A" (admin reference screenshot) are the same
 * CourseQuestion table and this same index() -- a question with a
 * lesson_id was asked from a lecture, one without was asked generally
 * about the course -- `type` just pre-filters which one a nav entry
 * lands on, rather than splitting into two controllers/tables.
 */
class CourseQuestionController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->get('status', 'unanswered');
        $type = $request->get('type', 'all'); // 'lecture' | 'course' | 'all'

        $questions = CourseQuestion::with(['user:id,name,email', 'course:id,title,slug', 'lesson:id,title', 'replies.admin:id,name'])
            ->when($status !== 'all', fn ($q) => $q->where('status', $status))
            ->when($type === 'lecture', fn ($q) => $q->whereNotNull('lesson_id'))
            ->when($type === 'course', fn ($q) => $q->whereNull('lesson_id'))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/QA/Index', [
            'questions' => $questions,
            'status' => $status,
            'type' => $type,
            'unansweredCount' => CourseQuestion::where('status', 'unanswered')
                ->when($type === 'lecture', fn ($q) => $q->whereNotNull('lesson_id'))
                ->when($type === 'course', fn ($q) => $q->whereNull('lesson_id'))
                ->count(),
        ]);
    }

    public function reply(Request $request, CourseQuestion $question)
    {
        $data = $request->validate([
            'reply_text' => 'required|string|max:2000',
        ]);

        $question->replies()->create([
            'admin_id' => $request->user()->id,
            'reply_text' => $data['reply_text'],
        ]);
        $question->update(['status' => 'answered']);

        return back()->with('success', 'Reply sent.');
    }
}
