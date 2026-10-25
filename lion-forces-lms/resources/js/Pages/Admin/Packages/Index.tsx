import { Head, router, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import CloseButton from '@/Components/CloseButton';
import StatusDot from '@/Components/StatusDot';
import AdminLayout from '@/Layouts/AdminLayout';

type Module = 'full' | 'quiz' | 'tests';
const MODULE_LABELS: Record<Module, string> = { full: 'Full Course', quiz: 'Quiz Only', tests: 'Tests Only' };

interface PackageRow {
    id: number; name: string; module: Module; description: string | null; price: string; validity_days: number | null; is_active: boolean;
    course: { id: number; title: string } | null;
}
interface CourseOption { id: number; title: string }
interface Props { packages: PackageRow[]; courses: CourseOption[] }

function ModuleSelect({ value, onChange }: { value: Module; onChange: (v: Module) => void }) {
    return (
        <div>
            <select value={value} onChange={(e) => onChange(e.target.value as Module)} className="w-full rounded-lg border border-border px-3 py-2 text-sm">
                {(Object.keys(MODULE_LABELS) as Module[]).map((m) => <option key={m} value={m}>{MODULE_LABELS[m]}</option>)}
            </select>
            <p className="mt-1 text-xs text-text-muted">What this package actually unlocks for the student.</p>
        </div>
    );
}

function AddPackageModal({ courses, onClose }: { courses: CourseOption[]; onClose: () => void }) {
    // Starts blank on purpose -- it used to silently default to whichever
    // course sorted first alphabetically, with no label explaining what
    // the dropdown even was. An admin could add a package to the wrong
    // course without ever noticing. courses itself is a live query (every
    // course, freshly loaded each time this page opens), so a course
    // added anywhere else in admin shows up here automatically -- nothing
    // to maintain in this list by hand.
    const form = useForm({ course_id: '' as number | '', name: '', module: 'full' as Module, description: '', price: '', validity_days: '' });

    function submit(e: FormEvent) {
        e.preventDefault();
        if (!form.data.course_id) return;
        form.post(`/admin/courses/${form.data.course_id}/packages`, { onSuccess: onClose });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-bold text-text">Add Package</h2>
                    <CloseButton onClick={onClose} />
                </div>
                <form onSubmit={submit} className="space-y-3">
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-text-muted">Course</label>
                        <select
                            required
                            value={form.data.course_id}
                            onChange={(e) => form.setData('course_id', e.target.value ? Number(e.target.value) : '')}
                            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                        >
                            <option value="">Select a course</option>
                            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                        <p className="mt-1 text-xs text-text-muted">Which course this pricing tier belongs to.</p>
                    </div>
                    <input placeholder="Package Name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
                    {form.errors.name && <p className="text-xs text-danger">{form.errors.name}</p>}
                    <ModuleSelect value={form.data.module} onChange={(v) => form.setData('module', v)} />
                    <textarea
                        placeholder={'One feature per line (optional), e.g.\nComplete Notes\nVerbal Intelligence Live Lectures'}
                        rows={4}
                        value={form.data.description}
                        onChange={(e) => form.setData('description', e.target.value)}
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                    />
                    <div className="flex gap-2">
                        <input type="number" placeholder="Price" value={form.data.price} onChange={(e) => form.setData('price', e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
                        <input type="number" placeholder="Validity (days)" value={form.data.validity_days} onChange={(e) => form.setData('validity_days', e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
                    </div>
                    <button type="submit" disabled={form.processing || !form.data.course_id} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-bold uppercase text-on-primary hover:bg-primary-hover disabled:opacity-50">
                        {form.processing ? 'Saving…' : 'Add Package'}
                    </button>
                </form>
            </div>
        </div>
    );
}

// The only UI trigger for packages.update was missing (same gap as the
// Flashcards list had) -- an admin could add/delete but never fix a
// placeholder price or feature list, or flip a package active/inactive,
// without opening its owning course. Description is a textarea now, not
// a single-line input: it's rendered as a checkmarked feature list
// wherever packages are shown publicly (one feature per line), so a
// single-line input made that impossible to enter properly.
function PackageRow({ pkg }: { pkg: PackageRow }) {
    const [editing, setEditing] = useState(false);
    const form = useForm({
        name: pkg.name, module: pkg.module, description: pkg.description ?? '', price: pkg.price, validity_days: pkg.validity_days ?? '', is_active: pkg.is_active,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.put(`/admin/courses/packages/${pkg.id}`, { preserveScroll: true, onSuccess: () => setEditing(false) });
    }

    function destroy() {
        if (confirm(`Delete "${pkg.name}"?`)) {
            router.delete(`/admin/courses/packages/${pkg.id}`, { preserveScroll: true });
        }
    }

    if (editing) {
        return (
            <tr>
                <td colSpan={6} className="px-5 py-4">
                    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
                        <input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="Package Name" className="rounded-lg border border-border px-3 py-2 text-sm sm:col-span-2" />
                        <div className="sm:col-span-2"><ModuleSelect value={form.data.module} onChange={(v) => form.setData('module', v)} /></div>
                        <textarea
                            value={form.data.description}
                            onChange={(e) => form.setData('description', e.target.value)}
                            placeholder={'One feature per line, e.g.\nComplete Notes\nVerbal Intelligence Live Lectures'}
                            rows={4}
                            className="rounded-lg border border-border px-3 py-2 text-sm sm:col-span-2"
                        />
                        <input type="number" value={form.data.price} onChange={(e) => form.setData('price', e.target.value)} placeholder="Price" className="rounded-lg border border-border px-3 py-2 text-sm" />
                        <input type="number" value={form.data.validity_days} onChange={(e) => form.setData('validity_days', e.target.value)} placeholder="Validity (days)" className="rounded-lg border border-border px-3 py-2 text-sm" />
                        <label className="flex items-center gap-2 text-sm text-text-secondary sm:col-span-2">
                            <input type="checkbox" checked={form.data.is_active} onChange={(e) => form.setData('is_active', e.target.checked)} />
                            Active (shown publicly)
                        </label>
                        <div className="flex gap-2 sm:col-span-2">
                            <button type="submit" disabled={form.processing} className="rounded-lg bg-primary px-4 py-2 text-xs font-bold uppercase text-on-primary hover:bg-primary-hover">Save</button>
                            <button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-border px-4 py-2 text-xs font-bold uppercase text-text-secondary hover:border-primary">Cancel</button>
                        </div>
                    </form>
                </td>
            </tr>
        );
    }

    return (
        <tr>
            <td className="px-5 py-3">
                <div className="font-medium text-text">{pkg.name}</div>
                {pkg.module !== 'full' && (
                    <span className="mt-1 inline-block rounded-full bg-primary-subtle px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-primary">
                        {MODULE_LABELS[pkg.module]}
                    </span>
                )}
                {pkg.description && <div className="whitespace-pre-line text-xs text-text-muted">{pkg.description}</div>}
            </td>
            <td className="px-5 py-3 text-text-secondary">{pkg.course?.title ?? 'N/A'}</td>
            <td className="px-5 py-3 font-semibold text-text">Rs. {Number(pkg.price).toLocaleString()}</td>
            <td className="px-5 py-3 text-text-secondary">{pkg.validity_days ? `${pkg.validity_days} days` : 'Lifetime'}</td>
            <td className="px-5 py-3">
                <StatusDot label={pkg.is_active ? 'Active' : 'Inactive'} tone={pkg.is_active ? 'positive' : 'neutral'} />
            </td>
            <td className="px-5 py-3 text-right">
                <button onClick={() => setEditing(true)} className="mr-3 text-xs font-bold uppercase text-primary hover:underline">Edit</button>
                <button onClick={destroy} className="text-xs font-bold uppercase text-danger hover:underline">Delete</button>
            </td>
        </tr>
    );
}

export default function PackagesIndex({ packages, courses }: Props) {
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <AdminLayout header="Packages">
            <Head title="Packages" />

            <p className="mb-4 text-sm text-text-secondary">
                Every pricing package across all courses. Only packages marked Active show on the public pricing pages.
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
                        {packages.map((p) => <PackageRow key={p.id} pkg={p} />)}
                    </tbody>
                </table>
            </div>

            {packages.length === 0 && <p className="py-10 text-center text-text-secondary">No packages yet.</p>}

            {modalOpen && <AddPackageModal courses={courses} onClose={() => setModalOpen(false)} />}
        </AdminLayout>
    );
}
