import { Head, router, useForm } from '@inertiajs/react';
import RichTextArea from '@/Components/RichTextArea';
import AdminLayout from '@/Layouts/AdminLayout';

interface ResourceItem { id: number; title: string; category: string | null; description: string | null; external_link: string | null; is_published: boolean }

const inputClass = 'w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:shadow-glow focus:outline-none';
const btnClass = 'rounded-lg bg-primary px-4 py-2 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover disabled:opacity-50';

export default function ResourcesIndex({ resources }: { resources: ResourceItem[] }) {
    const addForm = useForm({ title: '', category: '', description: '', external_link: '' });

    return (
        <AdminLayout header="Resources">
            <Head title="Resources" />

            <div className="mb-6 space-y-3">
                {resources.map((r) => (
                    <div key={r.id} className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-surface p-5">
                        <div>
                            {r.category && <span className="mb-1 inline-block rounded-full bg-primary-subtle px-2 py-0.5 text-xs font-bold text-primary">{r.category}</span>}
                            <h4 className="font-semibold text-text">{r.title}</h4>
                            <p className="mt-1 text-sm text-text-secondary">{r.description}</p>
                        </div>
                        <div className="flex flex-shrink-0 gap-2">
                            <button onClick={() => router.put(`/admin/resources/${r.id}`, { ...r, is_published: !r.is_published })} className="text-xs font-bold uppercase text-primary hover:underline">
                                {r.is_published ? 'Unpublish' : 'Publish'}
                            </button>
                            <button onClick={() => router.delete(`/admin/resources/${r.id}`)} className="text-xs font-bold uppercase text-danger hover:underline">Delete</button>
                        </div>
                    </div>
                ))}
                {resources.length === 0 && <p className="text-sm text-text-secondary">No resources yet.</p>}
            </div>

            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">Add New</h3>
            <form
                onSubmit={(e) => { e.preventDefault(); addForm.post('/admin/resources', { onSuccess: () => addForm.reset() }); }}
                className="max-w-xl space-y-2 rounded-2xl border border-border bg-surface p-5"
            >
                <input className={inputClass} placeholder="Title" value={addForm.data.title} onChange={(e) => addForm.setData('title', e.target.value)} />
                <input className={inputClass} placeholder="Category (e.g. Syllabus)" value={addForm.data.category} onChange={(e) => addForm.setData('category', e.target.value)} />
                <RichTextArea rows={2} className={inputClass} placeholder="Description" value={addForm.data.description} onChange={(v) => addForm.setData('description', v)} />
                <input className={inputClass} placeholder="Link (URL to file)" value={addForm.data.external_link} onChange={(e) => addForm.setData('external_link', e.target.value)} />
                <button type="submit" disabled={addForm.processing} className={btnClass}>Add Resource</button>
                {Object.values(addForm.errors).map((m, i) => <div key={i} className="text-sm text-danger">{String(m)}</div>)}
            </form>
        </AdminLayout>
    );
}
