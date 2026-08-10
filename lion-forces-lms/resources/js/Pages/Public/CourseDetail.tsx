import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';

interface Package { id: number; name: string; description: string | null; price: string; validity_days: number | null }
interface Lesson { id: number; title: string; type: string }
interface Review { id: number; rating: number; review_text: string | null; user: { name: string } | null }
interface Course {
    title: string; short_description: string | null; description: string | null; syllabus: string | null;
    base_price: string | null; hours: number | null;
    category: { name: string } | null;
    instructor: { name: string; photo_path: string | null; qualification: string | null; experience: string | null; bio: string | null } | null;
    packages: Package[];
    lessons: Lesson[];
    approved_reviews: Review[];
}

function Stars({ rating }: { rating: number }) {
    return <span className="text-gold-500">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>;
}

export default function CourseDetail({ course }: { course: Course }) {
    return (
        <PublicLayout>
            <Head title={course.title} />

            <section className="bg-gradient-to-br from-secondary to-teal-950 py-20 text-text-inverse">
                <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
                    {course.category && (
                        <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent-fg">{course.category.name}</span>
                    )}
                    <h1 className="mt-4 font-display text-5xl uppercase tracking-wide">{course.title}</h1>
                    <p className="mt-3 max-w-2xl text-teal-200">{course.short_description}</p>
                </div>
            </section>

            <section className="mx-auto grid max-w-container gap-10 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8">
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-semibold text-text">Overview</h2>
                    <p className="mt-3 whitespace-pre-line text-text-secondary">{course.description}</p>

                    {course.syllabus && (
                        <>
                            <h2 className="mt-8 text-xl font-semibold text-text">Syllabus</h2>
                            <p className="mt-3 whitespace-pre-line text-text-secondary">{course.syllabus}</p>
                        </>
                    )}

                    {course.lessons.length > 0 && (
                        <>
                            <h2 className="mt-8 text-xl font-semibold text-text">Free Preview</h2>
                            <ul className="mt-3 divide-y divide-border rounded-xl border border-border">
                                {course.lessons.map((lesson) => (
                                    <li key={lesson.id} className="flex items-center justify-between px-4 py-3 text-sm">
                                        <span className="text-text">{lesson.title}</span>
                                        <span className="text-xs uppercase text-text-muted">{lesson.type.replace('_', ' ')}</span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}

                    {course.instructor && (
                        <div className="mt-10 rounded-2xl border border-border bg-surface p-6">
                            <h3 className="font-semibold text-text">Instructor</h3>
                            <div className="mt-2 text-lg font-semibold text-primary">{course.instructor.name}</div>
                            <div className="text-sm text-text-secondary">{course.instructor.qualification}</div>
                            <p className="mt-2 text-sm text-text-secondary">{course.instructor.bio}</p>
                        </div>
                    )}

                    {course.approved_reviews.length > 0 && (
                        <div className="mt-10">
                            <h2 className="text-xl font-semibold text-text">
                                Student Reviews
                                <span className="ml-2 text-sm font-normal text-text-secondary">
                                    ({(course.approved_reviews.reduce((s, r) => s + r.rating, 0) / course.approved_reviews.length).toFixed(1)} avg · {course.approved_reviews.length} review{course.approved_reviews.length === 1 ? '' : 's'})
                                </span>
                            </h2>
                            <div className="mt-3 space-y-3">
                                {course.approved_reviews.map((r) => (
                                    <div key={r.id} className="rounded-xl border border-border bg-surface p-4">
                                        <div className="flex items-center justify-between">
                                            <Stars rating={r.rating} />
                                            <span className="text-sm font-semibold text-text">{r.user?.name ?? 'Student'}</span>
                                        </div>
                                        {r.review_text && <p className="mt-2 text-sm text-text-secondary">{r.review_text}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <aside>
                    <div className="sticky top-24 rounded-2xl border border-border bg-surface p-6 shadow-md">
                        <div className="text-3xl font-bold text-primary">
                            {course.base_price ? `Rs. ${Number(course.base_price).toLocaleString()}` : 'Contact us'}
                        </div>
                        <Link
                            href="/register"
                            className="mt-4 block rounded-xl bg-primary py-3 text-center font-semibold text-on-primary hover:bg-primary-hover"
                        >
                            Enroll Now
                        </Link>

                        {course.packages.length > 0 && (
                            <div className="mt-6 space-y-3">
                                <div className="text-sm font-semibold text-text">Packages</div>
                                {course.packages.map((pkg) => (
                                    <div key={pkg.id} className="rounded-lg border border-border p-3">
                                        <div className="flex justify-between text-sm font-medium text-text">
                                            <span>{pkg.name}</span>
                                            <span>Rs. {Number(pkg.price).toLocaleString()}</span>
                                        </div>
                                        {pkg.description && <p className="mt-1 text-xs text-text-secondary">{pkg.description}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </aside>
            </section>
        </PublicLayout>
    );
}
