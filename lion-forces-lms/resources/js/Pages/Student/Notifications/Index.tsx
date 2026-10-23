import { Head, Link, router } from '@inertiajs/react';
import RevealOnScroll from '@/Components/RevealOnScroll';
import StudentLayout from '@/Layouts/StudentLayout';

function BellIcon() {
    return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
    );
}

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

            <RevealOnScroll staggerMs={50} className="space-y-3">
                {notifications.data.map((n) => (
                    <div
                        key={n.id}
                        className={`group rounded-3xl border p-5 transition-all duration-normal hover:shadow-md ${n.read_at ? 'border-border bg-surface' : 'border-primary bg-primary-subtle'}`}
                    >
                        <div className="flex items-start gap-3.5">
                            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-primary text-on-primary transition-transform duration-normal group-hover:scale-110">
                                <BellIcon />
                            </span>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
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
                        </div>
                    </div>
                ))}
                {notifications.data.length === 0 && (
                    <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                        You have no notifications yet.
                    </div>
                )}
            </RevealOnScroll>

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
