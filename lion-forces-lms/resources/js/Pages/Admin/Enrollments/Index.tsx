import { Head, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Enrollment {
    id: number; status: string; activated_at: string | null; expires_at: string | null; created_at: string;
    user: { name: string; email: string } | null;
    course: { title: string } | null;
    package: { name: string } | null;
}
interface Props {
    enrollments: { data: Enrollment[]; links: { url: string | null; label: string; active: boolean }[] };
    filters: { status?: string; search?: string };
}

const STATUSES = [null, 'pending', 'active', 'expired', 'cancelled'];

export default function EnrollmentsIndex({ enrollments, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function applySearch(e: FormEvent) {
        e.preventDefault();
        router.get('/admin/enrollments', { ...filters, search: search || undefined }, { preserveState: true });
    }

    function setStatus(s: string | null) {
        router.get('/admin/enrollments', { ...filters, status: s ?? undefined }, { preserveState: true });
    }

    return (
        <AdminLayout header="Enrollments">
            <Head title="Enrollments" />

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                    {STATUSES.map((s) => (
                        <button
                            key={s ?? 'all'}
                            onClick={() => setStatus(s)}
                            className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize ${(filters.status ?? null) === s ? 'bg-primary text-on-primary' : 'bg-surface text-text-secondary hover:bg-primary-subtle'}`}
                        >
                            {s ?? 'All'}
                        </button>
                    ))}
                </div>
                <form onSubmit={applySearch} className="flex gap-2">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search student name or email…"
                        className="w-64 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
                    />
                    <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary hover:bg-primary-hover">
                        Search
                    </button>
                </form>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
                <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="border-b border-border bg-surface-sunken text-xs uppercase tracking-wide text-text-muted">
                        <tr>
                            <th className="px-5 py-3">Student</th>
                            <th className="px-5 py-3">Course</th>
                            <th className="px-5 py-3">Package</th>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3">Activated</th>
                            <th className="px-5 py-3">Expires</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {enrollments.data.map((e) => (
                            <tr key={e.id}>
                                <td className="px-5 py-3">
                                    <div className="font-medium text-text">{e.user?.name}</div>
                                    <div className="text-xs text-text-muted">{e.user?.email}</div>
                                </td>
                                <td className="px-5 py-3 text-text-secondary">{e.course?.title ?? '—'}</td>
                                <td className="px-5 py-3 text-text-secondary">{e.package?.name ?? '—'}</td>
                                <td className="px-5 py-3">
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${
                                        e.status === 'active' ? 'bg-success-bg text-success' : e.status === 'pending' ? 'bg-warning-bg text-warning' : 'bg-danger-bg text-danger'
                                    }`}>{e.status}</span>
                                </td>
                                <td className="px-5 py-3 text-text-secondary">
                                    {e.activated_at ? new Date(e.activated_at).toLocaleDateString() : '—'}
                                </td>
                                <td className="px-5 py-3 text-text-secondary">
                                    {e.expires_at ? new Date(e.expires_at).toLocaleDateString() : '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {enrollments.data.length === 0 && <p className="py-10 text-center text-text-secondary">No enrollments found.</p>}

            <div className="mt-6 flex flex-wrap justify-center gap-2">
                {enrollments.links.map((link, i) => (
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
