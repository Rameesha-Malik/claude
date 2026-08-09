import { Head, router } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';

interface NewsItem {
    id: number; title: string; description: string | null; organization: string | null;
    deadline_date: string | null; application_link: string | null;
    category: { name: string } | null;
}
interface Props {
    announcements: { data: NewsItem[]; links: { url: string | null; label: string; active: boolean }[] };
}

function daysRemaining(deadline: string | null) {
    if (!deadline) return null;
    const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
    return diff >= 0 ? diff : null;
}

export default function News({ announcements }: Props) {
    return (
        <PublicLayout>
            <Head title="News & Announcements" />

            <section className="bg-surface-brand py-16 text-center">
                <h1 className="text-4xl font-bold text-secondary">News & Announcements</h1>
                <p className="mt-3 text-text-secondary">Upcoming test dates, admission deadlines, and academy news.</p>
            </section>

            <section className="mx-auto max-w-container px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {announcements.data.map((item) => {
                        const days = daysRemaining(item.deadline_date);
                        return (
                            <div key={item.id} className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                                <div className="mb-3 flex flex-wrap items-center gap-2">
                                    {item.organization && (
                                        <span className="rounded-full bg-primary-subtle px-3 py-1 text-xs font-semibold text-primary">
                                            {item.organization}
                                        </span>
                                    )}
                                    {days !== null && (
                                        <span className="rounded-full bg-warning-bg px-3 py-1 text-xs font-semibold text-warning">
                                            {days} days remaining
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-semibold text-text">{item.title}</h3>
                                <p className="mt-1 text-sm text-text-secondary">{item.description}</p>
                                {item.application_link && (
                                    <a href={item.application_link} className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
                                        Apply now &rarr;
                                    </a>
                                )}
                            </div>
                        );
                    })}
                </div>

                {announcements.data.length === 0 && (
                    <p className="py-16 text-center text-text-secondary">No active announcements right now.</p>
                )}

                <div className="mt-10 flex flex-wrap justify-center gap-2">
                    {announcements.links.map((link, i) => (
                        <button
                            key={i}
                            disabled={!link.url}
                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                            className={`rounded-lg px-4 py-2 text-sm ${link.active ? 'bg-primary text-on-primary' : 'bg-surface text-text-secondary hover:bg-primary-subtle'} disabled:opacity-40`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </section>
        </PublicLayout>
    );
}
