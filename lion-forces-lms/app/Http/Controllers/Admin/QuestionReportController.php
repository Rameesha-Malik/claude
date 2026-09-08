<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\QuestionReport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * "Reported questions" (admin reference screenshot). Reports come in from
 * QuestionCheckController::report -- one shared endpoint used by every
 * attempt flow -- so this is just the admin-side review queue for that
 * single table.
 */
class QuestionReportController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->get('status', 'pending');

        return Inertia::render('Admin/QuestionReports/Index', [
            'reports' => QuestionReport::with(['question:id,question_text,subject_id', 'question.subject:id,name', 'user:id,name,email'])
                ->when($status !== 'all', fn ($q) => $q->where('status', $status))
                ->latest()
                ->paginate(15)
                ->withQueryString(),
            'status' => $status,
            'pendingCount' => QuestionReport::where('status', 'pending')->count(),
        ]);
    }

    public function resolve(Request $request, QuestionReport $report)
    {
        $report->update(['status' => 'resolved', 'resolved_by' => $request->user()->id, 'resolved_at' => now()]);

        return back()->with('success', 'Report marked resolved.');
    }

    public function dismiss(Request $request, QuestionReport $report)
    {
        $report->update(['status' => 'dismissed', 'resolved_by' => $request->user()->id, 'resolved_at' => now()]);

        return back()->with('success', 'Report dismissed.');
    }
}
