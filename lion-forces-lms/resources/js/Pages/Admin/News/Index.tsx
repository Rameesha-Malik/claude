import { Head, router, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import RichTextArea from '@/Components/RichTextArea';
import AdminLayout from '@/Layouts/AdminLayout';

interface Category { id: number; name: string }
interface NewsItem {
    id: number; title: string; description: string | null; organization: string | null; image_path: string | null;
    deadline_date: string | null; application_link: string | null; is_pinned: boolean; is_active: boolean;
    category: Category | null;
}

const inputClass = 'w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:shadow-glow focus:outline-none';
const btnClass = 'rounded-lg bg-primary px-4 py-2 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover disabled:opacity-50';

// Edit was missing entirely (only Activate/Deactivate/Delete existed) and
// neither the category nor the "Apply Now" link had any input anywhere in
// this admin screen, even though the public News page only shows an Apply
// Now button when application_link is set -- so no announcement created
// from here could ever show one. Adding the image option alongside fixing
// that, rather than bolting an image field onto a form that still couldn't
// set the client's actual "Apply Now" link.
function AnnouncementRow({ item, categories }: { item: NewsItem; categories: Category[] }) {
    const [editing, setEditing] = useState(false);
    const form = useForm<{
        title: string; description: string; organization: string; category_id: number | '';
        deadline_date: string; application_link: string; is_pinned: boolean; image: File | null;
    }>({
        title: item.title,
        description: item.description ?? '',
        organization: item.organization ?? '',
        category_id: item.category?.id ?? '',
        deadline_date: item.deadline_date ? item.deadline_date.slice(0, 10) : '',
        application_link: item.application_link ?? '',
        is_pinned: item.is_pinned,
        image: null,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.put(`/admin/news/${item.id}`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => setEditing(false),
        });
    }

    function toggleActive() {
        router.put(`/admin/news/${item.id}`, {
            title: item.title,
            description: item.description,
            organization: item.organization,
            deadline_date: item.deadline_date,
            is_pinned: item.is_pinned,
            category_id: item.category?.id ?? null,
            application_link: item.application_link,
            is_active: !item.is_active,
        }, { preserveScroll: true });
    }

    if (editing) {
        return (
            <form onSubmit={submit} className="space-y-2 rounded-2xl border border-primary bg-surface p-5">
                <input className={inputClass} placeholder="Title" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} />
                <RichTextArea rows={2} className={inputClass} placeholder="Description" value={form.data.description} onChange={(v) => form.setData('description', v)} />
                <div className="flex gap-2">
                    <input className={inputClass} placeholder="Organization (e.g. PMA)" value={form.data.organization} onChange={(e) => form.setData('organization', e.target.value)} />
                    <input type="date" className={inputClass} value={form.data.deadline_date} onChange={(e) => form.setData('deadline_date', e.target.value)} />
                </div>
                <select className={inputClass} value={form.data.category_id} onChange={(e) => form.setData('category_id', e.target.value ? Number(e.target.value) : '')}>
                    <option value="">No exam category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input
                    className={inputClass}
                    placeholder="Apply Now link (the real external application URL)"
                    value={form.data.application_link}
                    onChange={(e) => form.setData('application_link', e.target.value)}
                />
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-text-muted">Image (optional)</label>
                    {item.image_path && !form.data.image && (
                        <img src={`/storage/${item.image_path}`} alt="" className="mb-2 h-20 rounded-lg border border-border object-cover" />
                    )}
                    <input type="file" accept="image/*" onChange={(e) => form.setData('image', e.target.files?.[0] ?? null)} className="text-sm" />
                </div>
                <label className="flex items-center gap-2 text-sm text-text">
                    <input type="checkbox" checked={form.data.is_pinned} onChange={(e) => form.setData('is_pinned', e.target.checked)} />
                    Pin to top
                </label>
                <div className="flex gap-2">
                    <button type="submit" disabled={form.processing} className={btnClass}>Save</button>
                    <button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-bold uppercase tracking-wide text-text-secondary hover:border-primary">Cancel</button>
                </div>
                {Object.values(form.errors).map((m, i) => <div key={i} className="text-sm text-danger">{String(m)}</div>)}
            </form>
        );
    }

    return (
        <div className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                    {item.image_path && (
                        <img src={`/storage/${item.image_path}`} alt="" className="h-16 w-16 flex-shrink-0 rounded-lg border border-border object-cover" />
                    )}
                    <div>
                        <div className="mb-1 flex flex-wrap gap-2">
                            {item.organization && <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-xs font-bold text-primary">{item.organization}</span>}
                            {item.category && <span className="rounded-full bg-surface-sunken px-2 py-0.5 text-xs font-bold text-text-muted">{item.category.name}</span>}
                            {item.is_pinned && <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-on-primary">Pinned</span>}
                            <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${item.is_active ? 'bg-success-bg text-success' : 'bg-surface-sunken text-text-muted'}`}>
                                {item.is_active ? 'Active' : 'Off'}
                            </span>
                        </div>
                        <h4 className="font-semibold text-text">{item.title}</h4>
                        <p className="mt-1 text-sm text-text-secondary">{item.description}</p>
                        {item.deadline_date && <p className="mt-1 text-xs text-text-muted">Deadline: {new Date(item.deadline_date).toLocaleDateString()}</p>}
                        {item.application_link ? (
                            <p className="mt-1 text-xs text-primary">Apply Now &rarr; {item.application_link}</p>
                        ) : (
                            <p className="mt-1 text-xs text-warning">No Apply Now link set -- the button won&apos;t show publicly.</p>
                        )}
                    </div>
                </div>
                <div className="flex flex-shrink-0 gap-2">
                    <button onClick={() => setEditing(true)} className="text-xs font-bold uppercase text-primary hover:underline">Edit</button>
                    <button onClick={toggleActive} className="text-xs font-bold uppercase text-primary hover:underline">
                        {item.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => router.delete(`/admin/news/${item.id}`)} className="text-xs font-bold uppercase text-danger hover:underline">Delete</button>
                </div>
            </div>
        </div>
    );
}

export default function NewsIndex({ announcements, categories }: { announcements: NewsItem[]; categories: Category[] }) {
    const addForm = useForm<{
        title: string; description: string; organization: string; category_id: number | '';
        deadline_date: string; application_link: string; is_pinned: boolean; image: File | null;
    }>({
        title: '', description: '', organization: '', category_id: '', deadline_date: '', application_link: '', is_pinned: false, image: null,
    });

    return (
        <AdminLayout header="News & Announcements">
            <Head title="News" />

            <div className="mb-6 space-y-3">
                {announcements.map((item) => <AnnouncementRow key={item.id} item={item} categories={categories} />)}
                {announcements.length === 0 && <p className="text-sm text-text-secondary">No announcements yet.</p>}
            </div>

            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">Add New</h3>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    addForm.post('/admin/news', { forceFormData: true, onSuccess: () => addForm.reset() });
                }}
                className="max-w-xl space-y-2 rounded-2xl border border-border bg-surface p-5"
            >
                <input className={inputClass} placeholder="Title" value={addForm.data.title} onChange={(e) => addForm.setData('title', e.target.value)} />
                <RichTextArea rows={2} className={inputClass} placeholder="Description" value={addForm.data.description} onChange={(v) => addForm.setData('description', v)} />
                <div className="flex gap-2">
                    <input className={inputClass} placeholder="Organization (e.g. PMA)" value={addForm.data.organization} onChange={(e) => addForm.setData('organization', e.target.value)} />
                    <input type="date" className={inputClass} value={addForm.data.deadline_date} onChange={(e) => addForm.setData('deadline_date', e.target.value)} />
                </div>
                <select className={inputClass} value={addForm.data.category_id} onChange={(e) => addForm.setData('category_id', e.target.value ? Number(e.target.value) : '')}>
                    <option value="">No exam category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input
                    className={inputClass}
                    placeholder="Apply Now link (the real external application URL)"
                    value={addForm.data.application_link}
                    onChange={(e) => addForm.setData('application_link', e.target.value)}
                />
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-text-muted">Image (optional)</label>
                    <input type="file" accept="image/*" onChange={(e) => addForm.setData('image', e.target.files?.[0] ?? null)} className="text-sm" />
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
