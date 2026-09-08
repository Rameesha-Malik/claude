import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Course {
    id: number; title: string; slug: string; status: string; base_price: string | null;
    category: { name: string } | null; instructor: { name: string } | null;
    enrollments_count: number; sections_count: number;
}
interface Props {
    courses: { data: Course[]; links: { url: string | null; label: string; active: boolean }[]; total: number };
    filters: { search?: string; status?: string; per_page?: string };
    stats: { total: number; active: number; enrolled: number };
}

function ActionIcon({ title, onClick, href, children, tone = 'text' }: { title: string; onClick?: () => void; href?: string; children: React.ReactNode; tone?: 'text' | 'warning' | 'danger' }) {
    const cls = `rounded-lg p-1.5 transition-colors hover:bg-surface-sunken ${tone === 'warning' ? 'text-warning' : tone === 'danger' ? 'text-danger' : 'text-text-secondary hover:text-text'}`;
    if (href) return <Link href={href} title={title} className={cls}>{children}</Link>;
    return <button type="button" title={title} onClick={onClick} className={cls}>{children}</button>;
}

export default function CoursesIndex({ courses, filters, stats }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function submitSearch(e: FormEvent) {
        e.preventDefault();
        router.get('/admin/courses', { ...filters, search: search || undefined }, { preserveState: true });
    }

    function setStatus(s: 'active' | 'inactive' | null) {
        router.get('/admin/courses', { ...filters, status: s ?? undefined }, { preserveState: true });
    }

    function setPerPage(v: string) {
        router.get('/admin/courses', { ...filters, per_page: v }, { preserveState: true });
    }

    function toggleStatus(c: Course) {
        router.post(`/admin/courses/${c.id}/toggle-status`, {}, { preserveScroll: true });
    }

    function destroyCourse(c: Course) {
        if (confirm(`Delete "${c.title}" permanently? This removes its topics, lectures, packages and enrollments.`)) {
            router.delete(`/admin/courses/${c.id}`, { preserveScroll: true });
        }
    }

    return (
        <AdminLayout header="Courses">
            <Head title="Courses" />

            <div className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-border bg-gradient-to-br from-primary-subtle to-surface p-6 sm:p-8">
                <div className="flex gap-4">
                    <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary text-on-primary">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </span>
                    <div>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary shadow-sm">
                            Course Management
                        </span>
                        <h1 className="mt-3 font-display text-3xl text-text">Courses</h1>
                        <p className="mt-2 max-w-xl text-sm text-text-secondary">
                            Manage course records, browse topics, and jump into quiz management from one place.
                        </p>
                    </div>
                </div>
                <div className="flex flex-shrink-0 gap-3">
                    <div className="rounded-2xl border border-border bg-surface px-5 py-3 text-center shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Total</p>
                        <p className="font-display text-2xl text-text">{stats.total}</p>
                    </div>
                    <div className="rounded-2xl border border-success bg-success-bg px-5 py-3 text-center shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-wide text-success">Active</p>
                        <p className="font-display text-2xl text-text">{stats.active}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-surface-sunken px-5 py-3 text-center shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Enrolled</p>
                        <p className="font-display text-2xl text-text">{stats.enrolled}</p>
                    </div>
                </div>
            </div>

            <div className="mb-4 rounded-3xl border border-border bg-surface p-5">
                <form onSubmit={submitSearch} className="flex flex-wrap gap-3">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search courses…"
                        className="min-w-[240px] flex-1 rounded-lg border border-border px-3 py-2.5 text-sm"
                    />
                    <select value={filters.per_page ?? '15'} onChange={(e) => setPerPage(e.target.value)} className="rounded-lg border border-border px-3 py-2.5 text-sm">
                        {['15', '30', '50'].map((n) => <option key={n} value={n}>{n} / page</option>)}
                    </select>
                    <button type="submit" className="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-on-primary hover:bg-primary-hover">Search</button>
                </form>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex gap-2">
                        {[[null, 'All'], ['active', 'Active'], ['inactive', 'Inactive']].map(([key, label]) => (
                            <button
                                key={label}
                                onClick={() => setStatus(key as 'active' | 'inactive' | null)}
                                className={`rounded-full px-3 py-1.5 text-sm font-medium ${(filters.status ?? null) === key ? 'bg-primary text-on-primary' : 'bg-surface-sunken text-text-secondary hover:bg-primary-subtle'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    <Link href="/admin/courses/create" className="rounded-xl bg-secondary px-5 py-2.5 text-sm font-bold uppercase text-on-secondary hover:bg-teal-800">
                        + Add Course
                    </Link>
                </div>
            </div>

            <div className="mb-3 text-sm text-text-secondary">{courses.total} course{courses.total === 1 ? '' : 's'}</div>

            {courses.data.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center text-text-secondary">No courses found.</div>
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {courses.data.map((c) => (
                        <div key={c.id} className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">
                            <div className="relative bg-gradient-to-br from-teal-600 via-teal-800 to-teal-950 p-5 text-white">
                                <span className={`absolute right-4 top-4 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${c.status === 'published' ? 'bg-success text-white' : 'bg-white/20 text-white'}`}>
                                    {c.status === 'published' ? 'Active' : 'Inactive'}
                                </span>
                                <h3 className="mt-2 max-w-[80%] truncate text-lg font-bold">{c.title}</h3>
                                <p className="text-sm text-teal-100">{c.instructor?.name ?? 'System'}</p>
                            </div>

                            <div className="grid grid-cols-2 divide-x divide-border border-b border-border">
                                <div className="p-4 text-center">
                                    <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Topics</p>
                                    <p className="mt-1 font-display text-xl text-primary">{c.sections_count} <span className="text-xs font-sans font-normal text-text-muted">total</span></p>
                                </div>
                                <div className="p-4 text-center">
                                    <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Enrollments</p>
                                    <p className="mt-1 font-display text-xl text-text">{c.enrollments_count} <span className="text-xs font-sans font-normal text-text-muted">active</span></p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 p-4">
                                <Link href={`/admin/courses/${c.id}/edit`} className="flex items-center justify-center gap-1.5 rounded-xl bg-primary-subtle px-3 py-2 text-sm font-bold text-primary hover:opacity-90">
                                    Topics <span className="rounded-full bg-primary px-1.5 text-xs text-on-primary">{c.sections_count}</span>
                                </Link>
                                <Link href={`/admin/courses/${c.id}/quizzes`} className="flex items-center justify-center gap-1.5 rounded-xl bg-surface-sunken px-3 py-2 text-sm font-bold text-text hover:bg-border">
                                    Quiz
                                </Link>
                            </div>

                            <div className="flex items-center justify-between border-t border-border px-4 py-3">
                                <div className="flex items-center gap-1">
                                    <ActionIcon title="Edit" href={`/admin/courses/${c.id}/edit`}>
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.5-9.5a2.121 2.121 0 013 3L12 16l-4 1 1-4 9.5-9.5z" /></svg>
                                    </ActionIcon>
                                    <ActionIcon title={c.status === 'published' ? 'Deactivate' : 'Activate'} onClick={() => toggleStatus(c)} tone="warning">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v9m6.364-6.364a9 9 0 11-12.728 0" /></svg>
                                    </ActionIcon>
                                    <ActionIcon title="Delete" onClick={() => destroyCourse(c)} tone="danger">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 6l1 14a2 2 0 002 2h6a2 2 0 002-2l1-14M4 6h16M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>
                                    </ActionIcon>
                                </div>
                                <a href={`/courses/${c.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm font-bold text-primary hover:underline">
                                    Open
                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-6 flex flex-wrap justify-center gap-2">
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
        </AdminLayout>
    );
}
