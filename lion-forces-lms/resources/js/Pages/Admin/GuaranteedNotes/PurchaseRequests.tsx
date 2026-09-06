import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Purchase {
    id: number; amount: string; method: string; status: string; reference_number: string | null; proof_file_path: string | null; created_at: string;
    user: { name: string; email: string } | null;
    note: { title: string } | null;
}
interface Props {
    purchases: { data: Purchase[]; links: { url: string | null; label: string; active: boolean }[] };
    filters: { status?: string };
}

export default function PurchaseRequestsIndex({ purchases, filters }: Props) {
    return (
        <AdminLayout header="Note Purchase Requests">
            <Head title="Purchase Requests" />

            <p className="mb-4 text-sm text-text-secondary">
                Payment requests for individually-purchased notes. Verifying one unlocks that note for the student immediately. Back to{' '}
                <Link href="/admin/guaranteed-notes" className="font-semibold text-primary hover:underline">Guaranteed Notes</Link>.
            </p>

            <div className="mb-4 flex gap-2">
                {[null, 'pending', 'verified', 'rejected'].map((s) => (
                    <button
                        key={s ?? 'all'}
                        onClick={() => router.get('/admin/guaranteed-notes/purchase-requests', { status: s ?? undefined }, { preserveState: true })}
                        className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize ${(filters.status ?? null) === s ? 'bg-primary text-on-primary' : 'bg-surface text-text-secondary hover:bg-primary-subtle'}`}
                    >
                        {s ?? 'All'}
                    </button>
                ))}
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
                <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="border-b border-border bg-surface-sunken text-xs uppercase tracking-wide text-text-muted">
                        <tr>
                            <th className="px-5 py-3">Student</th>
                            <th className="px-5 py-3">Note</th>
                            <th className="px-5 py-3">Method</th>
                            <th className="px-5 py-3">Amount</th>
                            <th className="px-5 py-3">Proof</th>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {purchases.data.map((p) => (
                            <tr key={p.id}>
                                <td className="px-5 py-3">
                                    <div className="font-medium text-text">{p.user?.name}</div>
                                    <div className="text-xs text-text-muted">{p.user?.email}</div>
                                </td>
                                <td className="px-5 py-3 text-text-secondary">{p.note?.title}</td>
                                <td className="px-5 py-3 capitalize text-text-secondary">{p.method.replace('_', ' ')}</td>
                                <td className="px-5 py-3 font-semibold text-text">Rs. {Number(p.amount).toLocaleString()}</td>
                                <td className="px-5 py-3">
                                    {p.proof_file_path ? (
                                        <a href={`/storage/${p.proof_file_path}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">View</a>
                                    ) : <span className="text-text-muted">—</span>}
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
                                            <button onClick={() => router.post(`/admin/guaranteed-notes/purchase-requests/${p.id}/verify`)} className="text-xs font-bold uppercase text-success hover:underline">Verify</button>
                                            <button onClick={() => router.post(`/admin/guaranteed-notes/purchase-requests/${p.id}/reject`)} className="text-xs font-bold uppercase text-danger hover:underline">Reject</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {purchases.data.length === 0 && <p className="py-10 text-center text-text-secondary">No purchase requests found.</p>}

            <div className="mt-6 flex flex-wrap justify-center gap-2">
                {purchases.links.map((link, i) => (
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
