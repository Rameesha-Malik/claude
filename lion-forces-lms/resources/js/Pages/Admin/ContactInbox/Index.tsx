import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Submission { id: number; name: string; email: string; phone: string | null; subject: string | null; message: string; is_handled: boolean; created_at: string }
interface Props {
    submissions: { data: Submission[]; links: { url: string | null; label: string; active: boolean }[] };
}

export default function ContactInboxIndex({ submissions }: Props) {
    return (
        <AdminLayout header="Contact Inbox">
            <Head title="Contact Inbox" />

            <div className="space-y-3">
                {submissions.data.map((s) => (
                    <div key={s.id} className={`rounded-2xl border p-5 ${s.is_handled ? 'border-border bg-surface' : 'border-accent bg-surface'}`}>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="font-semibold text-text">{s.name} — <span className="font-normal text-text-secondary">{s.email}</span></div>
                                {s.subject && <div className="text-sm font-medium text-text-secondary">{s.subject}</div>}
                                <p className="mt-2 text-sm text-text-secondary">{s.message}</p>
                                <p className="mt-1 text-xs text-text-muted">{new Date(s.created_at).toLocaleString()}</p>
                            </div>
                            <button
                                onClick={() => router.post(`/admin/contact-inbox/${s.id}/toggle-handled`, {}, { preserveScroll: true })}
                                className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase ${s.is_handled ? 'bg-success-bg text-success' : 'bg-accent text-accent-fg'}`}
                            >
                                {s.is_handled ? 'Handled' : 'Mark Handled'}
                            </button>
                        </div>
                    </div>
                ))}
                {submissions.data.length === 0 && <p className="py-10 text-center text-text-secondary">No messages yet.</p>}
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
