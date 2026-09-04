import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

const inputClass = 'rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:shadow-glow focus:outline-none';

function AddStudentForm() {
    const [open, setOpen] = useState(false);
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

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-bold uppercase text-on-primary hover:bg-primary-hover"
            >
                + Add Student
            </button>
        );
    }

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
    students: { data: Student[]; links: { url: string | null; label: string; active: boolean }[] };
    filters: { search?: string; status?: string };
}

export default function StudentsIndex({ students, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function submitSearch(e: FormEvent) {
        e.preventDefault();
        router.get('/admin/students', { ...filters, search }, { preserveState: true });
    }

    function setStatus(status: string | null) {
        router.get('/admin/students', { ...filters, status: status ?? undefined }, { preserveState: true });
    }

    return (
        <AdminLayout header="Students">
            <Head title="Students" />

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <form onSubmit={submitSearch} className="flex gap-2">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-64 rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:shadow-glow focus:outline-none"
                    />
                    <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-bold uppercase text-on-primary hover:bg-primary-hover">Search</button>
                </form>
                <div className="flex items-center gap-3">
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
                    <AddStudentForm />
                </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
                <table className="w-full min-w-[640px] text-left text-sm">
                    <thead className="border-b border-border bg-surface-sunken text-xs uppercase tracking-wide text-text-muted">
                        <tr>
                            <th className="px-5 py-3">Name</th>
                            <th className="px-5 py-3">Email</th>
                            <th className="px-5 py-3">Enrollments</th>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3">Joined</th>
                            <th className="px-5 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {students.data.map((s) => (
                            <tr key={s.id}>
                                <td className="px-5 py-3 font-medium text-text">{s.name}</td>
                                <td className="px-5 py-3 text-text-secondary">{s.email}</td>
                                <td className="px-5 py-3 text-text-secondary">{s.enrollments_count}</td>
                                <td className="px-5 py-3">
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${s.is_active ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger'}`}>
                                        {s.is_active ? 'Active' : 'Suspended'}
                                    </span>
                                </td>
                                <td className="px-5 py-3 text-text-secondary">{new Date(s.created_at).toLocaleDateString()}</td>
                                <td className="px-5 py-3 text-right">
                                    <Link href={`/admin/students/${s.id}`} className="font-semibold text-primary hover:underline">View &rarr;</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {students.data.length === 0 && <p className="py-10 text-center text-text-secondary">No students found.</p>}

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
