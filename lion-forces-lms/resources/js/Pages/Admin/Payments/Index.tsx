import { Head, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Payment {
    id: number; amount: string; method: string; status: string; reference_number: string | null; proof_file_path: string | null; created_at: string;
    enrollment: { user: { name: string; email: string } | null; course: { title: string } | null } | null;
}
interface Props {
    payments: { data: Payment[]; links: { url: string | null; label: string; active: boolean }[]; total: number };
    filters: { status?: string; search?: string; date_from?: string; date_to?: string };
}

export default function PaymentsIndex({ payments, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');

    function applyFilters(e?: FormEvent) {
        e?.preventDefault();
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        if (filters.status) params.status = filters.status;
        router.get('/admin/payments', params, { preserveState: true });
    }

    function clearFilters() {
        setSearch(''); setDateFrom(''); setDateTo('');
        router.get('/admin/payments');
    }

    function setStatus(s: string | null) {
        router.get('/admin/payments', { ...filters, status: s ?? undefined }, { preserveState: true });
    }

    return (
        <AdminLayout header="Transactions">
            <Head title="Transactions" />

            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-gradient-to-br from-secondary to-teal-800 p-6 text-white sm:p-8">
                <div className="flex gap-4">
                    <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white/15">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                        </svg>
                    </span>
                    <div>
                        <h1 className="font-display text-3xl">Transactions</h1>
                        <p className="mt-2 max-w-xl text-sm text-teal-100">
                            Payment and received records — created from enrollments or student payment assignments.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    {payments.total} total
                </div>
            </div>

            <form onSubmit={applyFilters} className="mb-6 rounded-3xl border border-border bg-surface p-5">
                <p className="mb-3 flex items-center gap-1.5 text-sm font-bold text-text">
                    <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18l-7 8v6l-4 2v-8L3 4z" /></svg>
                    Filters
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase text-text-muted">Search by student</label>
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name or email" className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase text-text-muted">Date from</label>
                        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase text-text-muted">Date to</label>
                        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
                    </div>
                    <div className="flex items-end gap-2">
                        <button type="submit" className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary hover:bg-primary-hover">Apply filters</button>
                        <button type="button" onClick={clearFilters} className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-bold text-text-secondary hover:bg-surface-sunken">Clear</button>
                    </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                    {[null, 'pending', 'verified', 'rejected'].map((s) => (
                        <button
                            key={s ?? 'all'}
                            type="button"
                            onClick={() => setStatus(s)}
                            className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize ${(filters.status ?? null) === s ? 'bg-primary text-on-primary' : 'bg-surface-sunken text-text-secondary hover:bg-primary-subtle'}`}
                        >
                            {s ?? 'All'}
                        </button>
                    ))}
                </div>
            </form>

            <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
                <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="border-b border-border bg-surface-sunken text-xs uppercase tracking-wide text-text-muted">
                        <tr>
                            <th className="px-5 py-3">Date &amp; Time</th>
                            <th className="px-5 py-3">Student</th>
                            <th className="px-5 py-3">Course</th>
                            <th className="px-5 py-3">Method</th>
                            <th className="px-5 py-3">Amount</th>
                            <th className="px-5 py-3">Proof</th>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {payments.data.map((p) => (
                            <tr key={p.id}>
                                <td className="whitespace-nowrap px-5 py-3 text-text-secondary">
                                    {new Date(p.created_at).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                </td>
                                <td className="px-5 py-3">
                                    <div className="font-medium text-text">{p.enrollment?.user?.name}</div>
                                    <div className="text-xs text-text-muted">{p.enrollment?.user?.email}</div>
                                </td>
                                <td className="px-5 py-3 text-text-secondary">{p.enrollment?.course?.title ?? '—'}</td>
                                <td className="px-5 py-3 capitalize text-text-secondary">{p.method.replace('_', ' ')}</td>
                                <td className="px-5 py-3 font-semibold text-text">PKR {Number(p.amount).toLocaleString()}</td>
                                <td className="px-5 py-3">
                                    {p.proof_file_path ? (
                                        <a href={`/storage/${p.proof_file_path}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">View</a>
                                    ) : (
                                        <span className="text-text-muted">—</span>
                                    )}
                                    {p.reference_number && <div className="text-xs text-text-muted">Ref: {p.reference_number}</div>}
                                </td>
                                <td className="px-5 py-3">
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${
                                        p.status === 'verified' ? 'bg-success-bg text-success' : p.status === 'pending' ? 'bg-warning-bg text-warning' : 'bg-danger-bg text-danger'
                                    }`}>{p.status}</span>
                                </td>
                                <td className="px-5 py-3 text-right">
                                    {p.status === 'pending' && (
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => router.post(`/admin/payments/${p.id}/verify`)} className="text-xs font-bold uppercase text-success hover:underline">Verify</button>
                                            <button onClick={() => router.post(`/admin/payments/${p.id}/reject`)} className="text-xs font-bold uppercase text-danger hover:underline">Reject</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {payments.data.length === 0 && <p className="py-10 text-center text-text-secondary">No transactions found.</p>}

            <div className="mt-6 flex flex-wrap justify-center gap-2">
                {payments.links.map((link, i) => (
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
