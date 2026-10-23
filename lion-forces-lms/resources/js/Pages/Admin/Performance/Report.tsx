import { Head } from '@inertiajs/react';
import Icon from '@/Components/Icon';

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
            <Head title={`${data.student.name}: Performance Report`} />
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                }
            `}</style>

            <div className="no-print mb-6 flex justify-end">
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-teal-800"
                >
                    <Icon d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" className="h-4 w-4" /> Print / Save as PDF
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
                Lion Forces Academy: automatically generated performance summary.
            </p>
        </div>
    );
}
