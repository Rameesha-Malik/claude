import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import RevealOnScroll from '@/Components/RevealOnScroll';
import StudentLayout from '@/Layouts/StudentLayout';

interface Lesson { id: number; title: string; type: string; external_url: string | null; file_path: string | null; description: string | null; section_id: number | null }
interface Section { id: number; title: string; lessons: Lesson[] }
interface Note { id: number; title: string; content: string | null }
interface Reply { id: number; reply_text: string; admin: { name: string } | null; created_at: string }
interface Question { id: number; question_text: string; status: string; created_at: string; replies: Reply[] }
interface PracticeTestSummary {
    id: number; title: string; timer_enabled: boolean; duration_minutes: number | null;
    question_selection_mode: string; auto_question_count: number | null; questions_count: number;
    latest_attempt_id: number | null;
}
interface QuizSummary {
    id: number; title: string; question_selection_mode: string; auto_question_count: number | null; questions_count: number;
    latest_attempt_id: number | null;
}
interface FlashcardItem { id: number; front_text: string; back_text: string }
interface MockExamSummary {
    id: number; title: string; target_exam_name: string | null; total_duration_minutes: number | null; sections_count: number;
    latest_attempt_id: number | null;
}
interface StagedTestSummary {
    id: number; title: string; target_exam_name: string | null; stages_count: number;
    latest_attempt_id: number | null;
}
interface AssignmentSubmission {
    id: number; status: string; marks_awarded: number | null; feedback: string | null;
    submission_text: string | null; file_path: string | null; submitted_at: string;
}
interface AssignmentItem {
    id: number; title: string; instructions: string | null; max_marks: number | null;
    due_date: string | null; submissions: AssignmentSubmission[];
}
interface Course {
    id: number; slug: string; title: string; lessons: Lesson[]; sections: Section[]; shared_notes: Note[];
    instructor: { name: string } | null; practice_tests: PracticeTestSummary[]; quizzes: QuizSummary[];
    mock_exams: MockExamSummary[]; staged_tests: StagedTestSummary[]; flashcards: FlashcardItem[];
    assignments: AssignmentItem[];
    quizzes_enabled: boolean; flashcards_enabled: boolean; tests_enabled: boolean; assignments_enabled: boolean;
    level: string | null; enrollments_count: number; approved_reviews: { rating: number }[];
}
interface Review { id: number; rating: number; review_text: string | null; status: string }
interface Props {
    course: Partial<Course> & Pick<Course, 'title'>;
    personalNotes?: Note[];
    lessonProgress?: Record<number, { is_completed: boolean }>;
    questions?: Question[];
    myReview?: Review | null;
    /** Present (and not 'active') when the enrollment isn't active yet -- e.g.
     *  payment just submitted and awaiting admin verification. In that case
     *  every field above except course.title is omitted by the controller. */
    enrollmentStatus?: string | null;
}

const TABS = ['Lectures', 'Notes', 'Quizzes', 'Flashcards', 'Tests', 'Assignments', 'Q&A'] as const;
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

export default function CourseLearning({ course: courseProp, personalNotes = [], lessonProgress = {}, questions = [], myReview = null, enrollmentStatus }: Props) {
    const [tab, setTab] = useState<Tab>('Lectures');
    const [activeLesson, setActiveLesson] = useState<Lesson | null>((courseProp as Course).lessons?.[0] ?? null);

    // `enrollmentStatus` is only ever included in the payload at all for the
    // guard branch (undefined here means the controller sent the full
    // course shape) -- checking `!== undefined` rather than truthiness so
    // "no enrollment exists" (status null) is caught the same as a real
    // pending/suspended/expired status string.
    if (enrollmentStatus !== undefined) {
        return (
            <StudentLayout header={courseProp.title}>
                <Head title={courseProp.title} />
                <div className="mx-auto max-w-lg rounded-2xl border border-border bg-surface p-8 text-center">
                    <h2 className="font-bold text-text">
                        {enrollmentStatus === 'pending'
                            ? 'Enrollment Pending Verification'
                            : enrollmentStatus === null
                              ? "You're Not Enrolled"
                              : 'Access Not Active'}
                    </h2>
                    <p className="mt-2 text-sm text-text-secondary">
                        {enrollmentStatus === 'pending'
                            ? "We've received your payment and it's awaiting verification, usually within a day."
                            : enrollmentStatus === null
                              ? "You haven't enrolled in this course yet."
                              : 'Your access to this course is not currently active. Contact us if you think this is a mistake.'}
                    </p>
                    <Link
                        href="/portal/my-courses"
                        className="mt-6 inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover"
                    >
                        View My Courses
                    </Link>
                </div>
            </StudentLayout>
        );
    }

    // Past the guard above, the controller only ever sends the full shape.
    const course = courseProp as Course;

    // Only show a module's tab when the admin has actually enabled it for
    // this course (Course.quizzes_enabled / flashcards_enabled /
    // tests_enabled, set in Admin -> Courses -> Modules).
    const visibleTabs = TABS.filter((t) => {
        if (t === 'Quizzes') return course.quizzes_enabled;
        if (t === 'Flashcards') return course.flashcards_enabled;
        if (t === 'Tests') return course.tests_enabled;
        if (t === 'Assignments') return course.assignments_enabled;
        return true;
    });

    const totalLessons = course.lessons.length;
    const completedLessons = course.lessons.filter((l) => lessonProgress[l.id]?.is_completed).length;
    const progressPct = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const reviewCount = course.approved_reviews.length;
    const avgRating = reviewCount ? course.approved_reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : 0;

    return (
        <StudentLayout header={course.title}>
            <Head title={course.title} />

            <CourseMetaBar
                avgRating={avgRating}
                reviewCount={reviewCount}
                level={course.level}
                enrolledCount={course.enrollments_count}
                completedLessons={completedLessons}
                totalLessons={totalLessons}
                progressPct={progressPct}
            />

            <div className="mb-6 flex flex-wrap gap-1.5 rounded-full border border-border bg-surface p-1.5">
                {visibleTabs.map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`rounded-full px-4 py-2 text-sm font-bold uppercase tracking-wide transition-all duration-fast ${
                            tab === t ? 'bg-primary text-on-primary shadow-sm' : 'text-text-secondary hover:bg-surface-sunken hover:text-text'
                        }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            <ReviewWidget course={course} myReview={myReview} />

            {tab === 'Lectures' && (
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-1">
                        <h3 className="mb-3 font-bold text-text">Course Content</h3>
                        {course.sections.length === 0 ? (
                            <div className="space-y-2 rounded-3xl border border-border bg-surface p-2">
                                {course.lessons.map((lesson, i) => (
                                    <LessonListItem
                                        key={lesson.id}
                                        lesson={lesson}
                                        number={i + 1}
                                        isActive={activeLesson?.id === lesson.id}
                                        isDone={!!lessonProgress[lesson.id]?.is_completed}
                                        onClick={() => setActiveLesson(lesson)}
                                    />
                                ))}
                                {course.lessons.length === 0 && (
                                    <p className="p-4 text-sm text-text-secondary">No lectures yet.</p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {course.sections.map((section) => (
                                    <div key={section.id} className="overflow-hidden rounded-3xl border border-border bg-surface">
                                        <div className="border-b border-border bg-surface-sunken px-4 py-2.5 text-sm font-bold text-text">
                                            {section.title}
                                        </div>
                                        <div className="space-y-1 p-2">
                                            {section.lessons.map((lesson, i) => (
                                                <LessonListItem
                                                    key={lesson.id}
                                                    lesson={lesson}
                                                    number={i + 1}
                                                    isActive={activeLesson?.id === lesson.id}
                                                    isDone={!!lessonProgress[lesson.id]?.is_completed}
                                                    onClick={() => setActiveLesson(lesson)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {course.lessons.some((l) => l.section_id === null) && (
                                    <div className="overflow-hidden rounded-3xl border border-border bg-surface">
                                        <div className="border-b border-border bg-surface-sunken px-4 py-2.5 text-sm font-bold text-text">
                                            Other Lessons
                                        </div>
                                        <div className="space-y-1 p-2">
                                            {course.lessons.filter((l) => l.section_id === null).map((lesson, i) => (
                                                <LessonListItem
                                                    key={lesson.id}
                                                    lesson={lesson}
                                                    number={i + 1}
                                                    isActive={activeLesson?.id === lesson.id}
                                                    isDone={!!lessonProgress[lesson.id]?.is_completed}
                                                    onClick={() => setActiveLesson(lesson)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="lg:col-span-2">
                        {activeLesson ? (
                            <div className="overflow-hidden rounded-3xl border border-border bg-surface">
                                <div className="bg-secondary p-3">
                                    <LessonPlayer lesson={activeLesson} />
                                </div>
                                <div className="p-6">
                                    <h3 className="font-bold text-text">{activeLesson.title}</h3>
                                    {activeLesson.description && <p className="mt-2 text-sm text-text-secondary">{activeLesson.description}</p>}

                                    <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-5">
                                        <button
                                            onClick={() => {
                                                const i = course.lessons.findIndex((l) => l.id === activeLesson.id);
                                                if (i > 0) setActiveLesson(course.lessons[i - 1]);
                                            }}
                                            disabled={course.lessons.findIndex((l) => l.id === activeLesson.id) <= 0}
                                            className="rounded-full border border-border px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-text transition-all duration-fast hover:-translate-y-0.5 hover:border-primary hover:text-primary disabled:opacity-40 disabled:hover:translate-y-0"
                                        >
                                            &larr; Previous
                                        </button>
                                        <button
                                            onClick={() => {
                                                const i = course.lessons.findIndex((l) => l.id === activeLesson.id);
                                                if (!lessonProgress[activeLesson.id]?.is_completed) {
                                                    router.post(`/portal/lessons/${activeLesson.id}/complete`, {}, { preserveScroll: true });
                                                }
                                                if (i < course.lessons.length - 1) setActiveLesson(course.lessons[i + 1]);
                                            }}
                                            disabled={
                                                lessonProgress[activeLesson.id]?.is_completed &&
                                                course.lessons.findIndex((l) => l.id === activeLesson.id) === course.lessons.length - 1
                                            }
                                            className="ml-auto rounded-full bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-on-primary shadow-sm transition-all duration-fast hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-md disabled:opacity-50 disabled:hover:translate-y-0"
                                        >
                                            {lessonProgress[activeLesson.id]?.is_completed
                                                ? course.lessons.findIndex((l) => l.id === activeLesson.id) === course.lessons.length - 1
                                                    ? 'Completed'
                                                    : 'Next Lesson →'
                                                : 'Mark Complete & Continue →'}
                                        </button>
                                    </div>
                                </div>
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
                            <RevealOnScroll staggerMs={50} className="space-y-3">
                                {course.shared_notes.map((note) => (
                                    <div key={note.id} className="rounded-2xl border border-border bg-surface p-5 transition-shadow duration-normal hover:shadow-md">
                                        <h4 className="font-semibold text-text">{note.title}</h4>
                                        <p className="mt-2 whitespace-pre-line text-sm text-text-secondary">{note.content}</p>
                                    </div>
                                ))}
                            </RevealOnScroll>
                        )}
                    </div>

                    {personalNotes.length > 0 && (
                        <div>
                            <h3 className="mb-3 font-bold text-secondary">Your Guaranteed Notes</h3>
                            <RevealOnScroll staggerMs={50} className="space-y-3">
                                {personalNotes.map((note) => (
                                    <div key={note.id} className="rounded-2xl border-2 border-primary bg-surface p-5 transition-shadow duration-normal hover:shadow-md">
                                        <h4 className="font-semibold text-text">{note.title}</h4>
                                        <p className="mt-2 whitespace-pre-line text-sm text-text-secondary">{note.content}</p>
                                    </div>
                                ))}
                            </RevealOnScroll>
                        </div>
                    )}
                </div>
            )}

            {tab === 'Tests' && (
                <div className="space-y-8">
                    <div>
                        <h3 className="mb-3 font-bold text-text">Practice Tests</h3>
                        <RevealOnScroll staggerMs={50} className="space-y-3">
                            {course.practice_tests.map((t) => (
                                <TestCard
                                    key={t.id}
                                    title={t.title}
                                    meta={
                                        (t.question_selection_mode === 'manual' ? `${t.questions_count} questions` : `${t.auto_question_count ?? 10} questions (random)`) +
                                        (t.timer_enabled && t.duration_minutes ? ` · ${t.duration_minutes} min` : ' · No time limit')
                                    }
                                    href={`/portal/practice-tests/${t.id}`}
                                    cta={t.latest_attempt_id ? 'Retake Test' : 'Start Test'}
                                    latestAttemptId={t.latest_attempt_id}
                                />
                            ))}
                            {course.practice_tests.length === 0 && (
                                <div className="rounded-3xl border border-dashed border-border bg-surface p-8 text-center text-text-secondary">
                                    No practice tests available for this course yet.
                                </div>
                            )}
                        </RevealOnScroll>
                    </div>

                    <div>
                        <h3 className="mb-3 font-bold text-text">Mock Exams</h3>
                        <RevealOnScroll staggerMs={50} className="space-y-3">
                            {course.mock_exams.map((e) => (
                                <TestCard
                                    key={e.id}
                                    title={e.title}
                                    meta={
                                        `${e.sections_count} section${e.sections_count === 1 ? '' : 's'}` +
                                        (e.target_exam_name ? ` · ${e.target_exam_name} pattern` : '') +
                                        (e.total_duration_minutes ? ` · ${e.total_duration_minutes} min` : '')
                                    }
                                    href={`/portal/mock-exams/${e.id}`}
                                    cta="View Exam"
                                    latestAttemptId={e.latest_attempt_id}
                                />
                            ))}
                            {course.mock_exams.length === 0 && (
                                <div className="rounded-3xl border border-dashed border-border bg-surface p-8 text-center text-text-secondary">
                                    No mock exams available for this course yet.
                                </div>
                            )}
                        </RevealOnScroll>
                    </div>

                    <div>
                        <h3 className="mb-3 font-bold text-text">Staged Tests</h3>
                        <RevealOnScroll staggerMs={50} className="space-y-3">
                            {course.staged_tests.map((t) => (
                                <TestCard
                                    key={t.id}
                                    title={t.title}
                                    meta={`${t.stages_count} stage${t.stages_count === 1 ? '' : 's'}${t.target_exam_name ? ` · ${t.target_exam_name} pattern` : ''}`}
                                    href={`/portal/staged-tests/${t.id}`}
                                    cta="View Test"
                                    latestAttemptId={t.latest_attempt_id}
                                />
                            ))}
                            {course.staged_tests.length === 0 && (
                                <div className="rounded-3xl border border-dashed border-border bg-surface p-8 text-center text-text-secondary">
                                    No staged tests available for this course yet.
                                </div>
                            )}
                        </RevealOnScroll>
                    </div>
                </div>
            )}

            {tab === 'Quizzes' && (
                <RevealOnScroll staggerMs={50} className="space-y-3">
                    {course.quizzes.map((q) => (
                        <TestCard
                            key={q.id}
                            title={q.title}
                            meta={
                                (q.question_selection_mode === 'manual' ? `${q.questions_count} questions` : `${q.auto_question_count ?? 10} questions (random)`) +
                                ' · No time limit'
                            }
                            href={`/portal/quizzes/${q.id}`}
                            cta={q.latest_attempt_id ? 'Retake Quiz' : 'Start Quiz'}
                            latestAttemptId={q.latest_attempt_id}
                        />
                    ))}
                    {course.quizzes.length === 0 && (
                        <div className="rounded-3xl border border-dashed border-border bg-surface p-8 text-center text-text-secondary">
                            No quizzes available for this course yet.
                        </div>
                    )}
                </RevealOnScroll>
            )}

            {tab === 'Flashcards' && <FlashcardsPanel cards={course.flashcards} />}

            {tab === 'Assignments' && (
                <RevealOnScroll staggerMs={50} className="space-y-4">
                    {course.assignments.map((a) => <AssignmentCard key={a.id} assignment={a} />)}
                    {course.assignments.length === 0 && (
                        <div className="rounded-3xl border border-dashed border-border bg-surface p-8 text-center text-text-secondary">
                            No assignments for this course yet.
                        </div>
                    )}
                </RevealOnScroll>
            )}

            {tab === 'Q&A' && <QaPanel course={course} questions={questions} />}
        </StudentLayout>
    );
}

function LessonListItem({
    lesson,
    number,
    isActive,
    isDone,
    onClick,
}: {
    lesson: Lesson;
    number: number;
    isActive: boolean;
    isDone: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition-all duration-fast ${
                isActive ? 'bg-primary-subtle shadow-sm' : 'hover:bg-surface-sunken'
            }`}
        >
            <span
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    isDone ? 'bg-success text-white' : isActive ? 'bg-primary text-on-primary' : 'bg-surface-sunken text-text-secondary'
                }`}
            >
                {isDone ? '✓' : number}
            </span>
            <span className={`font-medium ${isActive ? 'text-primary' : 'text-text'}`}>{lesson.title}</span>
        </button>
    );
}

function CourseMetaBar({
    avgRating,
    reviewCount,
    level,
    enrolledCount,
    completedLessons,
    totalLessons,
    progressPct,
}: {
    avgRating: number;
    reviewCount: number;
    level: string | null;
    enrolledCount: number;
    completedLessons: number;
    totalLessons: number;
    progressPct: number;
}) {
    return (
        <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-3xl border border-border bg-surface p-5">
            {reviewCount > 0 && (
                <div className="flex items-center gap-1.5 text-sm">
                    <span className="text-gold-500">{'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}</span>
                    <span className="text-text-secondary">
                        {avgRating.toFixed(1)} ({reviewCount} review{reviewCount === 1 ? '' : 's'})
                    </span>
                </div>
            )}
            {level && (
                <span className="rounded-full bg-primary-subtle px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">{level}</span>
            )}
            <span className="text-sm text-text-secondary">
                <span className="font-semibold text-text">{enrolledCount}</span> enrolled
            </span>
            <div className="ml-auto min-w-[200px] flex-1 sm:flex-none">
                <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-text-secondary">
                    <span>Course Progress</span>
                    <span>{completedLessons}/{totalLessons} · {progressPct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-sunken">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-secondary to-primary transition-all duration-slow"
                        style={{ width: `${progressPct}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

function TestCard({
    title,
    meta,
    href,
    cta,
    latestAttemptId,
}: {
    title: string;
    meta: string;
    href: string;
    cta: string;
    /** When set, a completed attempt exists -- offer a way back to it so a
     *  student can review it again later, not just once right after submitting. */
    latestAttemptId?: number | null;
}) {
    return (
        <div className="group flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-surface p-5 transition-all duration-normal hover:-translate-y-0.5 hover:border-primary hover:shadow-lg">
            <div>
                <h4 className="font-semibold text-text group-hover:text-primary">{title}</h4>
                <p className="text-sm text-text-secondary">{meta}</p>
            </div>
            <div className="flex flex-wrap gap-2">
                {latestAttemptId && (
                    <Link
                        href={`/portal/attempts/${latestAttemptId}`}
                        className="rounded-full border border-border px-5 py-2 text-sm font-bold uppercase tracking-wide text-text transition-all duration-fast hover:-translate-y-0.5 hover:border-primary hover:text-primary"
                    >
                        View Results
                    </Link>
                )}
                <Link
                    href={href}
                    className="rounded-full bg-primary px-5 py-2 text-sm font-bold uppercase tracking-wide text-on-primary shadow-sm transition-all duration-fast hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-md"
                >
                    {cta}
                </Link>
            </div>
        </div>
    );
}

function FlashcardsPanel({ cards }: { cards: FlashcardItem[] }) {
    if (cards.length === 0) {
        return (
            <div className="rounded-3xl border border-dashed border-border bg-surface p-8 text-center text-text-secondary">
                No flashcards available for this course yet.
            </div>
        );
    }

    return (
        <RevealOnScroll staggerMs={40} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
                <FlashcardTile key={card.id} card={card} />
            ))}
        </RevealOnScroll>
    );
}

function FlashcardTile({ card }: { card: FlashcardItem }) {
    const [flipped, setFlipped] = useState(false);

    return (
        <button
            type="button"
            onClick={() => setFlipped((v) => !v)}
            className="group block h-44 w-full text-left transition-transform duration-normal hover:-translate-y-1"
            style={{ perspective: '1000px' }}
            aria-label="Flip flashcard"
        >
            <div
                className="relative h-full w-full transition-transform duration-500 motion-reduce:transition-none"
                style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'none' }}
            >
                <div
                    className="absolute inset-0 flex flex-col justify-between rounded-3xl border border-border bg-surface p-5 shadow-sm transition-shadow duration-normal group-hover:shadow-lg"
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <span className="text-xs font-bold uppercase tracking-wide text-primary">Question</span>
                    <p className="line-clamp-4 text-sm font-semibold text-text">{card.front_text}</p>
                    <span className="text-xs text-text-muted">Tap to flip</span>
                </div>
                <div
                    className="absolute inset-0 flex flex-col justify-between rounded-3xl border border-primary bg-primary-subtle p-5 shadow-sm transition-shadow duration-normal group-hover:shadow-lg"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                    <span className="text-xs font-bold uppercase tracking-wide text-primary">Answer</span>
                    <p className="line-clamp-4 text-sm text-text">{card.back_text}</p>
                    <span className="text-xs text-text-muted">Tap to flip back</span>
                </div>
            </div>
        </button>
    );
}

function AssignmentCard({ assignment }: { assignment: AssignmentItem }) {
    const submission = assignment.submissions[0] ?? null;
    const [editing, setEditing] = useState(!submission);
    const form = useForm<{ submission_text: string; file: File | null }>({
        submission_text: submission?.submission_text ?? '',
        file: null,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.post(`/portal/assignments/${assignment.id}/submit`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => { form.setData('file', null); setEditing(false); },
        });
    }

    const overdue = assignment.due_date && new Date(assignment.due_date) < new Date() && !submission;

    return (
        <div className="rounded-3xl border border-border bg-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h4 className="font-semibold text-text">{assignment.title}</h4>
                    <p className="mt-1 text-xs text-text-muted">
                        {assignment.max_marks ? `${assignment.max_marks} marks` : 'Ungraded'}
                        {assignment.due_date && ` · Due ${new Date(assignment.due_date).toLocaleDateString()}`}
                    </p>
                </div>
                <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                        submission?.status === 'graded'
                            ? 'bg-success-bg text-success'
                            : submission
                              ? 'bg-primary-subtle text-primary'
                              : overdue
                                ? 'bg-danger-bg text-danger'
                                : 'bg-warning-bg text-warning'
                    }`}
                >
                    {submission?.status === 'graded' ? 'Graded' : submission ? 'Submitted' : overdue ? 'Overdue' : 'Not Submitted'}
                </span>
            </div>

            {assignment.instructions && <p className="mt-3 whitespace-pre-line text-sm text-text-secondary">{assignment.instructions}</p>}

            {submission?.status === 'graded' && (
                <div className="mt-4 rounded-2xl bg-success-bg p-4">
                    <p className="text-sm font-bold text-success">
                        Score: {submission.marks_awarded ?? 0}{assignment.max_marks ? ` / ${assignment.max_marks}` : ''}
                    </p>
                    {submission.feedback && <p className="mt-1 text-sm text-text">{submission.feedback}</p>}
                </div>
            )}

            {submission && !editing && (
                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4 text-sm">
                    <span className="text-text-secondary">Submitted {new Date(submission.submitted_at).toLocaleString()}</span>
                    {submission.file_path && (
                        <a href={`/storage/${submission.file_path}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                            View My File →
                        </a>
                    )}
                    <button onClick={() => setEditing(true)} className="font-semibold text-primary hover:underline">
                        Resubmit
                    </button>
                </div>
            )}

            {editing && (
                <form onSubmit={submit} className="mt-4 space-y-3 border-t border-border pt-4">
                    <textarea
                        rows={3}
                        placeholder="Write your answer (optional if attaching a file)"
                        className="w-full rounded-2xl border border-border p-3 text-sm transition-colors focus:border-primary focus:shadow-glow focus:outline-none"
                        value={form.data.submission_text}
                        onChange={(e) => form.setData('submission_text', e.target.value)}
                    />
                    <input
                        type="file"
                        onChange={(e) => form.setData('file', e.target.files?.[0] ?? null)}
                        className="w-full text-sm text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-bold file:uppercase file:text-on-primary"
                    />
                    {Object.values(form.errors).map((m, i) => <div key={i} className="text-sm text-danger">{m}</div>)}
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="rounded-full bg-primary px-5 py-2 text-sm font-bold uppercase tracking-wide text-on-primary shadow-sm transition-all duration-fast hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-md disabled:opacity-50"
                        >
                            {form.processing ? 'Submitting…' : submission ? 'Resubmit' : 'Submit'}
                        </button>
                        {submission && (
                            <button type="button" onClick={() => setEditing(false)} className="rounded-full border border-border px-5 py-2 text-sm font-bold uppercase text-text hover:border-primary">
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            )}
        </div>
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
            <form onSubmit={submit} className="h-fit rounded-3xl border border-border bg-surface p-6">
                <h3 className="mb-3 font-bold text-text">Ask a Question</h3>
                <textarea
                    rows={4}
                    value={data.question_text}
                    onChange={(e) => setData('question_text', e.target.value)}
                    placeholder="Ask about a lecture, note, or anything course-related..."
                    className="w-full rounded-2xl border border-border p-3 text-sm transition-colors focus:border-primary focus:shadow-glow focus:outline-none"
                />
                <button
                    type="submit"
                    disabled={processing}
                    className="mt-3 rounded-full bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-on-primary shadow-sm transition-all duration-fast hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-md disabled:opacity-50 disabled:hover:translate-y-0"
                >
                    Ask
                </button>
                <p className="mt-2 text-xs text-text-muted">Only you and the admin can see this conversation.</p>
            </form>

            <RevealOnScroll staggerMs={50} className="space-y-4">
                {questions.length === 0 && <p className="text-sm text-text-secondary">You haven't asked anything yet.</p>}
                {questions.map((q) => (
                    <div key={q.id} className="rounded-3xl border border-border bg-surface p-5 transition-shadow duration-normal hover:shadow-md">
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
                            <div key={r.id} className="mt-3 rounded-2xl bg-primary-subtle p-3">
                                <span className="text-xs font-bold text-primary">{r.admin?.name ?? 'Admin'}</span>
                                <p className="mt-1 text-sm text-text">{r.reply_text}</p>
                            </div>
                        ))}
                    </div>
                ))}
            </RevealOnScroll>
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
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-surface p-4 transition-shadow duration-normal hover:shadow-md">
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
        <form onSubmit={submit} className="mb-6 space-y-3 rounded-3xl border border-primary bg-surface p-5 shadow-sm">
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                    <button
                        key={n}
                        type="button"
                        onClick={() => setData('rating', n)}
                        className="text-2xl text-gold-500 transition-transform duration-fast hover:scale-125"
                        aria-label={`${n} stars`}
                    >
                        {n <= data.rating ? '★' : '☆'}
                    </button>
                ))}
            </div>
            <textarea
                rows={3}
                value={data.review_text}
                onChange={(e) => setData('review_text', e.target.value)}
                placeholder="What did you think of this course? (optional)"
                className="w-full rounded-2xl border border-border p-3 text-sm transition-colors focus:border-primary focus:shadow-glow focus:outline-none"
            />
            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-full bg-primary px-5 py-2 text-sm font-bold uppercase tracking-wide text-on-primary shadow-sm transition-all duration-fast hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-md disabled:opacity-50 disabled:hover:translate-y-0"
                >
                    Submit Review
                </button>
                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-full border border-border px-5 py-2 text-sm font-bold uppercase text-text transition-all duration-fast hover:-translate-y-0.5 hover:border-primary hover:text-primary"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
