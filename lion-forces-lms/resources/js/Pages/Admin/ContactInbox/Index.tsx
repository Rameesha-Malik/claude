import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Submission { id: number; name: string; email: string; phone: string | null; subject: string | null; message: string; is_handled: boolean; created_at: string }
interface Props {
    submissions: { data: Submission[]; links: { url: string | null; label: string; active: boolean }[] };
    counts: { total: number; new: number; read: number };
    filters: { filter?: string };
}

const TABS = [
    { key: undefined, label: 'All' },
    { key: 'new', label: 'New' },
    { key: 'read', label: 'Read' },
] as const;

export default function ContactInboxIndex({ submissions, counts, filters }: Props) {
    const activeFilter = filters.filter ?? undefined;

    return (
        <AdminLayout header="Contact Inbox">
            <Head title="Contact Inbox" />

            <p className="mb-6 max-w-2xl text-sm text-text-secondary">
                Messages submitted from the site's Contact page. Review, reply by email, and mark items as read when handled.
            </p>

            <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-border bg-surface p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Total</p>
                    <p className="mt-1 font-display text-3xl text-text">{counts.total}</p>
                    <p className="mt-1 text-sm text-text-secondary">All time submissions</p>
                </div>
                <div className="rounded-2xl border border-warning bg-warning-bg p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-warning">New</p>
                    <p className="mt-1 font-display text-3xl text-text">{counts.new}</p>
                    <p className="mt-1 text-sm text-text-secondary">Awaiting your review</p>
                </div>
                <div className="rounded-2xl border border-success bg-success-bg p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-success">Read</p>
                    <p className="mt-1 font-display text-3xl text-text">{counts.read}</p>
                    <p className="mt-1 text-sm text-text-secondary">Marked as handled</p>
                </div>
            </div>

            <div className="mb-4 flex gap-2">
                {TABS.map((t) => (
                    <button
                        key={t.label}
                        onClick={() => router.get('/admin/contact-inbox', t.key ? { filter: t.key } : {}, { preserveState: true })}
                        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${activeFilter === t.key ? 'bg-primary text-on-primary' : 'bg-surface text-text-secondary hover:bg-primary-subtle'}`}
                    >
                        {t.label}
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${activeFilter === t.key ? 'bg-white/20' : 'bg-surface-sunken'}`}>
                            {t.key === 'new' ? counts.new : t.key === 'read' ? counts.read : counts.total}
                        </span>
                    </button>
                ))}
            </div>

            <div className="space-y-3">
                {submissions.data.map((s) => (
                    <div key={s.id} className={`rounded-2xl border p-5 ${s.is_handled ? 'border-border bg-surface' : 'border-warning bg-surface'}`}>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="font-semibold text-text">{s.name} — <span className="font-normal text-text-secondary">{s.email}</span></div>
                                {s.subject && <div className="text-sm font-medium text-text-secondary">{s.subject}</div>}
                                <p className="mt-2 text-sm text-text-secondary">{s.message}</p>
                                <p className="mt-1 text-xs text-text-muted">{new Date(s.created_at).toLocaleString()}</p>
                            </div>
                            <button
                                onClick={() => router.post(`/admin/contact-inbox/${s.id}/toggle-handled`, {}, { preserveScroll: true })}
                                className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase ${s.is_handled ? 'bg-success-bg text-success' : 'bg-warning-bg text-warning'}`}
                            >
                                {s.is_handled ? 'Handled' : 'Mark Handled'}
                            </button>
                        </div>
                    </div>
                ))}
                {submissions.data.length === 0 && (
                    <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                        No inquiries yet. When visitors use the public Contact form, entries will appear here for your team to respond.
                    </div>
                )}
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
                {submissions.links.map((link, i) => (
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
