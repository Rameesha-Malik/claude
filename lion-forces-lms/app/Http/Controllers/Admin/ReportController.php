<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Payment;
use App\Models\TestAttempt;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        [$from, $to] = $this->dateRange($request);

        return Inertia::render('Admin/Reports/Index', [
            'filters' => $request->only(['from', 'to']),
            'student' => [
                'total' => User::where('user_type', 'student')->count(),
                'new' => User::where('user_type', 'student')->whereBetween('created_at', [$from, $to])->count(),
                'active' => User::where('user_type', 'student')->where('is_active', true)->count(),
                'inactive' => User::where('user_type', 'student')->where('is_active', false)->count(),
                'by_course' => Course::withCount('enrollments')->orderByDesc('enrollments_count')->limit(10)
                    ->get()->map(fn ($c) => ['title' => $c->title, 'enrollments' => $c->enrollments_count]),
            ],
            'course' => [
                'total_enrollments' => Enrollment::whereBetween('created_at', [$from, $to])->count(),
                'active_enrollments' => Enrollment::where('status', 'active')->count(),
                'completion_rate' => $this->completionRate(),
                'revenue' => Payment::where('status', 'verified')->whereBetween('created_at', [$from, $to])->sum('amount'),
            ],
            'test' => [
                'total_attempts' => TestAttempt::where('status', 'submitted')->whereBetween('created_at', [$from, $to])->count(),
                'average_score' => round(TestAttempt::where('status', 'submitted')->whereBetween('created_at', [$from, $to])->avg('percentage') ?? 0, 1),
                'pass_rate' => $this->passRate($from, $to),
                'most_missed' => $this->mostMissedQuestions(),
            ],
            'payment' => [
                'revenue' => Payment::where('status', 'verified')->whereBetween('created_at', [$from, $to])->sum('amount'),
                'pending' => Payment::where('status', 'pending')->count(),
                'successful' => Payment::where('status', 'verified')->whereBetween('created_at', [$from, $to])->count(),
                'refunded' => Payment::where('status', 'refunded')->count(),
            ],
        ]);
    }

    public function export(Request $request, string $type): StreamedResponse
    {
        [$from, $to] = $this->dateRange($request);

        $rows = match ($type) {
            'students' => User::where('user_type', 'student')
                ->select('name', 'email', 'is_active', 'created_at')
                ->get()
                ->map(fn ($u) => [$u->name, $u->email, $u->is_active ? 'Active' : 'Suspended', $u->created_at->toDateString()]),
            'courses' => Course::withCount('enrollments')->get()
                ->map(fn ($c) => [$c->title, $c->status, $c->enrollments_count, $c->base_price]),
            'tests' => TestAttempt::where('status', 'submitted')->whereBetween('created_at', [$from, $to])
                ->with('user:id,name')->get()
                ->map(fn ($a) => [$a->user?->name, $a->attemptable_type, $a->score, $a->total_marks, $a->percentage, $a->passed ? 'Pass' : 'Fail']),
            'payments' => Payment::whereBetween('created_at', [$from, $to])
                ->with('enrollment.user:id,name')->get()
                ->map(fn ($p) => [$p->enrollment?->user?->name, $p->method, $p->amount, $p->status, $p->created_at->toDateString()]),
            default => abort(404),
        };

        $headers = match ($type) {
            'students' => ['Name', 'Email', 'Status', 'Joined'],
            'courses' => ['Title', 'Status', 'Enrollments', 'Price'],
            'tests' => ['Student', 'Type', 'Score', 'Total Marks', 'Percentage', 'Result'],
            'payments' => ['Student', 'Method', 'Amount', 'Status', 'Date'],
        };

        return response()->streamDownload(function () use ($rows, $headers) {
            $out = fopen('php://output', 'w');
            fputcsv($out, $headers);
            foreach ($rows as $row) {
                fputcsv($out, $row);
            }
            fclose($out);
        }, "{$type}-report-".now()->format('Y-m-d').'.csv', ['Content-Type' => 'text/csv']);
    }

    private function dateRange(Request $request): array
    {
        return [
            $request->input('from') ? \Carbon\Carbon::parse($request->input('from'))->startOfDay() : now()->subDays(30)->startOfDay(),
            $request->input('to') ? \Carbon\Carbon::parse($request->input('to'))->endOfDay() : now()->endOfDay(),
        ];
    }

    private function completionRate(): float
    {
        $total = Enrollment::where('status', 'active')->count();
        if ($total === 0) {
            return 0;
        }

        // A rough proxy: enrollments where every lesson in the course has
        // been marked complete by that student. Fine for the current
        // scale; worth a scheduled snapshot job once enrollment volume
        // makes this query expensive (see report_snapshots table).
        $completed = DB::table('enrollments')
            ->join('courses', 'courses.id', '=', 'enrollments.course_id')
            ->where('enrollments.status', 'active')
            ->whereRaw('(select count(*) from lessons where lessons.course_id = courses.id) > 0')
            ->whereRaw('(select count(*) from lessons where lessons.course_id = courses.id) = (
                select count(*) from lesson_progress
                join lessons on lessons.id = lesson_progress.lesson_id
                where lessons.course_id = courses.id
                and lesson_progress.user_id = enrollments.user_id
                and lesson_progress.is_completed = 1
            )')
            ->count();

        return round(($completed / $total) * 100, 1);
    }

    private function passRate(string|\Carbon\Carbon $from, string|\Carbon\Carbon $to): float
    {
        $submitted = TestAttempt::where('status', 'submitted')->whereBetween('created_at', [$from, $to]);
        $total = (clone $submitted)->count();

        return $total > 0 ? round((clone $submitted)->where('passed', true)->count() / $total * 100, 1) : 0;
    }

    private function mostMissedQuestions(): array
    {
        return DB::table('test_attempt_answers')
            ->join('question_bank', 'question_bank.id', '=', 'test_attempt_answers.question_id')
            ->where('test_attempt_answers.is_correct', false)
            ->select('question_bank.question_text', DB::raw('count(*) as miss_count'))
            ->groupBy('question_bank.id', 'question_bank.question_text')
            ->orderByDesc('miss_count')
            ->limit(5)
            ->get()
            ->map(fn ($r) => ['question' => $r->question_text, 'misses' => $r->miss_count])
            ->toArray();
    }
}
