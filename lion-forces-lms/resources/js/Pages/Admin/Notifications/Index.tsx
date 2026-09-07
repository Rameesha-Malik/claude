import { Head, useForm } from '@inertiajs/react';
import RichTextArea from '@/Components/RichTextArea';
import AdminLayout from '@/Layouts/AdminLayout';

interface Course { id: number; title: string }
interface Package { id: number; name: string; course_id: number }
interface Broadcast {
    id: number; title: string; body: string; target_type: string; recipient_count: number; sent_at: string | null;
    target_course: { title: string } | null; target_package: { name: string } | null; sender: { name: string } | null;
}
interface Props { broadcasts: Broadcast[]; courses: Course[]; packages: Package[] }

const inputClass = 'w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:shadow-glow focus:outline-none';
const labelClass = 'mb-1 block text-sm font-medium text-text';

export default function NotificationsIndex({ broadcasts, courses, packages }: Props) {
    const form = useForm({
        title: '',
        body: '',
        target_type: 'all',
        target_course_id: '',
        target_package_id: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.post('/admin/notifications', { onSuccess: () => form.reset() });
    }

    const filteredPackages = form.data.target_course_id
        ? packages.filter((p) => String(p.course_id) === form.data.target_course_id)
        : packages;

    function targetLabel(b: Broadcast): string {
        if (b.target_type === 'course') return `Course: ${b.target_course?.title ?? '—'}`;
        if (b.target_type === 'package') return `Package: ${b.target_package?.name ?? '—'}`;
        return 'All Students';
    }

    return (
        <AdminLayout header="Broadcasts">
            <Head title="Broadcasts" />

            <div className="grid gap-6 lg:grid-cols-3">
                <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-surface p-6 lg:col-span-1">
                    <h3 className="font-bold text-text">Compose Broadcast</h3>
                    <div>
                        <label className={labelClass}>Title</label>
                        <input className={inputClass} value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>Message</label>
                        <RichTextArea rows={4} className={inputClass} value={form.data.body} onChange={(v) => form.setData('body', v)} />
                    </div>
                    <div>
                        <label className={labelClass}>Send To</label>
                        <select className={inputClass} value={form.data.target_type} onChange={(e) => form.setData('target_type', e.target.value)}>
                            <option value="all">All Students</option>
                            <option value="course">Students in a Course</option>
                            <option value="package">Students in a Package</option>
                        </select>
                    </div>
                    {form.data.target_type === 'course' && (
                        <div>
                            <label className={labelClass}>Course</label>
                            <select className={inputClass} value={form.data.target_course_id} onChange={(e) => form.setData('target_course_id', e.target.value)}>
                                <option value="">Select course</option>
                                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </select>
                        </div>
                    )}
                    {form.data.target_type === 'package' && (
                        <div>
                            <label className={labelClass}>Package</label>
                            <select className={inputClass} value={form.data.target_package_id} onChange={(e) => form.setData('target_package_id', e.target.value)}>
                                <option value="">Select package</option>
                                {filteredPackages.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    )}
                    <button type="submit" disabled={form.processing} className="w-full rounded-lg bg-primary py-2.5 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover disabled:opacity-50">
                        {form.processing ? 'Sending…' : 'Send Notification'}
                    </button>
                    {Object.values(form.errors).map((m, i) => <div key={i} className="text-sm text-danger">{String(m)}</div>)}
                    {form.recentlySuccessful && <div className="text-sm font-semibold text-success">Sent!</div>}
                </form>

                <div className="lg:col-span-2">
                    <h3 className="mb-3 font-bold text-text">Broadcast History</h3>
                    <div className="space-y-3">
                        {broadcasts.map((b) => (
                            <div key={b.id} className="rounded-2xl border border-border bg-surface p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h4 className="font-semibold text-text">{b.title}</h4>
                                        <p className="mt-1 text-sm text-text-secondary">{b.body}</p>
                                    </div>
                                    <span className="whitespace-nowrap rounded-full bg-primary-subtle px-2 py-0.5 text-xs font-bold uppercase text-primary">
                                        {b.recipient_count} sent
                                    </span>
                                </div>
                                <p className="mt-2 text-xs text-text-muted">
                                    {targetLabel(b)} · by {b.sender?.name ?? 'Admin'} · {b.sent_at ? new Date(b.sent_at).toLocaleString() : ''}
                                </p>
                            </div>
                        ))}
                        {broadcasts.length === 0 && <p className="text-sm text-text-secondary">No broadcasts sent yet.</p>}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
