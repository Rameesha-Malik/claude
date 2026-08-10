import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Course { id: number; title: string; status: string; base_price: string | null; category: { name: string } | null }
interface Props {
    courses: { data: Course[]; links: { url: string | null; label: string; active: boolean }[] };
    filters: { search?: string; status?: string };
}

export default function CoursesIndex({ courses, filters }: Props) {
    return (
        <AdminLayout header="Courses">
            <Head title="Courses" />

            <div className="mb-4 flex items-center justify-between">
                <div className="flex gap-2">
                    {[null, 'draft', 'published', 'hidden'].map((s) => (
                        <button
                            key={s ?? 'all'}
                            onClick={() => router.get('/admin/courses', { ...filters, status: s ?? undefined }, { preserveState: true })}
                            className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize ${
                                (filters.status ?? null) === s ? 'bg-primary text-on-primary' : 'bg-surface text-text-secondary hover:bg-primary-subtle'
                            }`}
                        >
                            {s ?? 'All'}
                        </button>
                    ))}
                </div>
                <Link href="/admin/courses/create" className="rounded-lg bg-primary px-4 py-2 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover">
                    + Add Course
                </Link>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-border bg-surface-sunken text-xs uppercase tracking-wide text-text-muted">
                        <tr>
                            <th className="px-5 py-3">Title</th>
                            <th className="px-5 py-3">Category</th>
                            <th className="px-5 py-3">Price</th>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {courses.data.map((c) => (
                            <tr key={c.id}>
                                <td className="px-5 py-3 font-medium text-text">{c.title}</td>
                                <td className="px-5 py-3 text-text-secondary">{c.category?.name}</td>
                                <td className="px-5 py-3 text-text-secondary">{c.base_price ? `Rs. ${Number(c.base_price).toLocaleString()}` : '—'}</td>
                                <td className="px-5 py-3">
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${
                                        c.status === 'published' ? 'bg-success-bg text-success' : c.status === 'draft' ? 'bg-warning-bg text-warning' : 'bg-surface-sunken text-text-muted'
                                    }`}>{c.status}</span>
                                </td>
                                <td className="px-5 py-3 text-right">
                                    <Link href={`/admin/courses/${c.id}/edit`} className="font-semibold text-primary hover:underline">Edit &rarr;</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {courses.data.length === 0 && <p className="py-10 text-center text-text-secondary">No courses yet.</p>}

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
