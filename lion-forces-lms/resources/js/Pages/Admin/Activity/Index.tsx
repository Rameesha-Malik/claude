import { Head, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

interface LogEntry {
    id: number; action: string; subject_type: string; description: string; created_at: string;
    user: { name: string } | null;
    course: { title: string } | null;
}
interface Props {
    logs: { data: LogEntry[]; links: { url: string | null; label: string; active: boolean }[] };
    courses: { id: number; title: string }[];
    users: { id: number; name: string }[];
    filters: { course_id?: string; subject_type?: string; user_id?: string; date_from?: string; date_to?: string };
}

const CONTENT_TYPES = ['Course', 'Topic', 'Lecture', 'MCQ', 'Note'];

const TYPE_TONES: Record<string, string> = {
    Course: 'bg-surface-sunken text-text-secondary',
    Topic: 'bg-warning-bg text-warning',
    Lecture: 'bg-success-bg text-success',
    MCQ: 'bg-primary-subtle text-primary',
    Note: 'bg-info-bg text-info',
};

export default function ActivityIndex({ logs, courses, users, filters }: Props) {
    const [form, setForm] = useState({
        course_id: filters.course_id ?? '',
        subject_type: filters.subject_type ?? '',
        user_id: filters.user_id ?? '',
        date_from: filters.date_from ?? '',
        date_to: filters.date_to ?? '',
    });

    function apply(e: FormEvent) {
        e.preventDefault();
        const params: Record<string, string> = {};
        Object.entries(form).forEach(([k, v]) => { if (v) params[k] = v; });
        router.get('/admin/activity', params, { preserveState: true });
    }

    function clear() {
        setForm({ course_id: '', subject_type: '', user_id: '', date_from: '', date_to: '' });
        router.get('/admin/activity');
    }

    return (
        <AdminLayout header="Activity">
            <Head title="Activity" />

            <div className="mb-6 rounded-3xl border border-border bg-gradient-to-br from-primary-subtle to-surface p-6 sm:p-8">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary shadow-sm">
                    Admin Logs
                </span>
                <h1 className="mt-4 font-display text-3xl text-text">Content Activity</h1>
                <p className="mt-2 max-w-2xl text-sm text-text-secondary">
                    Who added or edited course content, and when. Example: MCQ added by Ali Khan, Date: 5 March 2026.
                </p>
            </div>

            <form onSubmit={apply} className="mb-6 rounded-3xl border border-border bg-surface p-5">
                <p className="mb-4 text-sm font-bold text-text">Filters</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <select
                        value={form.course_id}
                        onChange={(e) => setForm((f) => ({ ...f, course_id: e.target.value }))}
                        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text"
                    >
                        <option value="">All courses</option>
                        {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                    <select
                        value={form.subject_type}
                        onChange={(e) => setForm((f) => ({ ...f, subject_type: e.target.value }))}
                        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text"
                    >
                        <option value="">All content types</option>
                        {CONTENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select
                        value={form.user_id}
                        onChange={(e) => setForm((f) => ({ ...f, user_id: e.target.value }))}
                        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text"
                    >
                        <option value="">All users</option>
                        {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                    <input
                        type="date"
                        value={form.date_from}
                        onChange={(e) => setForm((f) => ({ ...f, date_from: e.target.value }))}
                        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text"
                    />
                    <input
                        type="date"
                        value={form.date_to}
                        onChange={(e) => setForm((f) => ({ ...f, date_to: e.target.value }))}
                        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text"
                    />
                </div>
                <div className="mt-4 flex gap-2">
                    <button type="submit" className="rounded-lg bg-primary px-5 py-2 text-sm font-bold text-on-primary hover:bg-primary-hover">
                        Apply
                    </button>
                    <button type="button" onClick={clear} className="rounded-lg border border-border px-5 py-2 text-sm font-bold text-text-secondary hover:bg-surface-sunken">
                        Clear
                    </button>
                </div>
            </form>

            <div className="mb-3 text-sm text-text-secondary">{logs.data.length} entries (newest first).</div>

            <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
                <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="border-b border-border bg-surface-sunken text-xs uppercase tracking-wide text-text-muted">
                        <tr>
                            <th className="px-5 py-3">Date &amp; Time</th>
                            <th className="px-5 py-3">Action</th>
                            <th className="px-5 py-3">Content Type</th>
                            <th className="px-5 py-3">Description</th>
                            <th className="px-5 py-3">Course</th>
                            <th className="px-5 py-3">By</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {logs.data.map((log) => (
                            <tr key={log.id}>
                                <td className="whitespace-nowrap px-5 py-3 text-text-secondary">
                                    {new Date(log.created_at).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                </td>
                                <td className="px-5 py-3">
                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${log.action === 'added' ? 'bg-success-bg text-success' : 'bg-primary-subtle text-primary'}`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-5 py-3">
                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${TYPE_TONES[log.subject_type] ?? 'bg-surface-sunken text-text-secondary'}`}>
                                        {log.subject_type}
                                    </span>
                                </td>
                                <td className="px-5 py-3 text-text">{log.description}</td>
                                <td className="px-5 py-3 text-text-secondary">{log.course?.title ?? '—'}</td>
                                <td className="px-5 py-3 text-text-secondary">{log.user?.name ?? 'System'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {logs.data.length === 0 && (
                <div className="mt-6 rounded-3xl border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                    No activity recorded yet.
                </div>
            )}

            <div className="mt-6 flex flex-wrap justify-center gap-2">
                {logs.links.map((link, i) => (
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
