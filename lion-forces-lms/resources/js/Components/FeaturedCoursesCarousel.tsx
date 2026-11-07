import { useRef } from 'react';
import { Link } from '@inertiajs/react';

// Horizontal-scroll "offer deck" layout, inspired by the 21st.dev
// "Offer Carousel" reference -- replaces the earlier glassmorphism grid with
// native scroll-snap (no extra JS carousel state needed) driven by real
// course data instead of the reference's hardcoded deals.

export interface CourseCarouselItem {
    id: number;
    title: string;
    slug: string;
    short_description: string | null;
    thumbnail_path: string | null;
    base_price: string | null;
    hours: number | null;
    enrollments_count: number;
    topics_count: number;
    category: { name: string } | null;
}

function money(v: string | null) {
    if (!v) return null;
    return `Rs. ${Number(v).toLocaleString()}`;
}

function TagIcon() {
    return (
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3.17L4 3a1 1 0 0 0-1 1l.17 5.59a2 2 0 0 0 .66 1.41l9.58 9.59a2 2 0 0 0 2.83 0l4.35-4.35a2 2 0 0 0 0-2.83Z" />
            <circle cx="7.5" cy="7.5" r="1.1" fill="currentColor" stroke="none" />
        </svg>
    );
}

function ClockIcon() {
    return (
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" d="M12 7v5l3 3" />
        </svg>
    );
}

function UsersIcon() {
    return (
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <circle cx="9" cy="8" r="3" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 19a6.5 6.5 0 0 1 13 0M16 8.5a3 3 0 1 1 3.5 2.96M21.5 19a5.5 5.5 0 0 0-4.5-5.4" />
        </svg>
    );
}

function ArrowIcon() {
    return (
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 transition-transform duration-fast group-hover:translate-x-0.5">
            <path d="M11.3 3.3a1 1 0 011.4 0l5 5a1 1 0 010 1.4l-5 5a1 1 0 11-1.4-1.4L14.6 10H4a1 1 0 010-2h10.6l-3.3-3.3a1 1 0 010-1.4z" />
        </svg>
    );
}

export default function FeaturedCoursesCarousel({ courses }: { courses: CourseCarouselItem[] }) {
    const scrollerRef = useRef<HTMLDivElement>(null);

    const scrollBy = (dir: 1 | -1) => {
        const el = scrollerRef.current;
        if (!el) return;
        const card = el.querySelector<HTMLElement>('[data-card]');
        const step = (card?.offsetWidth ?? 320) + 24;
        el.scrollBy({ left: dir * step, behavior: 'smooth' });
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => scrollBy(-1)}
                aria-label="Previous courses"
                className="absolute -left-4 top-[38%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-text shadow-lg transition-colors duration-fast hover:border-primary hover:text-primary sm:flex"
            >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button
                type="button"
                onClick={() => scrollBy(1)}
                aria-label="Next courses"
                className="absolute -right-4 top-[38%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-text shadow-lg transition-colors duration-fast hover:border-primary hover:text-primary sm:flex"
            >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            </button>

            <div
                ref={scrollerRef}
                className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-pl-4 pb-4 [-ms-overflow-style:none] [scrollbar-width:thin] sm:scroll-pl-0 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent"
            >
                {courses.map((course) => (
                    <div
                        key={course.id}
                        data-card
                        className="group w-[17rem] flex-shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-normal hover:-translate-y-1 hover:border-primary hover:shadow-xl sm:w-80"
                    >
                        <div className="relative h-44 overflow-hidden bg-secondary">
                            {course.thumbnail_path ? (
                                <img
                                    src={`/storage/${course.thumbnail_path}`}
                                    alt=""
                                    className="h-full w-full object-cover transition-transform duration-slow group-hover:scale-110"
                                />
                            ) : (
                                <>
                                    <span
                                        aria-hidden
                                        className="absolute -right-4 -top-4 h-16 w-16 rotate-12 rounded-[1rem] bg-white/10 transition-transform duration-slow group-hover:rotate-45"
                                    />
                                    <div className="flex h-full items-center justify-center">
                                        <span className="relative font-display text-2xl uppercase tracking-widest text-white">
                                            {course.category?.name ?? 'Course'}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="p-5">
                            {course.category && (
                                <span className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-text-muted">
                                    <TagIcon /> {course.category.name}
                                </span>
                            )}
                            <h3 className="font-bold text-text group-hover:text-primary">{course.title}</h3>
                            {course.short_description && (
                                <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{course.short_description}</p>
                            )}

                            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-text-muted">
                                {course.hours && (
                                    <span className="inline-flex items-center gap-1">
                                        <ClockIcon /> {course.hours}h
                                    </span>
                                )}
                                {course.topics_count > 0 && (
                                    <span className="inline-flex items-center gap-1">{course.topics_count} topics</span>
                                )}
                                {course.enrollments_count > 0 && (
                                    <span className="inline-flex items-center gap-1">
                                        <UsersIcon /> {course.enrollments_count}+ enrolled
                                    </span>
                                )}
                            </div>

                            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                                <span className="font-display text-lg text-primary">{money(course.base_price) ?? 'Free'}</span>
                                <Link
                                    href={`/courses/${course.slug}`}
                                    aria-label={`View ${course.title}`}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-on-primary shadow-sm transition-all duration-fast hover:bg-primary-hover hover:shadow-md"
                                >
                                    <ArrowIcon />
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
