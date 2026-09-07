import { Head } from '@inertiajs/react';

interface CourseScore { course: string; avg: number }
interface SubjectStat { subject: string; accuracy: number; total: number }
interface PerfData {
    student: { name: string; email: string };
    overall_score: number;
    avg_score: number;
    pass_rate: number;
    lecture_percent: number;
    course_completion_percent: number;
    rank: number;
    total_students: number;
    percentile: number;
    score_by_course: CourseScore[];
    course_completion: { completed: number; in_progress: number };
    lectures: { completed: number; total: number };
    quizzes_attempted: number;
    courses_enrolled: number;
    courses_completed: number;
    strong_points: SubjectStat[];
    weak_points: SubjectStat[];
}
interface Props { data: PerfData; generatedAt: string }

function StatBox({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-xl border border-gray-300 p-3 text-center">
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
        </div>
    );
}

// Standalone, chrome-free document (no AdminLayout) -- meant to be printed
// or "Save as PDF" via the browser, not browsed. Client (WhatsApp): "...so
// that i can share with parents" -- a simpler, plainer summary than the
// full admin dashboard on a light background, since this is meant to be
// handed to someone outside the admin panel, not read on screen inside it.
export default function PerformanceReport({ data, generatedAt }: Props) {
    return (
        <div className="mx-auto max-w-3xl bg-white p-8 text-gray-900 print:p-0">
            <Head title={`${data.student.name} — Performance Report`} />
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                }
            `}</style>

            <div className="no-print mb-6 flex justify-end">
                <button
                    onClick={() => window.print()}
                    className="rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-teal-800"
                >
                    🖨️ Print / Save as PDF
                </button>
            </div>

            <div className="mb-6 flex items-center justify-between border-b-2 border-teal-700 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-teal-800">Lion Forces Academy</h1>
                    <p className="text-sm text-gray-500">Student Performance Report</p>
                </div>
                <p className="text-xs text-gray-400">Generated {generatedAt}</p>
            </div>

            <div className="mb-6">
                <h2 className="text-xl font-bold">{data.student.name}</h2>
                <p className="text-sm text-gray-500">{data.student.email}</p>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatBox label="Overall Score" value={`${data.overall_score}%`} />
                <StatBox label="Avg Quiz Score" value={`${data.avg_score}%`} />
                <StatBox label="Quiz Pass Rate" value={`${data.pass_rate}%`} />
                <StatBox label="Course Completion" value={`${data.course_completion_percent}%`} />
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatBox label="Rank" value={`#${data.rank} of ${data.total_students}`} />
                <StatBox label="Percentile" value={`${data.percentile}%`} />
                <StatBox label="Quizzes Attempted" value={data.quizzes_attempted} />
                <StatBox label="Lectures Done" value={`${data.lectures.completed}/${data.lectures.total}`} />
            </div>

            <div className="mb-6">
                <h3 className="mb-2 border-b border-gray-300 pb-1 font-bold text-gray-800">Courses</h3>
                <p className="mb-2 text-sm text-gray-600">
                    Enrolled in {data.courses_enrolled} course{data.courses_enrolled === 1 ? '' : 's'}, completed {data.courses_completed}.
                </p>
                {data.score_by_course.length === 0 ? (
                    <p className="text-sm text-gray-500">No quiz activity yet.</p>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-gray-300 text-xs uppercase text-gray-500">
                                <th className="py-1.5">Course</th>
                                <th className="py-1.5 text-right">Average Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.score_by_course.map((c) => (
                                <tr key={c.course} className="border-b border-gray-100">
                                    <td className="py-1.5">{c.course}</td>
                                    <td className="py-1.5 text-right font-semibold">{c.avg}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="mb-6 grid gap-6 sm:grid-cols-2">
                <div>
                    <h3 className="mb-2 border-b border-gray-300 pb-1 font-bold text-gray-800">Strong Subjects</h3>
                    {data.strong_points.length === 0 ? (
                        <p className="text-sm text-gray-500">None identified yet.</p>
                    ) : (
                        <ul className="space-y-1 text-sm">
                            {data.strong_points.map((s) => (
                                <li key={s.subject} className="flex justify-between">
                                    <span>{s.subject}</span><span className="font-semibold text-green-700">{s.accuracy}%</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div>
                    <h3 className="mb-2 border-b border-gray-300 pb-1 font-bold text-gray-800">Needs Improvement</h3>
                    {data.weak_points.length === 0 ? (
                        <p className="text-sm text-gray-500">None identified yet.</p>
                    ) : (
                        <ul className="space-y-1 text-sm">
                            {data.weak_points.map((s) => (
                                <li key={s.subject} className="flex justify-between">
                                    <span>{s.subject}</span><span className="font-semibold text-red-700">{s.accuracy}%</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <p className="mt-10 border-t border-gray-200 pt-4 text-center text-xs text-gray-400">
                Lion Forces Academy — automatically generated performance summary.
            </p>
        </div>
    );
}
