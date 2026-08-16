import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import GradientMesh from '@/Components/GradientMesh';
import RevealOnScroll from '@/Components/RevealOnScroll';
import PublicLayout from '@/Layouts/PublicLayout';

function SearchIcon() {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5 flex-shrink-0">
            <circle cx="9" cy="9" r="6" />
            <path strokeLinecap="round" d="M17.5 17.5 14 14" />
        </svg>
    );
}

function ClockIcon({ className = '' }: { className?: string }) {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className={`h-3.5 w-3.5 ${className}`}>
            <circle cx="10" cy="10" r="7.5" />
            <path strokeLinecap="round" d="M10 5.5V10l3 2" />
        </svg>
    );
}

function UsersIcon({ className = '' }: { className?: string }) {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className={`h-3.5 w-3.5 ${className}`}>
            <circle cx="7" cy="6.5" r="2.5" />
            <path strokeLinecap="round" d="M2.5 16c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5" />
            <path strokeLinecap="round" d="M12.5 4.6a2.5 2.5 0 010 4.8M15 16c0-2-1.3-3.7-3-4.3" />
        </svg>
    );
}

function TopicIcon({ className = '' }: { className?: string }) {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className={`h-3.5 w-3.5 ${className}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 4.5h5l8 8-5 5-8-8v-5z" />
            <circle cx="7" cy="8" r="1" fill="currentColor" stroke="none" />
        </svg>
    );
}

function LessonIcon({ className = '' }: { className?: string }) {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className={`h-3.5 w-3.5 ${className}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5.5A2 2 0 015 3.5h6l4 4v9a2 2 0 01-2 2H5a2 2 0 01-2-2v-11z" />
            <path strokeLinecap="round" d="M11 3.5v4h4M6.5 11h5M6.5 14h5" />
        </svg>
    );
}

interface Course {
    id: number; title: string; slug: string; short_description: string | null; thumbnail_path: string | null;
    base_price: string | null; hours: number | null; level: string | null;
    lessons_count: number; enrollments_count: number; topics_count: number;
    category: { name: string } | null; instructor: { name: string } | null;
}
interface Props {
    courses: { data: Course[]; links: { url: string | null; label: string; active: boolean }[] };
    categories: { name: string; slug: string }[];
    filters: { category?: string; search?: string };
}

export default function Courses({ courses, categories, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function submitSearch(e: FormEvent) {
        e.preventDefault();
        router.get('/courses', { ...filters, search }, { preserveState: true });
    }

    function selectCategory(slug: string | null) {
        router.get('/courses', { ...filters, category: slug ?? undefined }, { preserveState: true });
    }

    return (
        <PublicLayout>
            <Head title="Courses" />

            <section className="relative overflow-hidden bg-gradient-to-br from-secondary to-teal-950 py-20">
                {/* dot-grid pattern + drifting gradient blobs -- breaks up the
                    flat dark fill instead of leaving it a solid gradient */}
                <div
                    aria-hidden
                    className="absolute inset-0 opacity-[0.15]"
                    style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.7) 1.5px, transparent 1.5px)', backgroundSize: '20px 20px' }}
                />
                <GradientMesh className="opacity-70" />

                <div className="relative mx-auto max-w-container px-4 text-center sm:px-6 lg:px-8">
                    <h1 className="font-display text-5xl uppercase tracking-wide text-white">Courses</h1>
                    <p className="mt-3 text-teal-200">Structured preparation for every major service entry test.</p>

                    <form onSubmit={submitSearch} className="mx-auto mt-8 flex max-w-lg items-center gap-1.5 rounded-full bg-white p-1.5 pl-5 shadow-xl">
                        <SearchIcon />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search courses..."
                            className="w-full border-0 bg-transparent py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-0"
                        />
                        <button
                            type="submit"
                            className="flex-shrink-0 rounded-full bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-on-primary shadow-sm transition-colors duration-fast hover:bg-primary-hover"
                        >
                            Search
                        </button>
                    </form>

                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                        <button
                            onClick={() => selectCategory(null)}
                            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${!filters.category ? 'bg-primary text-on-primary' : 'border border-white/20 bg-white/5 text-teal-200 hover:bg-white/10'}`}
                        >
                            All
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.slug}
                                onClick={() => selectCategory(cat.slug)}
                                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${filters.category === cat.slug ? 'bg-primary text-on-primary' : 'border border-white/20 bg-white/5 text-teal-200 hover:bg-white/10'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-container px-4 py-16 sm:px-6 lg:px-8">
                <RevealOnScroll className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                    {courses.data.map((course) => (
                        <div key={course.id} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-normal hover:-translate-y-1.5 hover:border-primary hover:shadow-2xl">
                            <div className="relative h-40 overflow-hidden bg-gradient-to-br from-teal-600 via-teal-800 to-teal-950">
                                {course.thumbnail_path ? (
                                    <img
                                        src={`/storage/${course.thumbnail_path}`}
                                        alt=""
                                        className="h-full w-full object-cover transition-transform duration-slow group-hover:scale-110"
                                    />
                                ) : (
                                    <>
                                        <div
                                            aria-hidden
                                            className="absolute inset-0 opacity-[0.12]"
                                            style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1.5px, transparent 1.5px)', backgroundSize: '16px 16px' }}
                                        />
                                        <span
                                            aria-hidden
                                            className="absolute -right-4 -top-4 h-16 w-16 rotate-12 rounded-lg bg-white/10 transition-transform duration-slow group-hover:rotate-45"
                                        />
                                        <div className="flex h-full items-center justify-center">
                                            <span className="relative font-display text-2xl uppercase tracking-widest text-white">
                                                {course.category?.name ?? 'Course'}
                                            </span>
                                        </div>
                                    </>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-normal group-hover:opacity-100" />
                                <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                                    {course.category && (
                                        <span className="rounded-full bg-surface/95 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-secondary shadow-sm">
                                            {course.category.name}
                                        </span>
                                    )}
                                    {course.level && (
                                        <span className="rounded-full bg-primary-subtle px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-primary shadow-sm">
                                            {course.level}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-1 flex-col p-5">
                                <h3 className="font-display text-lg uppercase tracking-wide text-text group-hover:text-primary">{course.title}</h3>
                                {course.instructor && (
                                    <div className="mt-1.5 flex items-center gap-1.5">
                                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary-subtle text-[0.6rem] font-bold text-primary">
                                            {course.instructor.name.charAt(0).toUpperCase()}
                                        </span>
                                        <p className="text-xs font-medium text-text-secondary">{course.instructor.name}</p>
                                    </div>
                                )}
                                <p className="mt-2.5 line-clamp-2 flex-1 text-sm leading-relaxed text-text-secondary">{course.short_description}</p>

                                <div className="mt-4 flex flex-wrap gap-1.5">
                                    {course.hours && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-surface-sunken px-2.5 py-1 text-[0.7rem] font-medium text-text-secondary">
                                            <ClockIcon className="text-primary" /> {course.hours}h
                                        </span>
                                    )}
                                    {course.topics_count > 0 && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-surface-sunken px-2.5 py-1 text-[0.7rem] font-medium text-text-secondary">
                                            <TopicIcon className="text-primary" /> {course.topics_count} topic{course.topics_count === 1 ? '' : 's'}
                                        </span>
                                    )}
                                    {course.lessons_count > 0 && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-surface-sunken px-2.5 py-1 text-[0.7rem] font-medium text-text-secondary">
                                            <LessonIcon className="text-primary" /> {course.lessons_count} lesson{course.lessons_count === 1 ? '' : 's'}
                                        </span>
                                    )}
                                    {course.enrollments_count > 0 && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-surface-sunken px-2.5 py-1 text-[0.7rem] font-medium text-text-secondary">
                                            <UsersIcon className="text-primary" /> {course.enrollments_count} enrolled
                                        </span>
                                    )}
                                </div>

                                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                                    <div>
                                        <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-text-muted">Starting from</p>
                                        <span className="font-display text-xl text-primary">
                                            {course.base_price ? `Rs. ${Number(course.base_price).toLocaleString()}` : 'Free'}
                                        </span>
                                    </div>
                                    <Link
                                        href={`/courses/${course.slug}`}
                                        className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wide text-on-primary shadow-sm transition-all duration-fast hover:bg-primary-hover hover:shadow-md"
                                    >
                                        View Course
                                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 transition-transform duration-fast group-hover:translate-x-0.5">
                                            <path d="M11.3 3.3a1 1 0 011.4 0l5 5a1 1 0 010 1.4l-5 5a1 1 0 11-1.4-1.4L14.6 10H4a1 1 0 010-2h10.6l-3.3-3.3a1 1 0 010-1.4z" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </RevealOnScroll>

                {courses.data.length === 0 && (
                    <p className="py-16 text-center text-text-secondary">No courses match your filters yet.</p>
                )}

                <div className="mt-10 flex flex-wrap justify-center gap-2">
                    {courses.links.map((link, i) => (
                        <button
                            key={i}
                            disabled={!link.url}
                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                            className={`rounded-lg px-4 py-2 text-sm ${link.active ? 'bg-primary text-on-primary' : 'bg-surface text-text-secondary hover:bg-primary-subtle'} disabled:opacity-40`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </section>
        </PublicLayout>
    );
}
