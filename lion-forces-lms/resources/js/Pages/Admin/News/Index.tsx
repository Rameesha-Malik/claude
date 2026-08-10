import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Category { id: number; name: string }
interface NewsItem {
    id: number; title: string; description: string | null; organization: string | null;
    deadline_date: string | null; is_pinned: boolean; is_active: boolean;
    category: Category | null;
}

const inputClass = 'w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:shadow-glow focus:outline-none';
const btnClass = 'rounded-lg bg-primary px-4 py-2 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover disabled:opacity-50';

export default function NewsIndex({ announcements, categories }: { announcements: NewsItem[]; categories: Category[] }) {
    const addForm = useForm({ title: '', description: '', organization: '', deadline_date: '', is_pinned: false });

    return (
        <AdminLayout header="News & Announcements">
            <Head title="News" />

            <div className="mb-6 space-y-3">
                {announcements.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-border bg-surface p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="mb-1 flex gap-2">
                                    {item.organization && <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-xs font-bold text-primary">{item.organization}</span>}
                                    {item.is_pinned && <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-fg">Pinned</span>}
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${item.is_active ? 'bg-success-bg text-success' : 'bg-surface-sunken text-text-muted'}`}>
                                        {item.is_active ? 'Active' : 'Off'}
                                    </span>
                                </div>
                                <h4 className="font-semibold text-text">{item.title}</h4>
                                <p className="mt-1 text-sm text-text-secondary">{item.description}</p>
                                {item.deadline_date && <p className="mt-1 text-xs text-text-muted">Deadline: {new Date(item.deadline_date).toLocaleDateString()}</p>}
                            </div>
                            <div className="flex flex-shrink-0 gap-2">
                                <button
                                    onClick={() => router.put(`/admin/news/${item.id}`, {
                                        title: item.title,
                                        description: item.description,
                                        organization: item.organization,
                                        deadline_date: item.deadline_date,
                                        is_pinned: item.is_pinned,
                                        category_id: item.category?.id ?? null,
                                        is_active: !item.is_active,
                                    })}
                                    className="text-xs font-bold uppercase text-primary hover:underline"
                                >
                                    {item.is_active ? 'Deactivate' : 'Activate'}
                                </button>
                                <button onClick={() => router.delete(`/admin/news/${item.id}`)} className="text-xs font-bold uppercase text-danger hover:underline">Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
                {announcements.length === 0 && <p className="text-sm text-text-secondary">No announcements yet.</p>}
            </div>

            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">Add New</h3>
            <form
                onSubmit={(e) => { e.preventDefault(); addForm.post('/admin/news', { onSuccess: () => addForm.reset() }); }}
                className="max-w-xl space-y-2 rounded-2xl border border-border bg-surface p-5"
            >
                <input className={inputClass} placeholder="Title" value={addForm.data.title} onChange={(e) => addForm.setData('title', e.target.value)} />
                <textarea rows={2} className={inputClass} placeholder="Description" value={addForm.data.description} onChange={(e) => addForm.setData('description', e.target.value)} />
                <div className="flex gap-2">
                    <input className={inputClass} placeholder="Organization (e.g. PMA)" value={addForm.data.organization} onChange={(e) => addForm.setData('organization', e.target.value)} />
                    <input type="date" className={inputClass} value={addForm.data.deadline_date} onChange={(e) => addForm.setData('deadline_date', e.target.value)} />
                </div>
                <label className="flex items-center gap-2 text-sm text-text">
                    <input type="checkbox" checked={addForm.data.is_pinned} onChange={(e) => addForm.setData('is_pinned', e.target.checked)} />
                    Pin to top
                </label>
                <button type="submit" disabled={addForm.processing} className={btnClass}>Add Announcement</button>
                {Object.values(addForm.errors).map((m, i) => <div key={i} className="text-sm text-danger">{String(m)}</div>)}
            </form>
        </AdminLayout>
    );
}
