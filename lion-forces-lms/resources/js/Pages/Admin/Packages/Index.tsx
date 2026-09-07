import { Head, router, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

interface PackageRow {
    id: number; name: string; description: string | null; price: string; validity_days: number | null; is_active: boolean;
    course: { id: number; title: string } | null;
}
interface CourseOption { id: number; title: string }
interface Props { packages: PackageRow[]; courses: CourseOption[] }

function AddPackageModal({ courses, onClose }: { courses: CourseOption[]; onClose: () => void }) {
    const form = useForm({ course_id: courses[0]?.id ?? ('' as number | ''), name: '', description: '', price: '', validity_days: '' });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post(`/admin/courses/${form.data.course_id}/packages`, { onSuccess: onClose });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-bold text-text">Add Package</h2>
                    <button onClick={onClose} className="text-text-muted hover:text-text">✕</button>
                </div>
                <form onSubmit={submit} className="space-y-3">
                    <select value={form.data.course_id} onChange={(e) => form.setData('course_id', Number(e.target.value))} className="w-full rounded-lg border border-border px-3 py-2 text-sm">
                        {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                    <input placeholder="Package Name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
                    {form.errors.name && <p className="text-xs text-danger">{form.errors.name}</p>}
                    <input placeholder="Description (optional)" value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
                    <div className="flex gap-2">
                        <input type="number" placeholder="Price" value={form.data.price} onChange={(e) => form.setData('price', e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
                        <input type="number" placeholder="Validity (days)" value={form.data.validity_days} onChange={(e) => form.setData('validity_days', e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
                    </div>
                    <button type="submit" disabled={form.processing} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-bold uppercase text-on-primary hover:bg-primary-hover disabled:opacity-50">
                        {form.processing ? 'Saving…' : 'Add Package'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function PackagesIndex({ packages, courses }: Props) {
    const [modalOpen, setModalOpen] = useState(false);

    function destroy(pkg: PackageRow) {
        if (confirm(`Delete "${pkg.name}"?`)) {
            router.delete(`/admin/courses/packages/${pkg.id}`, { preserveScroll: true });
        }
    }

    return (
        <AdminLayout header="Packages">
            <Head title="Packages" />

            <p className="mb-4 text-sm text-text-secondary">
                Every pricing package across all courses. To edit a package's price/validity in detail, open the owning
                course.
            </p>

            <div className="mb-4">
                <button onClick={() => setModalOpen(true)} className="rounded-xl bg-secondary px-5 py-2.5 text-sm font-bold uppercase text-on-secondary hover:bg-teal-800">
                    + Add Package
                </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
                <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="border-b border-border bg-surface-sunken text-xs uppercase tracking-wide text-text-muted">
                        <tr>
                            <th className="px-5 py-3">Package</th>
                            <th className="px-5 py-3">Course</th>
                            <th className="px-5 py-3">Price</th>
                            <th className="px-5 py-3">Validity</th>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {packages.map((p) => (
                            <tr key={p.id}>
                                <td className="px-5 py-3">
                                    <div className="font-medium text-text">{p.name}</div>
                                    {p.description && <div className="text-xs text-text-muted">{p.description}</div>}
                                </td>
                                <td className="px-5 py-3 text-text-secondary">{p.course?.title ?? '—'}</td>
                                <td className="px-5 py-3 font-semibold text-text">Rs. {Number(p.price).toLocaleString()}</td>
                                <td className="px-5 py-3 text-text-secondary">{p.validity_days ? `${p.validity_days} days` : 'Lifetime'}</td>
                                <td className="px-5 py-3">
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${p.is_active ? 'bg-success-bg text-success' : 'bg-surface-sunken text-text-muted'}`}>
                                        {p.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-5 py-3 text-right">
                                    <button onClick={() => destroy(p)} className="text-xs font-bold uppercase text-danger hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {packages.length === 0 && <p className="py-10 text-center text-text-secondary">No packages yet.</p>}

            {modalOpen && <AddPackageModal courses={courses} onClose={() => setModalOpen(false)} />}
        </AdminLayout>
    );
}
