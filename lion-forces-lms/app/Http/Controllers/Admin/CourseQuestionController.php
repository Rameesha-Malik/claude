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
 */
class CourseQuestionController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->get('status', 'unanswered');

        $questions = CourseQuestion::with(['user:id,name,email', 'course:id,title,slug', 'lesson:id,title', 'replies.admin:id,name'])
            ->when($status !== 'all', fn ($q) => $q->where('status', $status))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/QA/Index', [
            'questions' => $questions,
            'status' => $status,
            'unansweredCount' => CourseQuestion::where('status', 'unanswered')->count(),
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
