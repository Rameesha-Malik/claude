import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Review {
    id: number; rating: number; review_text: string | null; status: string; created_at: string;
    course: { title: string } | null; user: { name: string } | null;
}

const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-warning-bg text-warning',
    approved: 'bg-success-bg text-success',
    hidden: 'bg-surface-sunken text-text-muted',
};

function Stars({ rating }: { rating: number }) {
    return (
        <span className="text-gold-500" aria-label={`${rating} out of 5 stars`}>
            {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
        </span>
    );
}

export default function ReviewsIndex({ reviews }: { reviews: Review[] }) {
    const [filter, setFilter] = useState<string>('all');
    const filtered = filter === 'all' ? reviews : reviews.filter((r) => r.status === filter);

    return (
        <AdminLayout header="Course Reviews">
            <Head title="Reviews" />

            <div className="mb-4 flex gap-2">
                {['all', 'pending', 'approved', 'hidden'].map((s) => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`rounded-full px-4 py-1.5 text-sm font-bold uppercase tracking-wide ${filter === s ? 'bg-primary text-on-primary' : 'border border-border text-text-secondary hover:border-primary'}`}
                    >
                        {s} {s !== 'all' && `(${reviews.filter((r) => r.status === s).length})`}
                    </button>
                ))}
            </div>

            <div className="space-y-3">
                {filtered.map((r) => (
                    <div key={r.id} className="rounded-2xl border border-border bg-surface p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Stars rating={r.rating} />
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${STATUS_STYLES[r.status]}`}>{r.status}</span>
                                </div>
                                <p className="mt-1 text-sm font-semibold text-text">{r.course?.title ?? 'Unknown course'} · {r.user?.name ?? 'Unknown student'}</p>
                                {r.review_text && <p className="mt-2 text-sm text-text-secondary">{r.review_text}</p>}
                                <p className="mt-2 text-xs text-text-muted">{new Date(r.created_at).toLocaleString()}</p>
                            </div>
                            <div className="flex gap-3">
                                {r.status !== 'approved' && (
                                    <button onClick={() => router.post(`/admin/reviews/${r.id}/approve`, {}, { preserveScroll: true })} className="text-sm font-bold uppercase text-success hover:underline">
                                        Approve
                                    </button>
                                )}
                                {r.status !== 'hidden' && (
                                    <button onClick={() => router.post(`/admin/reviews/${r.id}/hide`, {}, { preserveScroll: true })} className="text-sm font-bold uppercase text-warning hover:underline">
                                        Hide
                                    </button>
                                )}
                                <button
                                    onClick={() => confirm('Delete this review permanently?') && router.delete(`/admin/reviews/${r.id}`, { preserveScroll: true })}
                                    className="text-xs font-bold uppercase text-danger hover:underline"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && <p className="text-sm text-text-secondary">No reviews here.</p>}
            </div>
        </AdminLayout>
    );
}
