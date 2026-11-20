import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import AvatarInitial from '@/Components/AvatarInitial';
import ColumnsToggle from '@/Components/ColumnsToggle';
import EmptyState from '@/Components/EmptyState';
import Pagination from '@/Components/Pagination';

const COLUMNS = [
    { key: 'email', label: 'Email' },
    { key: 'enrollments', label: 'Enrollments' },
    { key: 'status', label: 'Status' },
    { key: 'joined', label: 'Joined' },
];

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
    const [visible, setVisible] = useState<Record<string, boolean>>({});
    const isVisible = (key: string) => visible[key] ?? true;
    const toggleColumn = (key: string) => setVisible((v) => ({ ...v, [key]: !isVisible(key) }));

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

            <AdminPageHeader
                eyebrow="Student Management"
                title="Students"
                description="Every registered student, their enrollments, and account access in one list."
                right={
                    <>
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
                    </>
                }
            />

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
                <div className="flex items-center gap-2">
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
                    <ColumnsToggle columns={COLUMNS} visible={visible} onToggle={toggleColumn} />
                </div>
            </div>

            {students.data.length === 0 ? (
                <EmptyState>No students found.</EmptyState>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
                    <table className="w-full min-w-[640px] text-left text-sm">
                        <thead className="border-b border-border bg-surface-sunken text-xs uppercase tracking-wide text-text-muted">
                            <tr>
                                <th className="px-5 py-3">Student</th>
                                {isVisible('email') && <th className="px-5 py-3">Email</th>}
                                {isVisible('enrollments') && <th className="px-5 py-3">Enrollments</th>}
                                {isVisible('status') && <th className="px-5 py-3">Status</th>}
                                {isVisible('joined') && <th className="px-5 py-3">Joined</th>}
                                <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {students.data.map((s) => (
                                <tr key={s.id}>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            <AvatarInitial name={s.name} />
                                            <span className="min-w-0 truncate font-medium text-text">{s.name}</span>
                                        </div>
                                    </td>
                                    {isVisible('email') && <td className="px-5 py-3 text-text-secondary">{s.email}</td>}
                                    {isVisible('enrollments') && <td className="px-5 py-3 font-bold text-text">{s.enrollments_count}</td>}
                                    {isVisible('status') && (
                                        <td className="px-5 py-3">
                                            {/* Active is the default, expected state for almost
                                                every student here -- a loud green pill on every
                                                single row competed with the name for attention and
                                                added nothing (of course they're active). A plain
                                                dot says the same thing quietly; Suspended is the
                                                actual exception worth a reader's eye, so it keeps
                                                the bold pill. */}
                                            {s.is_active ? (
                                                <span className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-block rounded-full bg-danger-bg px-2.5 py-0.5 text-xs font-bold uppercase text-danger">
                                                    Suspended
                                                </span>
                                            )}
                                        </td>
                                    )}
                                    {isVisible('joined') && (
                                        <td className="whitespace-nowrap px-5 py-3 text-text-secondary">
                                            {new Date(s.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                    )}
                                    <td className="px-5 py-3">
                                        <div className="flex items-center justify-end gap-4">
                                            <Link href={`/admin/students/${s.id}`} className="text-sm font-semibold text-primary hover:underline">
                                                Profile
                                            </Link>
                                            <button
                                                onClick={() => router.post(`/admin/students/${s.id}/toggle-suspend`, {}, { preserveScroll: true })}
                                                className="text-sm font-semibold text-warning hover:underline"
                                            >
                                                {s.is_active ? 'Deactivate' : 'Reactivate'}
                                            </button>
                                            {/* Delete is destructive and permanent (cascades
                                                enrollments + test history) -- kept visually apart
                                                from the two routine actions, icon-only and
                                                unobtrusive until hovered, rather than sitting flush
                                                against "Deactivate" as equally-weighted text where a
                                                misclick is one slip away. */}
                                            <button
                                                onClick={() => destroyStudent(s)}
                                                title={`Delete ${s.name}`}
                                                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-text-muted hover:bg-danger-bg hover:text-danger"
                                            >
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m2 0v13a1 1 0 01-1 1H8a1 1 0 01-1-1V7h10z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Pagination links={students.links} className="mt-6 flex flex-wrap justify-center gap-2" />
        </AdminLayout>
    );
}
