import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import RevealOnScroll from '@/Components/RevealOnScroll';
import PublicLayout from '@/Layouts/PublicLayout';

interface Course {
    id: number; title: string; slug: string; short_description: string | null;
    base_price: string | null; hours: number | null; category: { name: string } | null;
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
                <div className="relative mx-auto max-w-container px-4 text-center sm:px-6 lg:px-8">
                    <h1 className="font-display text-5xl uppercase tracking-wide text-white">Courses</h1>
                    <p className="mt-3 text-teal-200">Structured preparation for every major service entry test.</p>

                    <form onSubmit={submitSearch} className="mx-auto mt-8 flex max-w-md gap-2">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search courses..."
                            className="w-full rounded-lg border-0 px-4 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                        <button type="submit" className="rounded-lg bg-accent px-6 py-3 text-sm font-bold uppercase tracking-wide text-accent-fg hover:bg-accent-hover">
                            Search
                        </button>
                    </form>

                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                        <button
                            onClick={() => selectCategory(null)}
                            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${!filters.category ? 'bg-accent text-accent-fg' : 'border border-white/20 bg-white/5 text-teal-200 hover:bg-white/10'}`}
                        >
                            All
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.slug}
                                onClick={() => selectCategory(cat.slug)}
                                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${filters.category === cat.slug ? 'bg-accent text-accent-fg' : 'border border-white/20 bg-white/5 text-teal-200 hover:bg-white/10'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-container px-4 py-16 sm:px-6 lg:px-8">
                <RevealOnScroll className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {courses.data.map((course) => (
                        <Link key={course.id} href={`/courses/${course.slug}`} className="group">
                            <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-normal group-hover:-translate-y-1 group-hover:shadow-xl">
                                <div className="flex h-36 items-center justify-center bg-gradient-to-br from-teal-600 to-teal-900 text-sm font-semibold text-white">
                                    {course.category?.name ?? 'Course'}
                                </div>
                                <div className="p-5">
                                    <h3 className="font-semibold text-text group-hover:text-primary">{course.title}</h3>
                                    <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{course.short_description}</p>
                                    <div className="mt-4 flex items-center justify-between text-sm">
                                        <span className="font-semibold text-primary">
                                            {course.base_price ? `Rs. ${Number(course.base_price).toLocaleString()}` : ''}
                                        </span>
                                        {course.hours && <span className="text-text-muted">{course.hours}h</span>}
                                    </div>
                                </div>
                            </div>
                        </Link>
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
