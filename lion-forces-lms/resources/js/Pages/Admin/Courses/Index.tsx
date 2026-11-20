import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import EmptyState from '@/Components/EmptyState';
import Pagination from '@/Components/Pagination';

interface Category { id: number; name: string }
interface Course {
    id: number; title: string; slug: string; status: 'draft' | 'published' | 'hidden';
    thumbnail_path: string | null; base_price: string | null; cheapest_package_price: string | null;
    category: Category | null; instructor: { name: string } | null; created_at: string;
    enrollments_count: number; sections_count: number; lessons_count: number; quizzes_count: number; assignments_count: number;
}
interface Props {
    courses: { data: Course[]; links: { url: string | null; label: string; active: boolean }[]; total: number };
    categories: Category[];
    filters: { search?: string; status?: string; per_page?: string; category_id?: string; sort: 'order' | 'title' | 'date'; direction: 'asc' | 'desc' };
    stats: { total: number; active: number; enrolled: number };
}

const STATUS_STYLE: Record<Course['status'], string> = {
    published: 'bg-success-bg text-success',
    draft: 'bg-surface-sunken text-text-secondary',
    hidden: 'bg-warning-bg text-warning',
};

function CountPill({ icon, value, title }: { icon: React.ReactNode; value: number; title: string }) {
    return (
        <span title={title} className="inline-flex items-center gap-1 text-text-muted">
            {icon}
            {value}
        </span>
    );
}

function TopicIcon() {
    return <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>;
}
function LessonIcon() {
    return <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.25C10.5 5 8.5 4.5 6 4.5v13c2.5 0 4.5.5 6 1.75m0-13c1.5-1.25 3.5-1.75 6-1.75v13c-2.5 0-4.5.5-6 1.75m0-13v13" /></svg>;
}
function QuizIcon() {
    return <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
function AssignmentIcon() {
    return <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-6 4h6M9 5h1a2 2 0 002-2 2 2 0 002 2h1a2 2 0 012 2v12a2 2 0 01-2 2H9a2 2 0 01-2-2V7a2 2 0 012-2z" /></svg>;
}
function SortIcon({ active, direction }: { active: boolean; direction: 'asc' | 'desc' }) {
    return (
        <svg className={`h-3 w-3 ${active ? 'text-primary' : 'text-text-faint'}`} fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24">
            {active && direction === 'desc' ? <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />}
        </svg>
    );
}

export default function CoursesIndex({ courses, categories, filters, stats }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [selected, setSelected] = useState<number[]>([]);
    const [bulkChoice, setBulkChoice] = useState('');
    const [filtersOpen, setFiltersOpen] = useState(false);

    function reload(overrides: Record<string, string | undefined>) {
        router.get('/admin/courses', { ...filters, ...overrides }, { preserveState: true });
    }

    function submitSearch(e: FormEvent) {
        e.preventDefault();
        reload({ search: search || undefined });
    }

    function toggleSort(column: 'title' | 'date') {
        const direction = filters.sort === column && filters.direction === 'asc' ? 'desc' : 'asc';
        reload({ sort: column, direction });
    }

    function toggleSelectAll() {
        setSelected(selected.length === courses.data.length ? [] : courses.data.map((c) => c.id));
    }

    function toggleSelect(id: number) {
        setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    }

    function applyBulk() {
        if (!bulkChoice || selected.length === 0) return;
        if (bulkChoice === 'delete' && !confirm(`Delete ${selected.length} course(s) permanently? Courses with active students are skipped automatically.`)) return;

        router.post('/admin/courses/bulk', { ids: selected, action: bulkChoice }, {
            preserveScroll: true,
            onSuccess: () => { setSelected([]); setBulkChoice(''); },
        });
    }

    function setStatus(c: Course, status: Course['status']) {
        router.post(`/admin/courses/${c.id}/status`, { status }, { preserveScroll: true });
    }

    function moveCourse(c: Course, direction: 'up' | 'down') {
        router.post(`/admin/courses/${c.id}/move`, { direction }, { preserveScroll: true });
    }

    function destroyCourse(c: Course) {
        if (confirm(`Delete "${c.title}" permanently? This removes its topics, lectures, packages, enrollments and payment records.`)) {
            router.delete(`/admin/courses/${c.id}`, {
                preserveScroll: true,
                onError: (errors) => {
                    const message = Object.values(errors)[0];
                    if (message) alert(message as string);
                },
            });
        }
    }

    function priceOf(c: Course): string {
        const p = c.cheapest_package_price ?? c.base_price;
        return p && Number(p) > 0 ? `Rs ${Number(p).toLocaleString()}` : 'Free';
    }

    return (
        <AdminLayout header="Courses">
            <Head title="Courses" />

            <AdminPageHeader
                eyebrow="Course Management"
                title="Courses"
                description="Browse topics, manage packages, and jump into quiz management for any course."
                right={
                    <>
                        <div className="rounded-[1.5rem] border border-border bg-surface px-5 py-3 text-center shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Total</p>
                            <p className="font-display text-2xl text-text">{stats.total}</p>
                        </div>
                        <div className="rounded-[1.5rem] border border-success bg-success-bg px-5 py-3 text-center shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-wide text-success">Active</p>
                            <p className="font-display text-2xl text-text">{stats.active}</p>
                        </div>
                        <div className="rounded-[1.5rem] border border-border bg-surface-sunken px-5 py-3 text-center shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Enrolled</p>
                            <p className="font-display text-2xl text-text">{stats.enrolled}</p>
                        </div>
                        <Link href="/admin/courses/create" className="flex items-center rounded-[1rem] bg-secondary px-5 py-2.5 text-sm font-bold uppercase text-on-secondary hover:bg-teal-800">
                            + New Course
                        </Link>
                    </>
                }
            />

            {/* Toolbar: bulk action (left) / filters + search (right) -- same row
                layout as every other reference admin list screen the client is
                already used to working in. */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-border bg-surface p-4">
                <div className="flex items-center gap-2">
                    <select
                        value={bulkChoice}
                        onChange={(e) => setBulkChoice(e.target.value)}
                        className="rounded-[0.75rem] border border-border px-3 py-2 text-sm disabled:opacity-50"
                        disabled={selected.length === 0}
                    >
                        <option value="">Bulk Action</option>
                        <option value="publish">Publish</option>
                        <option value="draft">Set as Draft</option>
                        <option value="hidden">Hide</option>
                        <option value="delete">Delete</option>
                    </select>
                    <button
                        type="button"
                        onClick={applyBulk}
                        disabled={selected.length === 0 || !bulkChoice}
                        className="rounded-[0.75rem] border border-border px-4 py-2 text-sm font-bold text-text-secondary hover:border-primary hover:text-primary disabled:opacity-40"
                    >
                        Apply {selected.length > 0 && `(${selected.length})`}
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setFiltersOpen((v) => !v)}
                            className="flex items-center gap-1.5 rounded-[0.75rem] border border-border px-4 py-2 text-sm font-bold text-text-secondary hover:border-primary hover:text-primary"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M7 12h10M10 18h4" /></svg>
                            Filters
                        </button>
                        {filtersOpen && (
                            <div className="absolute right-0 z-20 mt-2 w-64 space-y-3 rounded-[1rem] border border-border bg-surface p-4 shadow-xl">
                                <div>
                                    <label className="mb-1 block text-xs font-bold uppercase text-text-muted">Status</label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {[[undefined, 'All'], ['active', 'Active'], ['inactive', 'Inactive']].map(([key, label]) => (
                                            <button
                                                key={label}
                                                type="button"
                                                onClick={() => reload({ status: key })}
                                                className={`rounded-full px-3 py-1 text-xs font-bold ${(filters.status ?? undefined) === key ? 'bg-primary text-on-primary' : 'bg-surface-sunken text-text-secondary hover:bg-primary-subtle'}`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-bold uppercase text-text-muted">Category</label>
                                    <select
                                        value={filters.category_id ?? ''}
                                        onChange={(e) => reload({ category_id: e.target.value || undefined })}
                                        className="w-full rounded-[0.75rem] border border-border px-3 py-2 text-sm"
                                    >
                                        <option value="">All categories</option>
                                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-bold uppercase text-text-muted">Rows per page</label>
                                    <select value={filters.per_page ?? '15'} onChange={(e) => reload({ per_page: e.target.value })} className="w-full rounded-[0.75rem] border border-border px-3 py-2 text-sm">
                                        {['15', '30', '50'].map((n) => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={submitSearch} className="flex">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search…"
                            className="w-48 rounded-l-[0.75rem] border border-r-0 border-border px-3 py-2 text-sm"
                        />
                        <button type="submit" className="rounded-r-[0.75rem] border border-border bg-surface-sunken px-3 text-text-secondary hover:text-primary">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path strokeLinecap="round" d="M21 21l-4.3-4.3" /></svg>
                        </button>
                    </form>
                </div>
            </div>

            <div className="mb-3 text-sm text-text-secondary">{courses.total} course{courses.total === 1 ? '' : 's'}</div>

            {courses.data.length === 0 ? (
                <EmptyState>No courses found.</EmptyState>
            ) : (
                <div className="overflow-x-auto rounded-[1.5rem] border border-border bg-surface">
                    <table className="w-full min-w-[920px] text-left text-sm">
                        <thead className="border-b border-border bg-surface-sunken text-xs uppercase tracking-wide text-text-muted">
                            <tr>
                                <th className="w-10 px-4 py-3">
                                    <input type="checkbox" checked={selected.length === courses.data.length} onChange={toggleSelectAll} />
                                </th>
                                <th className="px-3 py-3">
                                    <button type="button" onClick={() => toggleSort('title')} className="flex items-center gap-1 hover:text-text">
                                        Title <SortIcon active={filters.sort === 'title'} direction={filters.direction} />
                                    </button>
                                </th>
                                <th className="px-3 py-3">Category</th>
                                <th className="px-3 py-3">Price</th>
                                <th className="px-3 py-3">Author</th>
                                <th className="px-3 py-3">
                                    <button type="button" onClick={() => toggleSort('date')} className="flex items-center gap-1 hover:text-text">
                                        Date <SortIcon active={filters.sort === 'date'} direction={filters.direction} />
                                    </button>
                                </th>
                                <th className="px-3 py-3">Status</th>
                                <th className="px-3 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {courses.data.map((c) => (
                                <tr key={c.id} className={selected.includes(c.id) ? 'bg-primary-subtle' : undefined}>
                                    <td className="px-4 py-3 align-top">
                                        <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggleSelect(c.id)} />
                                    </td>
                                    <td className="px-3 py-3">
                                        <div className="flex gap-3">
                                            <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-[0.5rem] bg-surface-sunken">
                                                {c.thumbnail_path ? (
                                                    <img src={`/storage/${c.thumbnail_path}`} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-text-faint">
                                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.5-4.5a2 2 0 012.8 0L17 17M4 6h16v12H4z" /></svg>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <Link href={`/admin/courses/${c.id}/edit`} className="font-semibold text-text hover:text-primary">{c.title}</Link>
                                                <div className="mt-1 flex flex-wrap gap-2.5 text-xs">
                                                    <CountPill icon={<TopicIcon />} value={c.sections_count} title="Topics" />
                                                    <CountPill icon={<LessonIcon />} value={c.lessons_count} title="Lessons" />
                                                    <CountPill icon={<QuizIcon />} value={c.quizzes_count} title="Quizzes" />
                                                    <CountPill icon={<AssignmentIcon />} value={c.assignments_count} title="Assignments" />
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 align-top text-text-secondary">{c.category?.name ?? '—'}</td>
                                    <td className="px-3 py-3 align-top font-medium text-text">{priceOf(c)}</td>
                                    <td className="px-3 py-3 align-top text-text-secondary">{c.instructor?.name ?? 'System'}</td>
                                    <td className="px-3 py-3 align-top text-text-secondary">{new Date(c.created_at).toLocaleDateString()}</td>
                                    <td className="px-3 py-3 align-top">
                                        <select
                                            value={c.status}
                                            onChange={(e) => setStatus(c, e.target.value as Course['status'])}
                                            className={`rounded-full border-0 px-3 py-1 text-xs font-bold uppercase tracking-wide ${STATUS_STYLE[c.status]}`}
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="published">Publish</option>
                                            <option value="hidden">Hidden</option>
                                        </select>
                                    </td>
                                    <td className="px-3 py-3 align-top">
                                        <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                                            <button type="button" title="Move up" onClick={() => moveCourse(c, 'up')} className="rounded-[0.5rem] p-1.5 text-text-secondary hover:bg-surface-sunken hover:text-text">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                                            </button>
                                            <button type="button" title="Move down" onClick={() => moveCourse(c, 'down')} className="rounded-[0.5rem] p-1.5 text-text-secondary hover:bg-surface-sunken hover:text-text">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                            </button>
                                            <Link href={`/admin/courses/${c.id}/edit`} title="Edit" className="rounded-[0.5rem] p-1.5 text-text-secondary hover:bg-surface-sunken hover:text-text">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.5-9.5a2.121 2.121 0 013 3L12 16l-4 1 1-4 9.5-9.5z" /></svg>
                                            </Link>
                                            <button type="button" title="Delete" onClick={() => destroyCourse(c)} className="rounded-[0.5rem] p-1.5 text-text-secondary hover:bg-danger-bg hover:text-danger">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 6l1 14a2 2 0 002 2h6a2 2 0 002-2l1-14M4 6h16M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>
                                            </button>
                                            <a href={`/courses/${c.slug}`} target="_blank" rel="noopener noreferrer" title="View on site" className="rounded-[0.5rem] p-1.5 text-text-secondary hover:bg-surface-sunken hover:text-text">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Pagination links={courses.links} className="mt-6 flex flex-wrap justify-center gap-2" />
        </AdminLayout>
    );
}
