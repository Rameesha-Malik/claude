import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

const inputClass = 'rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:shadow-glow focus:outline-none';

function AddStudentForm({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
    const form = useForm({ name: '', email: '', phone: '', password: '', password_confirmation: '' });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post('/admin/students', {
            onSuccess: () => {
                form.reset();
                setOpen(false);
            },
        });
    }

    if (!open) return null;

    return (
        <form onSubmit={submit} className="mb-6 rounded-2xl border border-border bg-surface p-5">
            <div className="mb-3 flex items-center justify-between">
                <h2 className="font-bold text-text">Add Student</h2>
                <button type="button" onClick={() => setOpen(false)} className="text-sm text-text-muted hover:text-text">Cancel</button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
                <div>
                    <input className={`${inputClass} w-full`} placeholder="Full name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                    {form.errors.name && <p className="mt-1 text-xs text-danger">{form.errors.name}</p>}
                </div>
                <div>
                    <input className={`${inputClass} w-full`} placeholder="Email" type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />
                    {form.errors.email && <p className="mt-1 text-xs text-danger">{form.errors.email}</p>}
                </div>
                <div>
                    <input className={`${inputClass} w-full`} placeholder="Phone (optional)" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} />
                </div>
                <div />
                <div>
                    <input className={`${inputClass} w-full`} placeholder="Password" type="password" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} />
                    {form.errors.password && <p className="mt-1 text-xs text-danger">{form.errors.password}</p>}
                </div>
                <div>
                    <input className={`${inputClass} w-full`} placeholder="Confirm password" type="password" value={form.data.password_confirmation} onChange={(e) => form.setData('password_confirmation', e.target.value)} />
                </div>
            </div>
            <button type="submit" disabled={form.processing} className="mt-4 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold uppercase text-on-primary hover:bg-primary-hover disabled:opacity-50">
                {form.processing ? 'Creating…' : 'Create Student'}
            </button>
        </form>
    );
}

interface Student {
    id: number; name: string; email: string; is_active: boolean; created_at: string;
    enrollments_count: number;
}
interface Props {
    students: { data: Student[]; links: { url: string | null; label: string; active: boolean }[]; total: number };
    filters: { search?: string; status?: string };
}

export default function StudentsIndex({ students, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [addOpen, setAddOpen] = useState(false);

    function submitSearch(e: FormEvent) {
        e.preventDefault();
        router.get('/admin/students', { ...filters, search }, { preserveState: true });
    }

    function setStatus(status: string | null) {
        router.get('/admin/students', { ...filters, status: status ?? undefined }, { preserveState: true });
    }

    function destroyStudent(s: Student) {
        if (confirm(`Delete ${s.name}'s account permanently? This also removes their enrollments and test history. This cannot be undone.`)) {
            router.delete(`/admin/students/${s.id}`, { preserveScroll: true });
        }
    }

    return (
        <AdminLayout header="Students">
            <Head title="Students" />

            <div className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-border bg-gradient-to-br from-primary-subtle to-surface p-6 sm:p-8">
                <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary shadow-sm">
                        Student Management
                    </span>
                    <h1 className="mt-4 font-display text-3xl text-text">Students</h1>
                    <p className="mt-2 max-w-xl text-sm text-text-secondary">
                        Manage student accounts, monitor enrollments, and control access from one place.
                    </p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-3">
                    <div className="rounded-2xl border border-border bg-surface px-5 py-3 text-center shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Total</p>
                        <p className="font-display text-2xl text-text">{students.total}</p>
                    </div>
                    <button
                        onClick={() => setAddOpen((v) => !v)}
                        className="rounded-xl bg-secondary px-5 py-3 text-sm font-bold uppercase text-on-secondary shadow-sm hover:bg-teal-800"
                    >
                        + Add Student
                    </button>
                </div>
            </div>

            <AddStudentForm open={addOpen} setOpen={setAddOpen} />

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <form onSubmit={submitSearch} className="flex flex-1 gap-2 sm:max-w-md">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:shadow-glow focus:outline-none"
                    />
                    <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-bold uppercase text-on-primary hover:bg-primary-hover">Search</button>
                </form>
                <div className="flex gap-2">
                    {[
                        { key: null, label: 'All' },
                        { key: 'active', label: 'Active' },
                        { key: 'suspended', label: 'Suspended' },
                    ].map((opt) => (
                        <button
                            key={opt.label}
                            onClick={() => setStatus(opt.key)}
                            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                                (filters.status ?? null) === opt.key ? 'bg-primary text-on-primary' : 'bg-surface text-text-secondary hover:bg-primary-subtle'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {students.data.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                    No students found.
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {students.data.map((s) => (
                        <div key={s.id} className="rounded-3xl border border-border bg-surface p-5">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-subtle text-sm font-bold text-primary">
                                        {s.name.charAt(0).toUpperCase()}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="truncate font-bold text-text">{s.name}</p>
                                        <p className="truncate text-xs text-text-muted">{s.email}</p>
                                    </div>
                                </div>
                                <span className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${s.is_active ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger'}`}>
                                    {s.is_active ? 'Active' : 'Suspended'}
                                </span>
                            </div>

                            <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm">
                                <span className="text-text-muted">Enrollments</span>
                                <span className="font-bold text-text">{s.enrollments_count}</span>
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3 text-sm">
                                <Link href={`/admin/students/${s.id}`} className="font-semibold text-primary hover:underline">
                                    Profile
                                </Link>
                                <button
                                    onClick={() => router.post(`/admin/students/${s.id}/toggle-suspend`, {}, { preserveScroll: true })}
                                    className="font-semibold text-warning hover:underline"
                                >
                                    {s.is_active ? 'Deactivate' : 'Reactivate'}
                                </button>
                                <button onClick={() => destroyStudent(s)} className="font-semibold text-danger hover:underline">
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-6 flex flex-wrap justify-center gap-2">
                {students.links.map((link, i) => (
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
