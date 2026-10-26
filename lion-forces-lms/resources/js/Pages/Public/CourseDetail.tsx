import { Head, Link, usePage } from '@inertiajs/react';
import { ReactNode } from 'react';
import LiteMarkdown from '@/Components/LiteMarkdown';
import PublicLayout from '@/Layouts/PublicLayout';
import { PageProps } from '@/types';

type Module = 'lectures' | 'quiz' | 'tests' | 'assignments';
const ALL_MODULES: Module[] = ['lectures', 'quiz', 'tests', 'assignments'];
const MODULE_LABELS: Record<Module, string> = { lectures: 'Lectures', quiz: 'Quiz', tests: 'Tests', assignments: 'Assignments' };

function summarizeModules(modules: Module[]): string {
    if (ALL_MODULES.every((m) => modules.includes(m))) return 'Full Course';
    return modules.map((m) => MODULE_LABELS[m]).join(' + ') || 'Nothing selected';
}

interface Package { id: number; name: string; modules: Module[]; description: string | null; price: string; validity_days: number | null }
interface Lesson { id: number; title: string; type: string }
interface Review { id: number; rating: number; review_text: string | null; user: { name: string } | null }
interface Course {
    slug: string;
    title: string; short_description: string | null; description: string | null; syllabus: string | null;
    base_price: string | null; hours: number | null; thumbnail_path: string | null;
    quizzes_enabled: boolean; flashcards_enabled: boolean; tests_enabled: boolean;
    lessons_count: number; enrollments_count: number;
    category: { name: string } | null;
    instructor: { name: string; photo_path: string | null; qualification: string | null; experience: string | null; bio: string | null } | null;
    packages: Package[];
    lessons: Lesson[];
    approved_reviews: Review[];
    tags: { name: string }[];
}

function Stars({ rating }: { rating: number }) {
    return <span className="text-gold-500">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>;
}

function SectionHeading({ d, children }: { d: string; children: ReactNode }) {
    return (
        <h2 className="flex items-center gap-2 text-xl font-semibold text-text">
            <svg className="h-5 w-5 flex-shrink-0 text-primary" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={d} />
            </svg>
            {children}
        </h2>
    );
}

function LessonTypeIcon({ type }: { type: string }) {
    const d = {
        video_youtube: 'M15.75 10.5l4.72-2.72a.75.75 0 011.13.65v7.14a.75.75 0 01-1.13.65l-4.72-2.72M4.5 6.75h9a1.5 1.5 0 011.5 1.5v7.5a1.5 1.5 0 01-1.5 1.5h-9a1.5 1.5 0 01-1.5-1.5v-7.5a1.5 1.5 0 011.5-1.5z',
        video_upload: 'M15.75 10.5l4.72-2.72a.75.75 0 011.13.65v7.14a.75.75 0 01-1.13.65l-4.72-2.72M4.5 6.75h9a1.5 1.5 0 011.5 1.5v7.5a1.5 1.5 0 01-1.5 1.5h-9a1.5 1.5 0 01-1.5-1.5v-7.5a1.5 1.5 0 011.5-1.5z',
        pdf: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
        document: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
        audio: 'M9 9v10.5a3 3 0 11-1.5-2.599M9 9V3.545c0-.376.153-.735.424-.996.271-.26.639-.4 1.021-.388l9 .273a1.406 1.406 0 011.355 1.404v6.99M9 9l11-.667',
        link: 'M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244',
    }[type] ?? 'M9 12.75L11.25 15 15 9.75';
    return (
        <svg className="h-4 w-4 flex-shrink-0 text-text-muted" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={d} />
        </svg>
    );
}

const INCLUDED_ICONS = {
    lectures: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
    quizzes: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    flashcards: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
    tests: 'M9 12.75L11.25 15 15 9.75m6 2.25a9 9 0 11-18 0 9 9 0 0118 0z',
};

export default function CourseDetail({ course }: { course: Course }) {
    const { auth } = usePage<PageProps>().props;

    const included = [
        { key: 'lectures', label: 'Video Lectures & Notes', icon: INCLUDED_ICONS.lectures, on: true },
        { key: 'quizzes', label: 'Quizzes', icon: INCLUDED_ICONS.quizzes, on: course.quizzes_enabled },
        { key: 'flashcards', label: 'Flashcards', icon: INCLUDED_ICONS.flashcards, on: course.flashcards_enabled },
        { key: 'tests', label: 'Practice Tests', icon: INCLUDED_ICONS.tests, on: course.tests_enabled },
    ].filter((i) => i.on);

    return (
        <PublicLayout>
            <Head title={course.title} />

            <section className="bg-gradient-to-br from-secondary to-teal-950 py-14 text-text-inverse">
                <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
                    <nav className="flex items-center gap-1.5 text-sm text-teal-300">
                        <Link href="/" className="hover:text-white">Home</Link>
                        <span>/</span>
                        <Link href="/courses" className="hover:text-white">Courses</Link>
                        <span>/</span>
                        <span className="text-teal-100">{course.title}</span>
                    </nav>

                    <div className="mt-4 flex flex-wrap gap-2">
                        {course.category && (
                            <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wide text-on-primary">{course.category.name}</span>
                        )}
                        {course.tags.map((t) => (
                            <span key={t.name} className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-teal-100">#{t.name}</span>
                        ))}
                    </div>
                    <h1 className="mt-4 font-display text-5xl uppercase tracking-wide">{course.title}</h1>
                    <p className="mt-3 max-w-2xl text-teal-200">{course.short_description}</p>

                    <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-teal-200">
                        <span>{course.lessons_count} lesson{course.lessons_count === 1 ? '' : 's'}</span>
                        {course.hours !== null && <span>{course.hours} hour{course.hours === 1 ? '' : 's'}</span>}
                        <span>{course.enrollments_count} student{course.enrollments_count === 1 ? '' : 's'} enrolled</span>
                    </div>
                </div>
            </section>

            {course.thumbnail_path && (
                <div className="mx-auto -mt-8 max-w-container px-4 sm:px-6 lg:px-8">
                    <img
                        src={`/storage/${course.thumbnail_path}`}
                        alt=""
                        className="aspect-[21/9] w-full rounded-2xl border border-border object-cover shadow-lg"
                    />
                </div>
            )}

            <section className="mx-auto grid max-w-container gap-10 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8">
                <div className="space-y-10 lg:col-span-2">
                    {course.description && (
                        <div>
                            <SectionHeading d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25">
                                Overview
                            </SectionHeading>
                            <LiteMarkdown text={course.description} className="mt-3 text-text-secondary" />
                        </div>
                    )}

                    {included.length > 0 && (
                        <div className="rounded-2xl border border-border bg-surface p-6">
                            <h3 className="font-semibold text-text">This Course Includes</h3>
                            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {included.map((i) => (
                                    <div key={i.key} className="flex items-center gap-2 text-sm text-text-secondary">
                                        <svg className="h-4 w-4 flex-shrink-0 text-primary" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d={i.icon} />
                                        </svg>
                                        {i.label}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {course.syllabus && (
                        <div>
                            <SectionHeading d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                                Syllabus
                            </SectionHeading>
                            <LiteMarkdown text={course.syllabus} className="mt-3 text-text-secondary" />
                        </div>
                    )}

                    {course.lessons.length > 0 && (
                        <div>
                            <SectionHeading d="M15.75 10.5l4.72-2.72a.75.75 0 011.13.65v7.14a.75.75 0 01-1.13.65l-4.72-2.72M4.5 6.75h9a1.5 1.5 0 011.5 1.5v7.5a1.5 1.5 0 01-1.5 1.5h-9a1.5 1.5 0 01-1.5-1.5v-7.5a1.5 1.5 0 011.5-1.5z">
                                Free Preview
                            </SectionHeading>
                            <ul className="mt-3 divide-y divide-border rounded-xl border border-border">
                                {course.lessons.map((lesson) => (
                                    <li key={lesson.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                                        <LessonTypeIcon type={lesson.type} />
                                        <span className="min-w-0 flex-1 truncate text-text">{lesson.title}</span>
                                        <span className="flex-shrink-0 rounded-full bg-primary-subtle px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-primary">Free</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {course.instructor && (
                        <div className="rounded-2xl border border-border bg-surface p-6">
                            <h3 className="font-semibold text-text">Instructor</h3>
                            <div className="mt-2 text-lg font-semibold text-primary">{course.instructor.name}</div>
                            <div className="text-sm text-text-secondary">{course.instructor.qualification}</div>
                            <p className="mt-2 text-sm text-text-secondary">{course.instructor.bio}</p>
                        </div>
                    )}

                    <div>
                        <SectionHeading d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z">
                            Student Reviews
                            {course.approved_reviews.length > 0 && (
                                <span className="text-sm font-normal text-text-secondary">
                                    ({(course.approved_reviews.reduce((s, r) => s + r.rating, 0) / course.approved_reviews.length).toFixed(1)} avg, {course.approved_reviews.length} review{course.approved_reviews.length === 1 ? '' : 's'})
                                </span>
                            )}
                        </SectionHeading>
                        {course.approved_reviews.length === 0 ? (
                            <p className="mt-3 rounded-xl border border-dashed border-border bg-surface p-6 text-center text-sm text-text-secondary">
                                No reviews yet.
                            </p>
                        ) : (
                            <div className="mt-3 space-y-3">
                                {course.approved_reviews.map((r) => (
                                    <div key={r.id} className="rounded-xl border border-border bg-surface p-4">
                                        <div className="flex items-center justify-between">
                                            <Stars rating={r.rating} />
                                            <span className="text-sm font-semibold text-text">{r.user?.name ?? 'Student'}</span>
                                        </div>
                                        {r.review_text && <LiteMarkdown text={r.review_text} className="mt-2 text-sm text-text-secondary" />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <aside>
                    <div className="sticky top-24 space-y-4">
                        <div className="rounded-2xl border border-border bg-surface p-6 shadow-md">
                            <div className="text-3xl font-bold text-primary">
                                {course.base_price ? `Rs. ${Number(course.base_price).toLocaleString()}` : 'Contact us'}
                            </div>
                            {/* Logged-in candidates go straight to the course (its own
                                enrollment check handles "not purchased yet"); visitors get
                                routed to How to Buy rather than straight into checkout. */}
                            <Link
                                href={auth.user ? `/portal/my-courses/${course.slug}` : '/how-to-buy'}
                                className="mt-4 block rounded-xl bg-primary py-3 text-center font-semibold text-on-primary hover:bg-primary-hover"
                            >
                                {auth.user ? 'Start Learning' : 'Buy Now'}
                            </Link>

                            {course.packages.length > 0 && (
                                <div className="mt-6 space-y-3">
                                    <div className="text-sm font-semibold text-text">Packages</div>
                                    {course.packages.map((pkg) => (
                                        <Link
                                            key={pkg.id}
                                            href={auth.user ? `/portal/courses/${course.slug}/checkout?package=${pkg.id}` : '/register'}
                                            className="block rounded-lg border border-border p-3 transition-colors hover:border-primary hover:bg-primary-subtle"
                                        >
                                            <div className="flex justify-between text-sm font-medium text-text">
                                                <span>{pkg.name}</span>
                                                <span>Rs. {Number(pkg.price).toLocaleString()}</span>
                                            </div>
                                            {summarizeModules(pkg.modules) !== 'Full Course' && (
                                                <span className="mt-1 inline-block rounded-full bg-primary-subtle px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-primary">
                                                    {summarizeModules(pkg.modules)}
                                                </span>
                                            )}
                                            {pkg.description && <p className="mt-1 text-xs text-text-secondary">{pkg.description}</p>}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="rounded-2xl border border-border bg-surface p-5 text-sm">
                            <div className="font-semibold text-text">Course Details</div>
                            <dl className="mt-3 space-y-2 text-text-secondary">
                                <div className="flex items-center justify-between"><dt>Enrolled</dt><dd className="font-semibold text-text">{course.enrollments_count}</dd></div>
                                {course.hours !== null && <div className="flex items-center justify-between"><dt>Duration</dt><dd className="font-semibold text-text">{course.hours} hours</dd></div>}
                                <div className="flex items-center justify-between"><dt>Lessons</dt><dd className="font-semibold text-text">{course.lessons_count}</dd></div>
                                {course.category && <div className="flex items-center justify-between"><dt>Category</dt><dd className="font-semibold text-text">{course.category.name}</dd></div>}
                            </dl>
                        </div>
                    </div>
                </aside>
            </section>
        </PublicLayout>
    );
}
