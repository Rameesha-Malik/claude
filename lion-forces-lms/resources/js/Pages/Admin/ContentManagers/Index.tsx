import { Head, router, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

interface CourseOpt { id: number; title: string }
interface Manager {
    id: number; name: string; email: string;
    managed_courses: CourseOpt[];
}
interface Props {
    managers: Manager[];
    courses: CourseOpt[];
    filters: { search?: string };
}

function AddManagerModal({ courses, onClose }: { courses: CourseOpt[]; onClose: () => void }) {
    const form = useForm({ name: '', email: '', password: '', course_ids: [] as number[] });

    function toggleCourse(id: number) {
        form.setData('course_ids', form.data.course_ids.includes(id) ? form.data.course_ids.filter((c) => c !== id) : [...form.data.course_ids, id]);
    }

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post('/admin/content-managers', { onSuccess: onClose });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-bold text-text">Add Content Manager</h2>
                    <button onClick={onClose} className="text-text-muted hover:text-text">✕</button>
                </div>
                <form onSubmit={submit} className="space-y-3">
                    <div>
                        <input placeholder="Full name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
                        {form.errors.name && <p className="mt-1 text-xs text-danger">{form.errors.name}</p>}
                    </div>
                    <div>
                        <input placeholder="Email" type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
                        {form.errors.email && <p className="mt-1 text-xs text-danger">{form.errors.email}</p>}
                    </div>
                    <div>
                        <input placeholder="Password" type="password" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
                        {form.errors.password && <p className="mt-1 text-xs text-danger">{form.errors.password}</p>}
                    </div>
                    <div>
                        <p className="mb-1.5 text-xs font-bold uppercase text-text-muted">Assign to courses</p>
                        <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
                            {courses.map((c) => (
                                <label key={c.id} className="flex items-center gap-2 rounded px-1.5 py-1 text-sm hover:bg-surface-sunken">
                                    <input type="checkbox" checked={form.data.course_ids.includes(c.id)} onChange={() => toggleCourse(c.id)} />
                                    {c.title}
                                </label>
                            ))}
                        </div>
                    </div>
                    <button type="submit" disabled={form.processing} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-bold uppercase text-on-primary hover:bg-primary-hover disabled:opacity-50">
                        {form.processing ? 'Adding…' : 'Add Content Manager'}
                    </button>
                </form>
            </div>
        </div>
    );
}

function EditPermissionsModal({ manager, courses, onClose }: { manager: Manager; courses: CourseOpt[]; onClose: () => void }) {
    const [selected, setSelected] = useState<number[]>(manager.managed_courses.map((c) => c.id));
    const [submitting, setSubmitting] = useState(false);

    function toggle(id: number) {
        setSelected((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
    }

    function save() {
        setSubmitting(true);
        router.put(`/admin/content-managers/${manager.id}/courses`, { course_ids: selected }, {
            onFinish: () => setSubmitting(false),
            onSuccess: onClose,
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-bold text-text">Edit Permissions — {manager.name}</h2>
                    <button onClick={onClose} className="text-text-muted hover:text-text">✕</button>
                </div>
                <p className="mb-2 text-xs font-bold uppercase text-text-muted">Assigned courses</p>
                <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
                    {courses.map((c) => (
                        <label key={c.id} className="flex items-center gap-2 rounded px-1.5 py-1 text-sm hover:bg-surface-sunken">
                            <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggle(c.id)} />
                            {c.title}
                        </label>
                    ))}
                </div>
                <button onClick={save} disabled={submitting} className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-bold uppercase text-on-primary hover:bg-primary-hover disabled:opacity-50">
                    {submitting ? 'Saving…' : 'Save Permissions'}
                </button>
            </div>
        </div>
    );
}

export default function ContentManagersIndex({ managers, courses, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [addOpen, setAddOpen] = useState(false);
    const [editing, setEditing] = useState<Manager | null>(null);

    function submitSearch(e: FormEvent) {
        e.preventDefault();
        router.get('/admin/content-managers', { search }, { preserveState: true });
    }

    function remove(m: Manager) {
        if (confirm(`Remove ${m.name} as a content manager? Their account will be deleted entirely.`)) {
            router.delete(`/admin/content-managers/${m.id}`, { preserveScroll: true });
        }
    }

    return (
        <AdminLayout header="Content Managers">
            <Head title="Content Managers" />

            <div className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-border bg-surface p-6 sm:p-8">
                <div className="flex gap-4">
                    <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-subtle text-primary">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m5-9.13a4 4 0 110 8 4 4 0 010-8zm6 4a4 4 0 11-8 0" />
                        </svg>
                    </span>
                    <div>
                        <h1 className="font-display text-3xl text-text">Content managers</h1>
                        <p className="mt-2 max-w-xl text-sm text-text-secondary">
                            Team members who can add or edit content in assigned courses. They cannot manage students, enrollments, or settings.
                        </p>
                    </div>
                </div>
                <button onClick={() => setAddOpen(true)} className="flex-shrink-0 rounded-xl bg-secondary px-5 py-3 text-sm font-bold uppercase text-on-secondary shadow-sm hover:bg-teal-800">
                    + Add content manager
                </button>
            </div>

            <form onSubmit={submitSearch} className="mb-6 flex gap-2 rounded-3xl border border-border bg-surface p-5">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or email"
                    className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
                <button type="submit" className="rounded-lg bg-secondary px-5 py-2 text-sm font-bold uppercase text-on-secondary hover:bg-teal-800">Search</button>
            </form>

            {managers.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                    No content managers yet.
                </div>
            ) : (
                <div className="space-y-3">
                    {managers.map((m) => (
                        <div key={m.id} className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-surface p-5">
                            <div className="flex items-center gap-3">
                                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-sm font-bold text-on-secondary">
                                    {m.name.slice(0, 2).toUpperCase()}
                                </span>
                                <div>
                                    <p className="font-bold text-text">{m.name}</p>
                                    <p className="text-sm text-text-muted">{m.email}</p>
                                    <p className="mt-1 flex items-center gap-1 text-xs text-text-muted">
                                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        {m.managed_courses.length} permission{m.managed_courses.length === 1 ? '' : 's'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button onClick={() => setEditing(m)} className="flex items-center gap-1.5 text-sm font-semibold text-text hover:text-primary">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.5-9.5a2.121 2.121 0 013 3L12 16l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                    Edit permissions
                                </button>
                                <button onClick={() => remove(m)} className="flex items-center gap-1.5 text-sm font-semibold text-danger hover:opacity-80">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.36 6.64L6.64 18.36M6 7l1-3h10l1 3M4 7h16" />
                                    </svg>
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {addOpen && <AddManagerModal courses={courses} onClose={() => setAddOpen(false)} />}
            {editing && <EditPermissionsModal manager={editing} courses={courses} onClose={() => setEditing(null)} />}
        </AdminLayout>
    );
}
