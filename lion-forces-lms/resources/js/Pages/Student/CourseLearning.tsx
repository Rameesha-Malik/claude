import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import StudentLayout from '@/Layouts/StudentLayout';

interface Lesson { id: number; title: string; type: string; external_url: string | null; description: string | null }
interface Note { id: number; title: string; content: string | null }
interface Reply { id: number; reply_text: string; admin: { name: string } | null; created_at: string }
interface Question { id: number; question_text: string; status: string; created_at: string; replies: Reply[] }
interface Course {
    id: number; slug: string; title: string; lessons: Lesson[]; shared_notes: Note[];
    instructor: { name: string } | null;
}
interface Props {
    course: Course;
    personalNotes: Note[];
    lessonProgress: Record<number, { is_completed: boolean }>;
    questions: Question[];
}

const TABS = ['Lectures', 'Notes', 'Quizzes', 'Flashcards', 'Tests', 'Q&A'] as const;
type Tab = (typeof TABS)[number];

export default function CourseLearning({ course, personalNotes, lessonProgress, questions }: Props) {
    const [tab, setTab] = useState<Tab>('Lectures');
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(course.lessons[0] ?? null);

    return (
        <StudentLayout header={course.title}>
            <Head title={course.title} />

            <div className="mb-6 flex flex-wrap gap-2 border-b border-border">
                {TABS.map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`border-b-2 px-4 py-3 text-sm font-bold uppercase tracking-wide transition-colors ${
                            tab === t ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text'
                        }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {tab === 'Lectures' && (
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-2 lg:col-span-1">
                        {course.lessons.map((lesson) => (
                            <button
                                key={lesson.id}
                                onClick={() => setActiveLesson(lesson)}
                                className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                                    activeLesson?.id === lesson.id ? 'border-primary bg-primary-subtle' : 'border-border bg-surface hover:border-primary'
                                }`}
                            >
                                <span className="font-medium text-text">{lesson.title}</span>
                                {lessonProgress[lesson.id]?.is_completed && (
                                    <span className="text-success">&#10003;</span>
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="lg:col-span-2">
                        {activeLesson ? (
                            <div className="rounded-2xl border border-border bg-surface p-6">
                                <h3 className="font-bold text-text">{activeLesson.title}</h3>
                                <p className="mt-2 text-sm text-text-secondary">{activeLesson.description}</p>
                                <div className="mt-4 flex h-56 items-center justify-center rounded-xl bg-surface-sunken text-sm uppercase tracking-wide text-text-muted">
                                    {activeLesson.type.replace('_', ' ')} content
                                </div>
                                <button
                                    onClick={() => router.post(`/portal/lessons/${activeLesson.id}/complete`, {}, { preserveScroll: true })}
                                    disabled={lessonProgress[activeLesson.id]?.is_completed}
                                    className="mt-4 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover disabled:opacity-50"
                                >
                                    {lessonProgress[activeLesson.id]?.is_completed ? 'Completed' : 'Mark as Complete'}
                                </button>
                            </div>
                        ) : (
                            <p className="text-text-secondary">No lectures yet.</p>
                        )}
                    </div>
                </div>
            )}

            {tab === 'Notes' && (
                <div className="space-y-8">
                    <div>
                        <h3 className="mb-3 font-bold text-text">Course Notes</h3>
                        {course.shared_notes.length === 0 ? (
                            <p className="text-sm text-text-secondary">No notes published yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {course.shared_notes.map((note) => (
                                    <div key={note.id} className="rounded-xl border border-border bg-surface p-5">
                                        <h4 className="font-semibold text-text">{note.title}</h4>
                                        <p className="mt-2 whitespace-pre-line text-sm text-text-secondary">{note.content}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {personalNotes.length > 0 && (
                        <div>
                            <h3 className="mb-3 font-bold text-accent">Your Guaranteed Notes</h3>
                            <div className="space-y-3">
                                {personalNotes.map((note) => (
                                    <div key={note.id} className="rounded-xl border-2 border-accent bg-surface p-5">
                                        <h4 className="font-semibold text-text">{note.title}</h4>
                                        <p className="mt-2 whitespace-pre-line text-sm text-text-secondary">{note.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {(tab === 'Quizzes' || tab === 'Flashcards' || tab === 'Tests') && (
                <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                    {tab} are coming in the next build phase.
                </div>
            )}

            {tab === 'Q&A' && <QaPanel course={course} questions={questions} />}
        </StudentLayout>
    );
}

function QaPanel({ course, questions }: { course: Course; questions: Question[] }) {
    const { data, setData, post, processing, reset } = useForm({ question_text: '' });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(`/portal/courses/${course.slug}/questions`, { onSuccess: () => reset() });
    }

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <form onSubmit={submit} className="h-fit rounded-2xl border border-border bg-surface p-6">
                <h3 className="mb-3 font-bold text-text">Ask a Question</h3>
                <textarea
                    rows={4}
                    value={data.question_text}
                    onChange={(e) => setData('question_text', e.target.value)}
                    placeholder="Ask about a lecture, note, or anything course-related..."
                    className="w-full rounded-lg border border-border p-3 text-sm focus:border-primary focus:shadow-glow focus:outline-none"
                />
                <button
                    type="submit"
                    disabled={processing}
                    className="mt-3 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover disabled:opacity-50"
                >
                    Ask
                </button>
                <p className="mt-2 text-xs text-text-muted">Only you and the admin can see this conversation.</p>
            </form>

            <div className="space-y-4">
                {questions.length === 0 && <p className="text-sm text-text-secondary">You haven't asked anything yet.</p>}
                {questions.map((q) => (
                    <div key={q.id} className="rounded-xl border border-border bg-surface p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-text">You</span>
                            <span
                                className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${
                                    q.status === 'answered' ? 'bg-success-bg text-success' : 'bg-warning-bg text-warning'
                                }`}
                            >
                                {q.status}
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-text-secondary">{q.question_text}</p>
                        {q.replies.map((r) => (
                            <div key={r.id} className="mt-3 rounded-lg bg-primary-subtle p-3">
                                <span className="text-xs font-bold text-primary">{r.admin?.name ?? 'Admin'}</span>
                                <p className="mt-1 text-sm text-text">{r.reply_text}</p>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
