import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Instructor { id: number; name: string; qualification: string | null; experience: string | null; bio: string | null; is_active: boolean }

const inputClass = 'w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:shadow-glow focus:outline-none';
const btnClass = 'rounded-lg bg-primary px-4 py-2 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover disabled:opacity-50';

export default function InstructorsIndex({ instructors }: { instructors: Instructor[] }) {
    const addForm = useForm({ name: '', qualification: '', experience: '', bio: '' });

    return (
        <AdminLayout header="Instructors">
            <Head title="Instructors" />

            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {instructors.map((i) => (
                    <div key={i.id} className="rounded-2xl border border-border bg-surface p-5">
                        <h4 className="font-semibold text-text">{i.name}</h4>
                        <p className="text-sm text-primary">{i.qualification}</p>
                        <p className="mt-1 text-xs text-text-secondary">{i.experience}</p>
                        <p className="mt-2 text-sm text-text-secondary">{i.bio}</p>
                        <div className="mt-3 flex gap-2">
                            <button onClick={() => router.put(`/admin/instructors/${i.id}`, { ...i, is_active: !i.is_active })} className="text-xs font-bold uppercase text-primary hover:underline">
                                {i.is_active ? 'Hide' : 'Show'}
                            </button>
                            <button onClick={() => router.delete(`/admin/instructors/${i.id}`)} className="text-xs font-bold uppercase text-danger hover:underline">Delete</button>
                        </div>
                    </div>
                ))}
                {instructors.length === 0 && <p className="text-sm text-text-secondary">No instructors yet.</p>}
            </div>

            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">Add New</h3>
            <form
                onSubmit={(e) => { e.preventDefault(); addForm.post('/admin/instructors', { onSuccess: () => addForm.reset() }); }}
                className="max-w-xl space-y-2 rounded-2xl border border-border bg-surface p-5"
            >
                <input className={inputClass} placeholder="Name" value={addForm.data.name} onChange={(e) => addForm.setData('name', e.target.value)} />
                <input className={inputClass} placeholder="Qualification" value={addForm.data.qualification} onChange={(e) => addForm.setData('qualification', e.target.value)} />
                <input className={inputClass} placeholder="Experience" value={addForm.data.experience} onChange={(e) => addForm.setData('experience', e.target.value)} />
                <textarea rows={3} className={inputClass} placeholder="Bio" value={addForm.data.bio} onChange={(e) => addForm.setData('bio', e.target.value)} />
                <button type="submit" disabled={addForm.processing} className={btnClass}>Add Instructor</button>
                {Object.values(addForm.errors).map((m, i) => <div key={i} className="text-sm text-danger">{String(m)}</div>)}
            </form>
        </AdminLayout>
    );
}
