import { Head, Link, router, useForm } from '@inertiajs/react';
import axios from 'axios';
import { FormEvent, useEffect, useState } from 'react';
import Icon from '@/Components/Icon';
import StudentLayout from '@/Layouts/StudentLayout';

interface SubjectOption { id: number; name: string; questions_count: number }
interface TopicOption { id: number; subject_id: number; name: string }
interface CourseInfo { id: number; title: string; slug: string }
interface HistoryItem {
    id: number; name: string | null; subject: string | null; topic: string | null; difficulty: string | null;
    question_count: number; mode: 'tutor' | 'timed'; created_at: string; attempt_id: number | null; percentage: string | null;
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
                                {h.name ?? `${h.subject ?? 'Any subject'}${h.topic ? ` / ${h.topic}` : ''}`}
                            </p>
                            <p className="text-xs text-text-muted">
                                {h.question_count} question{h.question_count === 1 ? '' : 's'}
                                {h.difficulty ? ` · ${h.difficulty}` : ''}
                                {h.mode === 'timed' ? ' · Timed' : ''} · {new Date(h.created_at).toLocaleDateString()}
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
        name: '',
        subject_ids: [] as number[],
        topic_ids: [] as number[],
        difficulty: '' as '' | 'easy' | 'medium' | 'hard',
        question_count: hasAccess ? 10 : freeTrialMax,
        course_id: course?.id ?? ('' as number | ''),
        mode: 'tutor' as 'tutor' | 'timed',
        timer_enabled: false,
        filter: '' as '' | 'unused' | 'wrong' | 'correct' | 'favorited',
    });

    // Topic is scoped to whichever subjects are picked -- same reasoning
    // as the admin question form's topic dropdown, just extended to
    // "any of the selected subjects" now that more than one can be picked.
    const availableTopics = topics.filter((t) => form.data.subject_ids.includes(t.subject_id));
    const maxQuestions = hasAccess ? 50 : freeTrialMax;

    // Live "X questions found" preview as filters change -- UWorld's own
    // Create Test screen shows this before the student ever hits create,
    // so they know if their filters are too narrow. Debounced since every
    // checkbox click would otherwise fire its own request.
    const [matchingCount, setMatchingCount] = useState<number | null>(null);
    const [countLoading, setCountLoading] = useState(false);

    useEffect(() => {
        setCountLoading(true);
        const t = setTimeout(() => {
            axios
                .post('/portal/custom-quiz/preview-count', {
                    subject_ids: form.data.subject_ids,
                    topic_ids: form.data.topic_ids,
                    difficulty: form.data.difficulty || undefined,
                    course_id: form.data.course_id || undefined,
                    filter: form.data.filter || undefined,
                })
                .then(({ data }) => setMatchingCount(data.count))
                .finally(() => setCountLoading(false));
        }, 400);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.data.subject_ids, form.data.topic_ids, form.data.difficulty, form.data.filter]);

    // Client sent a video of UWorld's own "Create Test" screen: Subjects
    // (and Systems) there are multi-select -- "Anatomy | Behavioral
    // science | Biostatistics | ..." -- not a single dropdown. Picking
    // more than one subject pulls from all of them combined.
    function toggleSubject(id: number) {
        form.setData((prev) => {
            const subject_ids = prev.subject_ids.includes(id) ? prev.subject_ids.filter((s) => s !== id) : [...prev.subject_ids, id];
            // Drop any picked topic that no longer belongs to a still-selected subject.
            const topic_ids = prev.topic_ids.filter((tid) => topics.some((t) => t.id === tid && subject_ids.includes(t.subject_id)));
            return { ...prev, subject_ids, topic_ids };
        });
    }

    function toggleTopic(id: number) {
        form.setData((prev) => ({
            ...prev,
            topic_ids: prev.topic_ids.includes(id) ? prev.topic_ids.filter((t) => t !== id) : [...prev.topic_ids, id],
        }));
    }

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
                    {course ? `For "${course.title}": ` : ''}Pick a subject (and optionally a topic within it), difficulty, and how many questions. We'll
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
                        <label className="mb-1 block text-sm font-medium text-text">Quiz Name (optional)</label>
                        <input
                            type="text"
                            maxLength={150}
                            placeholder="e.g. Pakistan Studies Review"
                            className={inputClass}
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                        />
                    </div>

                    <div>
                        <div className="mb-1 flex items-center justify-between">
                            <label className="block text-sm font-medium text-text">Subjects</label>
                            <span className="text-xs text-text-muted">{form.data.subject_ids.length === 0 ? 'Any subject' : `${form.data.subject_ids.length} selected`}</span>
                        </div>
                        <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
                            {subjects.map((s) => (
                                <label key={s.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-surface-sunken">
                                    <input type="checkbox" checked={form.data.subject_ids.includes(s.id)} onChange={() => toggleSubject(s.id)} />
                                    <span className="flex-1 text-text">{s.name}</span>
                                    <span className="text-xs text-text-muted">{s.questions_count}</span>
                                </label>
                            ))}
                        </div>
                        <p className="mt-1 text-xs text-text-muted">Leave none checked to pull from every subject.</p>
                    </div>

                    {availableTopics.length > 0 && (
                        <div>
                            <div className="mb-1 flex items-center justify-between">
                                <label className="block text-sm font-medium text-text">Topics</label>
                                <span className="text-xs text-text-muted">{form.data.topic_ids.length === 0 ? 'Any topic' : `${form.data.topic_ids.length} selected`}</span>
                            </div>
                            <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
                                {availableTopics.map((t) => (
                                    <label key={t.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-surface-sunken">
                                        <input type="checkbox" checked={form.data.topic_ids.includes(t.id)} onChange={() => toggleTopic(t.id)} />
                                        <span className="text-text">{t.name}</span>
                                    </label>
                                ))}
                            </div>
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
                        <label className="mb-1 block text-sm font-medium text-text">Only include</label>
                        <select className={inputClass} value={form.data.filter} onChange={(e) => form.setData('filter', e.target.value as typeof form.data.filter)}>
                            <option value="">All questions</option>
                            <option value="unused">Unused (never attempted)</option>
                            <option value="wrong">Previously wrong</option>
                            <option value="correct">Previously correct</option>
                            <option value="favorited">Favorited</option>
                        </select>
                    </div>

                    <p className="text-xs text-text-muted">
                        {countLoading ? 'Checking…' : matchingCount !== null ? `${matchingCount} question${matchingCount === 1 ? '' : 's'} match these filters.` : ''}
                    </p>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-text">Mode</label>
                        <select className={inputClass} value={form.data.mode} onChange={(e) => form.setData('mode', e.target.value as typeof form.data.mode)}>
                            <option value="tutor">Tutor -- see the answer after each question</option>
                            <option value="timed">Timed -- no feedback until you submit (exam simulation)</option>
                        </select>
                    </div>

                    <label className="flex items-center gap-2 text-sm text-text">
                        <input type="checkbox" checked={form.data.timer_enabled} onChange={(e) => form.setData('timer_enabled', e.target.checked)} />
                        Enable timer (1 minute per question)
                    </label>

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
                        {matchingCount !== null && form.data.question_count > matchingCount && (
                            <p className="mt-1 text-xs text-warning">Only {matchingCount} question{matchingCount === 1 ? '' : 's'} available -- you'll get fewer than asked for.</p>
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
