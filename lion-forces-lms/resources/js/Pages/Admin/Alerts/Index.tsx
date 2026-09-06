import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import AdminLayout from '@/Layouts/AdminLayout';

interface AlertItem {
    id: string;
    data: { title: string; message: string; link_url: string };
    read_at: string | null;
    created_at: string;
}
interface Props {
    notifications: { data: AlertItem[]; links: { url: string | null; label: string; active: boolean }[] };
}

export default function AlertsIndex({ notifications }: Props) {
    function open(n: AlertItem) {
        // Plain axios call, not router.post -- an Inertia visit here would
        // race the router.visit() below (whichever response lands last
        // wins the page), so marking read is fire-and-forget while the
        // navigation is the one Inertia visit that actually matters.
        if (!n.read_at) {
            axios.post(`/admin/alerts/${n.id}/read`);
        }
        router.visit(n.data.link_url);
    }

    const hasUnread = notifications.data.some((n) => !n.read_at);

    return (
        <AdminLayout header="Notifications">
            <Head title="Notifications" />

            <div className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-border bg-gradient-to-br from-primary-subtle to-surface p-6 sm:p-8">
                <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary shadow-sm">
                        🔔 Inbox
                    </span>
                    <h1 className="mt-4 font-display text-3xl text-text">Notifications</h1>
                    <p className="mt-2 max-w-xl text-sm text-text-secondary">
                        Your latest alerts and updates. Click any notification to go to the relevant page.
                    </p>
                </div>
                {hasUnread && (
                    <button
                        onClick={() => router.post('/admin/alerts/mark-all-read', {}, { preserveScroll: true })}
                        className="flex-shrink-0 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-bold text-text hover:border-primary hover:text-primary"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {notifications.data.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                    No notifications yet.
                </div>
            ) : (
                <div className="space-y-2">
                    {notifications.data.map((n) => (
                        <button
                            key={n.id}
                            onClick={() => open(n)}
                            className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors ${
                                n.read_at ? 'border-border bg-surface hover:bg-surface-sunken' : 'border-primary bg-primary-subtle hover:opacity-90'
                            }`}
                        >
                            <span className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${n.read_at ? 'bg-transparent' : 'bg-primary'}`} />
                            <div className="min-w-0 flex-1">
                                <p className="font-bold text-text">{n.data.title}</p>
                                <p className="mt-0.5 text-sm text-text-secondary">{n.data.message}</p>
                                <p className="mt-1 text-xs text-text-muted">{new Date(n.created_at).toLocaleString()}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            <div className="mt-6 flex flex-wrap justify-center gap-2">
                {notifications.links.map((link, i) => (
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
