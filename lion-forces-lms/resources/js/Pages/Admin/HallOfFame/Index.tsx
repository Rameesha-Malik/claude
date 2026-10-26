import { Head, router, useForm } from '@inertiajs/react';
import RichTextArea from '@/Components/RichTextArea';
import AdminLayout from '@/Layouts/AdminLayout';

interface Entry { id: number; name: string; achievement_text: string; is_active: boolean }

const inputClass = 'w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:shadow-glow focus:outline-none';
const btnClass = 'rounded-lg bg-primary px-4 py-2 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover disabled:opacity-50';

export default function HallOfFameIndex({ entries }: { entries: Entry[] }) {
    const addForm = useForm({ name: '', achievement_text: '' });

    return (
        <AdminLayout header="Hall of Fame">
            <Head title="Hall of Fame" />

            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {entries.map((e) => (
                    <div key={e.id} className="rounded-2xl border border-border bg-surface p-5">
                        <h4 className="font-semibold text-text">{e.name}</h4>
                        <p className="mt-1 text-sm text-text-secondary">{e.achievement_text}</p>
                        <div className="mt-3 flex gap-2">
                            <button onClick={() => router.put(`/admin/hall-of-fame/${e.id}`, { ...e, is_active: !e.is_active })} className="text-xs font-bold uppercase text-primary hover:underline">
                                {e.is_active ? 'Hide' : 'Show'}
                            </button>
                            <button onClick={() => router.delete(`/admin/hall-of-fame/${e.id}`)} className="text-xs font-bold uppercase text-danger hover:underline">Delete</button>
                        </div>
                    </div>
                ))}
                {entries.length === 0 && <p className="text-sm text-text-secondary">No entries yet.</p>}
            </div>

            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">Add New</h3>
            <form
                onSubmit={(ev) => { ev.preventDefault(); addForm.post('/admin/hall-of-fame', { onSuccess: () => addForm.reset() }); }}
                className="max-w-xl space-y-2 rounded-2xl border border-border bg-surface p-5"
            >
                <input className={inputClass} placeholder="Name" value={addForm.data.name} onChange={(e) => addForm.setData('name', e.target.value)} />
                <RichTextArea rows={3} className={inputClass} placeholder="Achievement" value={addForm.data.achievement_text} onChange={(v) => addForm.setData('achievement_text', v)} />
                <button type="submit" disabled={addForm.processing} className={btnClass}>Add Entry</button>
                {Object.values(addForm.errors).map((m, i) => <div key={i} className="text-sm text-danger">{String(m)}</div>)}
            </form>
        </AdminLayout>
    );
}
