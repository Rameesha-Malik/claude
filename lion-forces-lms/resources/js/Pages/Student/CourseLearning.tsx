import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import StudentLayout from '@/Layouts/StudentLayout';

interface Lesson { id: number; title: string; type: string; external_url: string | null; file_path: string | null; description: string | null }
interface Note { id: number; title: string; content: string | null }
interface Reply { id: number; reply_text: string; admin: { name: string } | null; created_at: string }
interface Question { id: number; question_text: string; status: string; created_at: string; replies: Reply[] }
interface PracticeTestSummary {
    id: number; title: string; timer_enabled: boolean; duration_minutes: number | null;
    question_selection_mode: string; auto_question_count: number | null; questions_count: number;
}
interface MockExamSummary {
    id: number; title: string; target_exam_name: string | null; total_duration_minutes: number | null; sections_count: number;
}
interface StagedTestSummary {
    id: number; title: string; target_exam_name: string | null; stages_count: number;
}
interface Course {
    id: number; slug: string; title: string; lessons: Lesson[]; shared_notes: Note[];
    instructor: { name: string } | null; practice_tests: PracticeTestSummary[]; mock_exams: MockExamSummary[];
    staged_tests: StagedTestSummary[];
}
interface Review { id: number; rating: number; review_text: string | null; status: string }
interface Props {
    course: Course;
    personalNotes: Note[];
    lessonProgress: Record<number, { is_completed: boolean }>;
    questions: Question[];
    myReview: Review | null;
}

const TABS = ['Lectures', 'Notes', 'Quizzes', 'Flashcards', 'Tests', 'Q&A'] as const;
type Tab = (typeof TABS)[number];

function youtubeEmbedUrl(url: string): string | null {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function LessonPlayer({ lesson }: { lesson: Lesson }) {
    const fileUrl = lesson.file_path ? `/storage/${lesson.file_path}` : null;

    switch (lesson.type) {
        case 'video_youtube': {
            const embed = lesson.external_url ? youtubeEmbedUrl(lesson.external_url) : null;
            return embed ? (
                <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
                    <iframe src={embed} className="h-full w-full" allowFullScreen title={lesson.title} />
                </div>
            ) : (
                <p className="rounded-xl bg-surface-sunken p-6 text-sm text-text-muted">Video link not set yet.</p>
            );
        }
        case 'video_upload':
            return fileUrl ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video controls src={fileUrl} className="w-full rounded-xl bg-black" />
            ) : (
                <p className="rounded-xl bg-surface-sunken p-6 text-sm text-text-muted">Video not uploaded yet.</p>
            );
        case 'audio':
            return fileUrl ? (
                <audio controls src={fileUrl} className="w-full" />
            ) : (
                <p className="rounded-xl bg-surface-sunken p-6 text-sm text-text-muted">Audio not uploaded yet.</p>
            );
        case 'pdf':
            return fileUrl ? (
                <div>
                    <iframe src={fileUrl} className="h-[32rem] w-full rounded-xl border border-border" title={lesson.title} />
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-semibold text-primary hover:underline">
                        Open in new tab &rarr;
                    </a>
                </div>
            ) : (
                <p className="rounded-xl bg-surface-sunken p-6 text-sm text-text-muted">Document not uploaded yet.</p>
            );
        case 'document':
            return fileUrl ? (
                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover">
                    Download Document
                </a>
            ) : (
                <p className="rounded-xl bg-surface-sunken p-6 text-sm text-text-muted">Document not uploaded yet.</p>
            );
        case 'link':
            return lesson.external_url ? (
                <a href={lesson.external_url} target="_blank" rel="noopener noreferrer" className="inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover">
                    Open Link
                </a>
            ) : (
                <p className="rounded-xl bg-surface-sunken p-6 text-sm text-text-muted">Link not set yet.</p>
            );
        default:
            return null;
    }
}

export default function CourseLearning({ course, personalNotes, lessonProgress, questions, myReview }: Props) {
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

            <ReviewWidget course={course} myReview={myReview} />

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
                                <div className="mt-4">
                                    <LessonPlayer lesson={activeLesson} />
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

            {tab === 'Tests' && (
                <div className="space-y-8">
                    <div>
                        <h3 className="mb-3 font-bold text-text">Practice Tests</h3>
                        <div className="space-y-3">
                            {course.practice_tests.map((t) => (
                                <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-5">
                                    <div>
                                        <h4 className="font-semibold text-text">{t.title}</h4>
                                        <p className="text-sm text-text-secondary">
                                            {t.question_selection_mode === 'manual' ? `${t.questions_count} questions` : `${t.auto_question_count ?? 10} questions (random)`}
                                            {t.timer_enabled && t.duration_minutes ? ` · ${t.duration_minutes} min` : ' · No time limit'}
                                        </p>
                                    </div>
                                    <Link
                                        href={`/portal/practice-tests/${t.id}`}
                                        className="rounded-lg bg-primary px-5 py-2 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover"
                                    >
                                        Start Test
                                    </Link>
                                </div>
                            ))}
                            {course.practice_tests.length === 0 && (
                                <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-text-secondary">
                                    No practice tests available for this course yet.
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-3 font-bold text-text">Mock Exams</h3>
                        <div className="space-y-3">
                            {course.mock_exams.map((e) => (
                                <div key={e.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-5">
                                    <div>
                                        <h4 className="font-semibold text-text">{e.title}</h4>
                                        <p className="text-sm text-text-secondary">
                                            {e.sections_count} section{e.sections_count === 1 ? '' : 's'}
                                            {e.target_exam_name ? ` · ${e.target_exam_name} pattern` : ''}
                                            {e.total_duration_minutes ? ` · ${e.total_duration_minutes} min` : ''}
                                        </p>
                                    </div>
                                    <Link
                                        href={`/portal/mock-exams/${e.id}`}
                                        className="rounded-lg bg-accent px-5 py-2 text-sm font-bold uppercase tracking-wide text-on-accent hover:opacity-90"
                                    >
                                        View Exam
                                    </Link>
                                </div>
                            ))}
                            {course.mock_exams.length === 0 && (
                                <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-text-secondary">
                                    No mock exams available for this course yet.
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-3 font-bold text-text">Staged Tests</h3>
                        <div className="space-y-3">
                            {course.staged_tests.map((t) => (
                                <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-5">
                                    <div>
                                        <h4 className="font-semibold text-text">{t.title}</h4>
                                        <p className="text-sm text-text-secondary">
                                            {t.stages_count} stage{t.stages_count === 1 ? '' : 's'}
                                            {t.target_exam_name ? ` · ${t.target_exam_name} pattern` : ''}
                                        </p>
                                    </div>
                                    <Link
                                        href={`/portal/staged-tests/${t.id}`}
                                        className="rounded-lg bg-accent px-5 py-2 text-sm font-bold uppercase tracking-wide text-on-accent hover:opacity-90"
                                    >
                                        View Test
                                    </Link>
                                </div>
                            ))}
                            {course.staged_tests.length === 0 && (
                                <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-text-secondary">
                                    No staged tests available for this course yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {(tab === 'Quizzes' || tab === 'Flashcards') && (
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

const STATUS_LABEL: Record<string, string> = {
    pending: 'Pending review by admin',
    approved: 'Live on the course page',
    hidden: 'Hidden by admin',
};

function ReviewWidget({ course, myReview }: { course: Course; myReview: Review | null }) {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing } = useForm({
        rating: myReview?.rating ?? 5,
        review_text: myReview?.review_text ?? '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(`/portal/courses/${course.slug}/review`, { onSuccess: () => setOpen(false), preserveScroll: true });
    }

    if (!open) {
        return (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4">
                <div className="text-sm text-text-secondary">
                    {myReview ? (
                        <>Your review: <span className="text-gold-500">{'★'.repeat(myReview.rating)}{'☆'.repeat(5 - myReview.rating)}</span> · {STATUS_LABEL[myReview.status]}</>
                    ) : (
                        'Enjoying this course? Leave a rating to help other students.'
                    )}
                </div>
                <button onClick={() => setOpen(true)} className="text-sm font-bold uppercase text-primary hover:underline">
                    {myReview ? 'Edit Review' : 'Rate This Course'}
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={submit} className="mb-6 space-y-3 rounded-2xl border border-primary bg-surface p-5">
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setData('rating', n)} className="text-2xl text-gold-500" aria-label={`${n} stars`}>
                        {n <= data.rating ? '★' : '☆'}
                    </button>
                ))}
            </div>
            <textarea
                rows={3}
                value={data.review_text}
                onChange={(e) => setData('review_text', e.target.value)}
                placeholder="What did you think of this course? (optional)"
                className="w-full rounded-lg border border-border p-3 text-sm focus:border-primary focus:shadow-glow focus:outline-none"
            />
            <div className="flex gap-3">
                <button type="submit" disabled={processing} className="rounded-lg bg-primary px-5 py-2 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover disabled:opacity-50">
                    Submit Review
                </button>
                <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-border px-5 py-2 text-sm font-bold uppercase text-text hover:border-primary">
                    Cancel
                </button>
            </div>
        </form>
    );
}
