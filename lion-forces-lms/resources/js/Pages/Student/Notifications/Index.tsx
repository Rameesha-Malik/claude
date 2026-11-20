import { Head, router } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';
import RevealOnScroll from '@/Components/RevealOnScroll';
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

            <RevealOnScroll staggerMs={50} className="space-y-3">
                {notifications.data.map((n) => (
                    <div
                        key={n.id}
                        className={`group rounded-3xl border p-5 transition-all duration-normal hover:shadow-md ${n.read_at ? 'border-border bg-surface' : 'border-primary bg-primary-subtle'}`}
                    >
                        <div className="flex items-start gap-3.5">
                            {!n.read_at && <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary" aria-hidden />}
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

            <Pagination links={notifications.links} className="mt-6 flex flex-wrap gap-2" />
        </StudentLayout>
    );
}
