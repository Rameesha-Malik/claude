import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

interface ConfigRow {
    id: number;
    user: { name: string; email: string } | null;
    subject: string | null;
    topic: string | null;
    difficulty: string | null;
    question_count: number;
    created_at: string;
    percentage: string | null;
}
interface CourseRow { id: number; title: string; quizzes_enabled: boolean }
interface Props {
    configs: ConfigRow[];
    enabled: boolean;
    stats: { total_generated: number; subjects_with_questions: number; topics_with_questions: number };
    courses: CourseRow[];
}

// Client: couldn't find anywhere in the admin panel describing or showing
// this feature -- there wasn't one. This page is the single place that
// now exists for it: what the flow is, whether it's on, who's actually
// using it, and where the two real controls for it live (Content Library
// for the question bank itself, Settings for the on/off switch). Doesn't
// duplicate either of those screens, just points at them.
export default function AdminCustomQuizIndex({ configs, enabled, stats, courses }: Props) {
    const lockedCourses = courses.filter((c) => !c.quizzes_enabled);
    return (
        <AdminLayout header="Custom Quiz">
            <Head title="Custom Quiz" />

            <div className="mb-6 rounded-2xl border border-border bg-surface p-5">
                <h2 className="mb-2 font-bold text-text">How this works</h2>
                <p className="text-sm text-text-secondary">
                    A student picks a Subject (and optionally a Topic within it), a Difficulty, and how many
                    questions -- the system pulls a fresh random set straight from the shared Question Bank. No
                    admin needs to hand-build a quiz for every combination.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-text-secondary">
                    <span className="rounded-full bg-primary-subtle px-3 py-1 font-bold text-primary">1. Question Bank</span>
                    <span>&rarr;</span>
                    <span className="rounded-full bg-primary-subtle px-3 py-1 font-bold text-primary">2. Student enrolls in a quiz-enabled course</span>
                    <span>&rarr;</span>
                    <span className="rounded-full bg-primary-subtle px-3 py-1 font-bold text-primary">3. Student creates a test</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${enabled ? 'bg-success-bg text-success' : 'bg-surface-sunken text-text-muted'}`}>
                        Feature is {enabled ? 'ON' : 'OFF'}
                    </span>
                    <Link href="/admin/settings" className="text-xs font-bold uppercase text-primary hover:underline">
                        Change in Settings &rarr;
                    </Link>
                    <Link href="/admin/content-library" className="text-xs font-bold uppercase text-primary hover:underline">
                        Manage Subjects/Topics/Questions in Content Library &rarr;
                    </Link>
                </div>
            </div>

            <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-border bg-surface p-5">
                    <div className="font-display text-3xl text-text">{stats.total_generated}</div>
                    <div className="text-sm text-text-secondary">Quizzes generated (all time)</div>
                </div>
                <div className="rounded-2xl border border-border bg-surface p-5">
                    <div className="font-display text-3xl text-text">{stats.subjects_with_questions}</div>
                    <div className="text-sm text-text-secondary">Subjects with questions</div>
                </div>
                <div className="rounded-2xl border border-border bg-surface p-5">
                    <div className="font-display text-3xl text-text">{stats.topics_with_questions}</div>
                    <div className="text-sm text-text-secondary">Topics with questions</div>
                </div>
            </div>

            <div className="mb-6 rounded-2xl border border-border bg-surface p-5">
                <h2 className="mb-1 font-bold text-text">Which Courses Let a Student In</h2>
                <p className="mb-4 text-sm text-text-secondary">
                    A student only reaches Custom Quiz through a course with its "quizzes" module switched on
                    (Course &rarr; Details &rarr; Modules). The question bank can be full, but if every course a
                    student bought has this off, they'll see "Custom Quiz is Locked" with nothing to pick from.
                </p>
                {lockedCourses.length > 0 && (
                    <p className="mb-3 rounded-lg bg-warning-bg px-3 py-2 text-xs font-bold uppercase text-warning">
                        {lockedCourses.length} course{lockedCourses.length === 1 ? '' : 's'} currently locked out of Custom Quiz
                    </p>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[480px] text-left text-sm">
                        <thead className="text-xs uppercase tracking-wide text-text-muted">
                            <tr>
                                <th className="pb-2">Course</th>
                                <th className="pb-2">Quizzes Module</th>
                                <th className="pb-2"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {courses.map((c) => (
                                <tr key={c.id}>
                                    <td className="py-2 text-text">{c.title}</td>
                                    <td className="py-2">
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${c.quizzes_enabled ? 'bg-success-bg text-success' : 'bg-surface-sunken text-text-muted'}`}>
                                            {c.quizzes_enabled ? 'On' : 'Off'}
                                        </span>
                                    </td>
                                    <td className="py-2 text-right">
                                        <Link href={`/admin/courses/${c.id}/edit`} className="text-xs font-bold uppercase text-primary hover:underline">
                                            {c.quizzes_enabled ? 'Manage' : 'Turn On'} &rarr;
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {courses.length === 0 && <p className="text-sm text-text-secondary">No courses yet.</p>}
                </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5">
                <h2 className="mb-4 font-bold text-text">Recent Custom Quizzes (latest 50)</h2>
                {configs.length === 0 ? (
                    <p className="text-sm text-text-secondary">No student has generated one yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px] text-left text-sm">
                            <thead className="text-xs uppercase tracking-wide text-text-muted">
                                <tr>
                                    <th className="pb-2">Student</th>
                                    <th className="pb-2">Subject / Topic</th>
                                    <th className="pb-2">Difficulty</th>
                                    <th className="pb-2">Questions</th>
                                    <th className="pb-2">Score</th>
                                    <th className="pb-2">When</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {configs.map((c) => (
                                    <tr key={c.id}>
                                        <td className="py-2 text-text">{c.user?.name ?? '—'}</td>
                                        <td className="py-2 text-text-secondary">
                                            {c.subject ?? 'Any subject'}{c.topic ? ` — ${c.topic}` : ''}
                                        </td>
                                        <td className="py-2 text-text-secondary capitalize">{c.difficulty ?? 'Any'}</td>
                                        <td className="py-2 text-text-secondary">{c.question_count}</td>
                                        <td className="py-2 text-text-secondary">{c.percentage !== null ? `${c.percentage}%` : 'Not submitted'}</td>
                                        <td className="py-2 text-text-muted">{new Date(c.created_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
