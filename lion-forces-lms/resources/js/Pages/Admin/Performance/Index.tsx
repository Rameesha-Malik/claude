import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

interface StudentOpt { id: number; name: string; email: string }
interface TrendPoint { date: string; score: number }
interface CourseScore { course: string; avg: number }
interface WeekPoint { label: string; count: number }
interface SubjectStat { subject: string; accuracy: number; total: number }
interface PerfData {
    student: StudentOpt;
    overall_score: number;
    avg_score: number;
    pass_rate: number;
    lecture_percent: number;
    course_completion_percent: number;
    rank: number;
    total_students: number;
    percentile: number;
    system_average: number;
    quiz_score_trend: TrendPoint[];
    score_by_course: CourseScore[];
    course_completion: { completed: number; in_progress: number };
    lectures: { completed: number; total: number };
    attempts_per_week: WeekPoint[];
    quizzes_attempted: number;
    courses_enrolled: number;
    courses_completed: number;
    strong_points: SubjectStat[];
    weak_points: SubjectStat[];
}
interface Props {
    students: StudentOpt[];
    selectedStudentId: number | null;
    data: PerfData | null;
}

function Card({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-3xl border border-border bg-surface p-5">
            <p className="mb-4 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-text-muted">
                <span>{icon}</span> {title}
            </p>
            {children}
        </div>
    );
}

// Simple real line chart -- no charting library in this project, an SVG
// polyline is enough for a handful of attempt points and stays
// dependency-free (same convention as the Home page's mock progress SVG).
function TrendChart({ points }: { points: TrendPoint[] }) {
    if (points.length === 0) {
        return <p className="flex h-40 items-center justify-center text-sm text-text-secondary">No quiz attempts yet.</p>;
    }
    const w = 100;
    const h = 40;
    const coords = points.map((p, i) => {
        const x = points.length > 1 ? (i / (points.length - 1)) * w : w / 2;
        const y = h - (p.score / 100) * h;
        return `${x},${y}`;
    });
    return (
        <div>
            <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-40 w-full">
                <polyline points={coords.join(' ')} fill="none" stroke="var(--color-primary)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                {coords.map((c, i) => {
                    const [x, y] = c.split(',');
                    return <circle key={i} cx={x} cy={y} r="1.2" fill="var(--color-primary)" />;
                })}
            </svg>
            <div className="mt-1 flex justify-between text-[0.65rem] text-text-muted">
                <span>{points[0].date}</span>
                <span>{points[points.length - 1].date}</span>
            </div>
        </div>
    );
}

function StatTile({ icon, value, label }: { icon: string; value: string | number; label: string }) {
    return (
        <div className="rounded-2xl border border-border bg-surface p-4 text-center">
            <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary-subtle text-primary">{icon}</div>
            <p className="font-display text-xl text-text">{value}</p>
            <p className="text-xs text-text-muted">{label}</p>
        </div>
    );
}

export default function PerformanceIndex({ students, selectedStudentId, data }: Props) {
    function changeStudent(id: string) {
        router.get('/admin/performance', { student_id: id }, { preserveState: true });
    }

    const bottomPercent = data ? Math.round(100 - data.percentile) : 0;

    return (
        <AdminLayout header="Performance">
            <Head title="Performance" />

            <div className="mb-6">
                <h1 className="font-display text-3xl text-text">Performance</h1>
                <p className="mt-1 text-sm text-text-secondary">View algorithm-based performance, charts, and suggestions for any student.</p>
            </div>

            <div className="mb-6 rounded-3xl border border-border bg-surface p-5">
                <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-text-muted">
                    🎓 Select student
                </label>
                <select
                    value={selectedStudentId ?? ''}
                    onChange={(e) => changeStudent(e.target.value)}
                    className="w-full max-w-md rounded-lg border border-border px-3 py-2.5 text-sm"
                >
                    {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
                </select>
            </div>

            {!data ? (
                <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                    No students to show yet.
                </div>
            ) : (
                <>
                    <div className="relative mb-6 flex flex-wrap items-center justify-between gap-6 overflow-hidden rounded-3xl bg-gradient-to-br from-secondary to-teal-800 p-6 text-white sm:p-8">
                        <div>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                                Performance Index
                            </span>
                            <h2 className="mt-4 font-display text-2xl sm:text-3xl">{data.student.name} — Overall score</h2>
                            <p className="mt-2 max-w-lg text-sm text-teal-100">
                                Lion Forces Academy algorithm-based index from quizzes, pass rate, lectures &amp; course completion.
                            </p>
                        </div>
                        <div
                            className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full"
                            style={{ background: `conic-gradient(white ${data.overall_score * 3.6}deg, rgba(255,255,255,0.25) 0)` }}
                        >
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-xl font-bold">
                                {data.overall_score}
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-text-muted">
                            👥 Where this student stands
                        </p>
                        <div className="grid gap-4 sm:grid-cols-4">
                            <StatTile icon="📊" value={`${data.percentile}%`} label="Percentile" />
                            <StatTile icon="#" value={`#${data.rank}`} label={`Rank (of ${data.total_students})`} />
                            <StatTile icon="🎯" value={`${data.avg_score}%`} label="Student avg score" />
                            <StatTile icon="🌐" value={`${data.system_average}%`} label="System average" />
                        </div>
                    </div>

                    <div className="mb-6 grid gap-6 lg:grid-cols-2">
                        <Card icon="📈" title="Quiz score trend">
                            <TrendChart points={data.quiz_score_trend} />
                        </Card>
                        <Card icon="📊" title="Score by course">
                            {data.score_by_course.length === 0 ? (
                                <p className="flex h-40 items-center justify-center text-sm text-text-secondary">No course quiz data yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {data.score_by_course.map((c) => (
                                        <div key={c.course}>
                                            <div className="mb-1 flex justify-between text-sm">
                                                <span className="text-text">{c.course}</span>
                                                <span className="font-bold text-primary">{c.avg}%</span>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full bg-surface-sunken">
                                                <div className="h-full rounded-full bg-primary" style={{ width: `${c.avg}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>

                    <div className="mb-6 grid gap-6 lg:grid-cols-2">
                        <Card icon="🕐" title="Course completion">
                            <div className="flex items-center gap-6">
                                <div
                                    className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full"
                                    style={{ background: `conic-gradient(var(--color-success) ${data.course_completion_percent * 3.6}deg, var(--color-warning) 0)` }}
                                >
                                    <div className="h-14 w-14 rounded-full bg-surface" />
                                </div>
                                <div className="space-y-1.5 text-sm">
                                    <p className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-success" /> Completed: <b>{data.course_completion.completed}</b></p>
                                    <p className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-warning" /> In progress: <b>{data.course_completion.in_progress}</b></p>
                                </div>
                            </div>
                        </Card>
                        <Card icon="🎯" title="Quiz pass rate">
                            <div className="flex items-center gap-6">
                                <div
                                    className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full"
                                    style={{ background: `conic-gradient(var(--color-primary) ${data.pass_rate * 3.6}deg, var(--color-border) 0)` }}
                                >
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-sm font-bold text-text">{data.pass_rate}%</div>
                                </div>
                                <p className="text-sm text-text-secondary">Percentage of quiz attempts that met the passing marks.</p>
                            </div>
                        </Card>
                    </div>

                    <div className="mb-6 grid gap-6 lg:grid-cols-2">
                        <Card icon="📖" title="Lectures completed">
                            <div className="h-2.5 overflow-hidden rounded-full bg-surface-sunken">
                                <div className="h-full rounded-full bg-primary" style={{ width: `${data.lectures.total > 0 ? (data.lectures.completed / data.lectures.total) * 100 : 0}%` }} />
                            </div>
                            <p className="mt-2 text-sm text-text-secondary">
                                {data.lectures.completed} / {data.lectures.total} ({data.lectures.total > 0 ? Math.round((data.lectures.completed / data.lectures.total) * 100) : 0}%)
                            </p>
                        </Card>
                        <Card icon="📶" title="Quiz attempts per week">
                            <div className="flex h-24 items-end gap-1.5">
                                {data.attempts_per_week.map((w, i) => {
                                    const max = Math.max(...data.attempts_per_week.map((x) => x.count), 1);
                                    return (
                                        <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                                            <div className="w-full rounded-t bg-primary" style={{ height: `${Math.max((w.count / max) * 100, w.count > 0 ? 8 : 2)}%` }} title={`${w.label}: ${w.count}`} />
                                            <span className="text-[0.6rem] text-text-muted">{w.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    </div>

                    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
                        <StatTile icon="📝" value={data.quizzes_attempted} label="Quizzes attempted" />
                        <StatTile icon="%" value={`${data.avg_score}%`} label="Average quiz score" />
                        <StatTile icon="📚" value={data.courses_enrolled} label="Courses enrolled" />
                        <StatTile icon="✅" value={data.courses_completed} label="Courses completed" />
                        <StatTile icon="📖" value={`${data.lectures.completed}/${data.lectures.total}`} label="Lectures" />
                    </div>

                    <div className="mb-6 grid gap-6 lg:grid-cols-2">
                        <Card icon="🏅" title="Strong points">
                            {data.strong_points.length === 0 ? (
                                <p className="text-sm text-text-secondary">No strong points yet.</p>
                            ) : (
                                <ul className="space-y-2 text-sm">
                                    {data.strong_points.map((s) => (
                                        <li key={s.subject} className="flex justify-between rounded-xl bg-success-bg px-3 py-2 text-success">
                                            <span>{s.subject}</span><span className="font-bold">{s.accuracy}%</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card>
                        <Card icon="⚠️" title="Weak points &amp; how to overcome">
                            {data.weak_points.length === 0 ? (
                                <p className="text-sm text-text-secondary">No weak points identified.</p>
                            ) : (
                                <ul className="space-y-2 text-sm">
                                    {data.weak_points.map((s) => (
                                        <li key={s.subject} className="rounded-xl bg-danger-bg px-3 py-2 text-danger">
                                            <span className="font-bold">{s.subject}</span> ({s.accuracy}% accuracy) — revise this subject in the Content Library and retake a practice test.
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card>
                    </div>

                    <Card icon="💡" title="Suggestions to improve">
                        <div className="rounded-2xl border border-primary bg-primary-subtle p-4">
                            <p className="font-bold text-text">
                                {data.quizzes_attempted === 0 ? 'Take some quizzes' : data.percentile >= 50 ? "You're doing well" : 'You can rise in the ranks'}
                            </p>
                            <p className="mt-1 text-sm text-text-secondary">
                                {data.quizzes_attempted === 0
                                    ? "This student hasn't attempted any quizzes yet. Starting a practice test will build their performance profile."
                                    : data.percentile >= 50
                                        ? `You're ahead of ${data.percentile}% of students. Keep up consistent practice to climb even further.`
                                        : `You are in the bottom ${bottomPercent}% of students. Consistent practice and completing lectures will help you improve.`}
                            </p>
                        </div>
                    </Card>
                </>
            )}
        </AdminLayout>
    );
}
