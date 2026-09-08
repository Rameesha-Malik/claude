import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

interface BundleRow {
    id: number; title: string; price: string; is_active: boolean;
    courses_count: number; purchases_count: number;
}
interface Props { bundles: BundleRow[] }

export default function BundlesIndex({ bundles }: Props) {
    return (
        <AdminLayout header="Bundles">
            <Head title="Bundles" />

            <div className="mb-4 flex justify-end">
                <Link href="/admin/bundles/create" className="rounded-lg bg-primary px-4 py-2 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover">
                    + Add Bundle
                </Link>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
                <table className="w-full min-w-[640px] text-left text-sm">
                    <thead className="border-b border-border bg-surface-sunken text-xs uppercase tracking-wide text-text-muted">
                        <tr>
                            <th className="px-5 py-3">Title</th>
                            <th className="px-5 py-3">Courses</th>
                            <th className="px-5 py-3">Price</th>
                            <th className="px-5 py-3">Purchases</th>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {bundles.map((b) => (
                            <tr key={b.id}>
                                <td className="px-5 py-3 font-medium text-text">{b.title}</td>
                                <td className="px-5 py-3 text-text-secondary">{b.courses_count}</td>
                                <td className="px-5 py-3 text-text-secondary">Rs. {Number(b.price).toLocaleString()}</td>
                                <td className="px-5 py-3 text-text-secondary">{b.purchases_count}</td>
                                <td className="px-5 py-3">
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${b.is_active ? 'bg-success-bg text-success' : 'bg-surface-sunken text-text-muted'}`}>
                                        {b.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-5 py-3 text-right">
                                    <Link href={`/admin/bundles/${b.id}/edit`} className="mr-3 font-semibold text-primary hover:underline">Edit &rarr;</Link>
                                    <button
                                        onClick={() => confirm('Delete this bundle? Existing purchases/enrollments are unaffected.') && router.delete(`/admin/bundles/${b.id}`)}
                                        className="font-semibold text-danger hover:underline"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {bundles.length === 0 && <p className="py-10 text-center text-text-secondary">No bundles yet.</p>}
        </AdminLayout>
    );
}
