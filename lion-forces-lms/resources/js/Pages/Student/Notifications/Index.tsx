import { Head, Link, router } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';

interface NotificationItem {
    id: string;
    data: { title: string; body: string; broadcast_id: number };
    read_at: string | null;
    created_at: string;
}
interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
}
interface Props { notifications: Paginated<NotificationItem> }

export default function NotificationsIndex({ notifications }: Props) {
    const hasUnread = notifications.data.some((n) => !n.read_at);

    return (
        <StudentLayout header="Notifications">
            <Head title="Notifications" />

            <div className="mb-4 flex justify-end">
                {hasUnread && (
                    <button
                        onClick={() => router.post('/portal/notifications/read-all', {}, { preserveScroll: true })}
                        className="text-sm font-semibold text-primary hover:underline"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            <div className="space-y-3">
                {notifications.data.map((n) => (
                    <div
                        key={n.id}
                        className={`rounded-2xl border p-5 ${n.read_at ? 'border-border bg-surface' : 'border-primary bg-primary-subtle'}`}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h4 className="font-semibold text-text">{n.data.title}</h4>
                                <p className="mt-1 text-sm text-text-secondary">{n.data.body}</p>
                                <p className="mt-2 text-xs text-text-muted">{new Date(n.created_at).toLocaleString()}</p>
                            </div>
                            {!n.read_at && (
                                <button
                                    onClick={() => router.post(`/portal/notifications/${n.id}/read`, {}, { preserveScroll: true })}
                                    className="whitespace-nowrap text-xs font-bold uppercase text-primary hover:underline"
                                >
                                    Mark read
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {notifications.data.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                        You have no notifications yet.
                    </div>
                )}
            </div>

            {notifications.links.length > 3 && (
                <div className="mt-6 flex flex-wrap gap-2">
                    {notifications.links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url ?? '#'}
                            className={`rounded-lg px-3 py-1.5 text-sm ${link.active ? 'bg-primary text-on-primary' : 'border border-border text-text hover:border-primary'} ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </StudentLayout>
    );
}
