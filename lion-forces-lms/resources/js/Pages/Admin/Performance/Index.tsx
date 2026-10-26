import { Head, Link, router } from '@inertiajs/react';
import Icon from '@/Components/Icon';
import AdminLayout from '@/Layouts/AdminLayout';

const ICONS = {
    graduationCap: 'M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443',
    printer: 'M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z',
    users: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z',
    percentBadge: 'M9 9h.008v.008H9V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM15 15h.008v.008H15V15zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM21 12a9 9 0 11-18 0 9 9 0 0118 0zM8.25 15.75l7.5-7.5',
    hash: 'M5.25 8.25h13.5m-13.5 7.5h13.5m-9-15L7.5 21m6-18L10.5 21',
    target: 'M12 9v6m-3-3h6m6 0a9 9 0 11-18 0 9 9 0 0118 0z',
    globe: 'M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A8.959 8.959 0 0121 12a8.959 8.959 0 01-1.157 4.418m-15.686-8.836A8.959 8.959 0 003 12a8.959 8.959 0 001.157 4.418m15.686 0A8.963 8.963 0 0112 21m7.843-4.582A8.963 8.963 0 0112 21m0 0',
    trendUp: 'M2.25 18L9 11.25l4.306 4.306a11.95 11.95 0 015.814-5.518l2.74-1.22m0 0l-5.94-2.281m5.94 2.28l-2.28 5.941',
    chartBar: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
    clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    bookOpen: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
    signal: 'M9.348 14.652a3.75 3.75 0 010-5.304m5.304 0a3.75 3.75 0 010 5.304m-7.425 2.121a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.807-3.808-9.98 0-13.788m13.788 0c3.808 3.807 3.808 9.98 0 13.788M12 12h.008v.008H12V12z',
    pencilSquare: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10',
    academicStack: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422A12.083 12.083 0 0112 20.417a12.083 12.083 0 01-6.16-9.839L12 14zm0 0L3.33 9.44',
    checkCircle: 'M9 12.75L11.25 15 15 9.75m-3-7.5a9 9 0 100 18 9 9 0 000-18z',
    medal: 'M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0',
    exclamationTriangle: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
    lightBulb: 'M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18',
};

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

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-3xl border border-border bg-surface p-5">
            <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-text-muted">
                <span className="text-primary">{icon}</span> {title}
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

function StatTile({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
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

            <div className="mb-6 flex flex-wrap items-end justify-between gap-4 rounded-3xl border border-border bg-surface p-5">
                <div className="min-w-[220px] flex-1">
                    <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-text-muted">
                        <Icon d={ICONS.graduationCap} className="h-4 w-4" /> Select student
                    </label>
                    <select
                        value={selectedStudentId ?? ''}
                        onChange={(e) => changeStudent(e.target.value)}
                        className="w-full max-w-md rounded-lg border border-border px-3 py-2.5 text-sm"
                    >
                        {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
                    </select>
                </div>
                {data && (
                    <Link
                        href={`/admin/performance/${data.student.id}/report`}
                        target="_blank"
                        className="flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-primary hover:bg-primary-subtle"
                    >
                        <Icon d={ICONS.printer} className="h-4 w-4" /> Print Report (PDF)
                    </Link>
                )}
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
                            <h2 className="mt-4 font-display text-2xl sm:text-3xl">{data.student.name}: Overall score</h2>
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
                            <Icon d={ICONS.users} className="h-4 w-4" /> Where this student stands
                        </p>
                        <div className="grid gap-4 sm:grid-cols-4">
                            <StatTile icon={<Icon d={ICONS.percentBadge} className="h-5 w-5" />} value={`${data.percentile}%`} label="Percentile" />
                            <StatTile icon={<Icon d={ICONS.hash} className="h-5 w-5" />} value={`#${data.rank}`} label={`Rank (of ${data.total_students})`} />
                            <StatTile icon={<Icon d={ICONS.target} className="h-5 w-5" />} value={`${data.avg_score}%`} label="Student avg score" />
                            <StatTile icon={<Icon d={ICONS.globe} className="h-5 w-5" />} value={`${data.system_average}%`} label="System average" />
                        </div>
                    </div>

                    <div className="mb-6 grid gap-6 lg:grid-cols-2">
                        <Card icon={<Icon d={ICONS.trendUp} className="h-4 w-4" />} title="Quiz score trend">
                            <TrendChart points={data.quiz_score_trend} />
                        </Card>
                        <Card icon={<Icon d={ICONS.chartBar} className="h-4 w-4" />} title="Score by course">
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
                        <Card icon={<Icon d={ICONS.clock} className="h-4 w-4" />} title="Course completion">
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
                        <Card icon={<Icon d={ICONS.target} className="h-4 w-4" />} title="Quiz pass rate">
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
                        <Card icon={<Icon d={ICONS.bookOpen} className="h-4 w-4" />} title="Lectures completed">
                            <div className="h-2.5 overflow-hidden rounded-full bg-surface-sunken">
                                <div className="h-full rounded-full bg-primary" style={{ width: `${data.lectures.total > 0 ? (data.lectures.completed / data.lectures.total) * 100 : 0}%` }} />
                            </div>
                            <p className="mt-2 text-sm text-text-secondary">
                                {data.lectures.completed} / {data.lectures.total} ({data.lectures.total > 0 ? Math.round((data.lectures.completed / data.lectures.total) * 100) : 0}%)
                            </p>
                        </Card>
                        <Card icon={<Icon d={ICONS.signal} className="h-4 w-4" />} title="Quiz attempts per week">
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
                        <StatTile icon={<Icon d={ICONS.pencilSquare} className="h-5 w-5" />} value={data.quizzes_attempted} label="Quizzes attempted" />
                        <StatTile icon={<Icon d={ICONS.percentBadge} className="h-5 w-5" />} value={`${data.avg_score}%`} label="Average quiz score" />
                        <StatTile icon={<Icon d={ICONS.academicStack} className="h-5 w-5" />} value={data.courses_enrolled} label="Courses enrolled" />
                        <StatTile icon={<Icon d={ICONS.checkCircle} className="h-5 w-5" />} value={data.courses_completed} label="Courses completed" />
                        <StatTile icon={<Icon d={ICONS.bookOpen} className="h-5 w-5" />} value={`${data.lectures.completed}/${data.lectures.total}`} label="Lectures" />
                    </div>

                    <div className="mb-6 grid gap-6 lg:grid-cols-2">
                        <Card icon={<Icon d={ICONS.medal} className="h-4 w-4" />} title="Strong points">
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
                        <Card icon={<Icon d={ICONS.exclamationTriangle} className="h-4 w-4" />} title="Weak points &amp; how to overcome">
                            {data.weak_points.length === 0 ? (
                                <p className="text-sm text-text-secondary">No weak points identified.</p>
                            ) : (
                                <ul className="space-y-2 text-sm">
                                    {data.weak_points.map((s) => (
                                        <li key={s.subject} className="rounded-xl bg-danger-bg px-3 py-2 text-danger">
                                            <span className="font-bold">{s.subject}</span> ({s.accuracy}% accuracy). Revise this subject in the Question Bank and retake a practice test.
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card>
                    </div>

                    <Card icon={<Icon d={ICONS.lightBulb} className="h-4 w-4" />} title="Suggestions to improve">
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
