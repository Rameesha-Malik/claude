import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import Icon from '@/Components/Icon';
import StudentLayout from '@/Layouts/StudentLayout';

interface SubjectOption { id: number; name: string; questions_count: number }
interface TopicOption { id: number; subject_id: number; name: string }
interface CourseInfo { id: number; title: string; slug: string }
interface HistoryItem {
    id: number; subject: string | null; topic: string | null; difficulty: string | null;
    question_count: number; created_at: string; attempt_id: number | null; percentage: string | null;
}
interface Props {
    subjects: SubjectOption[]; topics: TopicOption[]; hasAccess: boolean; freeTrialMax: number; course?: CourseInfo | null;
    history?: HistoryItem[];
}

const inputClass = 'w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-primary focus:shadow-glow focus:outline-none';

function scoreTone(pct: number): string {
    if (pct >= 70) return 'bg-success-bg text-success';
    if (pct >= 50) return 'bg-warning-bg text-warning';
    return 'bg-danger-bg text-danger';
}

// UWorld's "Tests" tab, folded into this same page rather than a separate
// nav entry/URL -- a student can see every quiz they've built, pick up an
// unsubmitted one, retake with a fresh random pick of the same filters, or
// clear out old ones, all right under the builder that made them.
function TestHistory({ history }: { history: HistoryItem[] }) {
    function destroy(id: number) {
        if (confirm('Remove this from your test history? This cannot be undone.')) {
            router.delete(`/portal/custom-quiz/${id}`, { preserveScroll: true });
        }
    }

    if (history.length === 0) return null;

    return (
        <div className="mx-auto mt-8 max-w-lg">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-text-muted">Your Past Tests</h2>
            <div className="space-y-3">
                {history.map((h) => (
                    <div key={h.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-text">
                                {h.subject ?? 'Any subject'}{h.topic ? ` / ${h.topic}` : ''}
                            </p>
                            <p className="text-xs text-text-muted">
                                {h.question_count} question{h.question_count === 1 ? '' : 's'}
                                {h.difficulty ? ` · ${h.difficulty}` : ''} · {new Date(h.created_at).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-2">
                            {h.percentage !== null ? (
                                <Link href={`/portal/attempts/${h.attempt_id}`} className={`rounded-full px-2.5 py-1 text-xs font-bold ${scoreTone(Number(h.percentage))}`}>
                                    {h.percentage}%
                                </Link>
                            ) : (
                                <Link href={`/portal/custom-quiz/${h.id}`} className="rounded-full bg-primary-subtle px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary/20">
                                    Resume
                                </Link>
                            )}
                            <button
                                onClick={() => router.post(`/portal/custom-quiz/${h.id}/duplicate`)}
                                title="Retake with a fresh random pick"
                                className="rounded-full border border-border px-2.5 py-1 text-xs font-bold text-text-secondary hover:border-primary hover:text-primary"
                            >
                                Retake
                            </button>
                            <button onClick={() => destroy(h.id)} title="Remove" className="text-text-muted hover:text-danger">
                                <Icon d="M6 18L18 6M6 6l12 12" className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function CreateCustomQuiz({ subjects, topics, hasAccess, freeTrialMax, course = null, history = [] }: Props) {
    const form = useForm({
        subject_id: '' as number | '',
        topic_id: '' as number | '',
        difficulty: '' as '' | 'easy' | 'medium' | 'hard',
        question_count: hasAccess ? 10 : freeTrialMax,
        course_id: course?.id ?? ('' as number | ''),
    });

    // Topic is scoped to a subject -- only offer topics under whichever
    // subject is currently picked, same reasoning as the admin form.
    const availableTopics = topics.filter((t) => t.subject_id === form.data.subject_id);
    const maxQuestions = hasAccess ? 50 : freeTrialMax;

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post('/portal/custom-quiz');
    }

    return (
        <StudentLayout header="Custom Quiz">
            <Head title="Custom Quiz" />

            <div className="mx-auto max-w-lg rounded-3xl border border-border bg-surface p-6 sm:p-8">
                <h1 className="font-display text-2xl text-text">Build Your Own Quiz</h1>
                <p className="mt-1 text-sm text-text-secondary">
                    {course ? `For "${course.title}" -- ` : ''}Pick a subject (and optionally a topic within it), difficulty, and how many questions -- we'll
                    pull a fresh random set from the question bank.
                </p>

                {/* Client: a student with no quiz access used to hit a bare
                    "buy a course" wall and never actually see this feature.
                    Now they get a real, capped taste of it instead -- so
                    they try it and get curious, rather than being told to
                    buy something sight-unseen. */}
                {!hasAccess && (
                    <div className="mt-4 rounded-xl border border-dashed border-primary bg-primary-subtle px-4 py-3 text-sm text-text">
                        <span className="font-bold uppercase tracking-wide text-primary">Free Preview</span>: up to {freeTrialMax} questions per
                        quiz. {course ? `Buy "${course.title}"` : 'Buy a course with quiz access'} to build full custom quizzes (up to 50 questions)
                        and save your results.{' '}
                        <Link href={course ? `/courses/${course.slug}` : '/courses'} className="font-bold text-primary hover:underline">
                            {course ? 'View Course' : 'Browse Courses'} &rarr;
                        </Link>
                    </div>
                )}

                <form onSubmit={submit} className="mt-6 space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-text">Subject</label>
                        <select
                            className={inputClass}
                            value={form.data.subject_id}
                            onChange={(e) => form.setData((prev) => ({ ...prev, subject_id: e.target.value ? Number(e.target.value) : '', topic_id: '' }))}
                        >
                            <option value="">Any subject</option>
                            {subjects.map((s) => (
                                <option key={s.id} value={s.id}>{s.name} ({s.questions_count} questions)</option>
                            ))}
                        </select>
                    </div>

                    {availableTopics.length > 0 && (
                        <div>
                            <label className="mb-1 block text-sm font-medium text-text">Topic</label>
                            <select className={inputClass} value={form.data.topic_id} onChange={(e) => form.setData('topic_id', e.target.value ? Number(e.target.value) : '')}>
                                <option value="">Any topic in this subject</option>
                                {availableTopics.map((t) => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="mb-1 block text-sm font-medium text-text">Difficulty</label>
                        <select className={inputClass} value={form.data.difficulty} onChange={(e) => form.setData('difficulty', e.target.value as typeof form.data.difficulty)}>
                            <option value="">Any difficulty</option>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-text">Number of questions</label>
                        <input
                            type="number"
                            min={1}
                            max={maxQuestions}
                            className={inputClass}
                            value={form.data.question_count}
                            onChange={(e) => form.setData('question_count', Math.min(Number(e.target.value), maxQuestions))}
                        />
                        {!hasAccess && (
                            <p className="mt-1 text-xs text-text-muted">Capped at {freeTrialMax} for the free preview.</p>
                        )}
                    </div>

                    {form.errors.question_count && <p className="text-sm text-danger">{form.errors.question_count}</p>}

                    <button
                        type="submit"
                        disabled={form.processing}
                        className="w-full rounded-full bg-primary py-3 text-sm font-bold uppercase tracking-wide text-on-primary shadow-sm hover:bg-primary-hover disabled:opacity-50"
                    >
                        {form.processing ? 'Building…' : 'Start Custom Quiz'}
                    </button>
                </form>
            </div>

            <TestHistory history={history} />
        </StudentLayout>
    );
}
