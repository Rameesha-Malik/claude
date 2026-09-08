import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import RichTextArea from '@/Components/RichTextArea';
import AdminLayout from '@/Layouts/AdminLayout';

interface Subject { id: number; name: string }
interface Note {
    id: number; title: string; content: string | null; file_path: string | null;
    price: string | null; is_published: boolean; subject: Subject | null; purchases_count: number;
}
interface Props {
    notes: { data: Note[]; links: { url: string | null; label: string; active: boolean }[]; total: number };
    subjects: Subject[];
    filters: { search?: string; subject_id?: string };
    stats: { total: number; paid: number; pending_requests: number };
}

function NoteModal({ note, subjects, onClose }: { note: Note | null; subjects: Subject[]; onClose: () => void }) {
    const form = useForm({
        subject_id: note?.subject?.id ?? ('' as number | ''),
        title: note?.title ?? '',
        content: note?.content ?? '',
        price: note?.price ?? '',
        is_published: note?.is_published ?? true,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        if (note) form.put(`/admin/content-library/notes/${note.id}`, { onSuccess: onClose });
        else form.post('/admin/content-library/notes', { onSuccess: onClose });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-bold text-text">{note ? 'Edit Note' : 'Add Note'}</h2>
                    <button onClick={onClose} className="text-text-muted hover:text-text">✕</button>
                </div>
                <form onSubmit={submit} className="space-y-3">
                    <select value={form.data.subject_id} onChange={(e) => form.setData('subject_id', e.target.value ? Number(e.target.value) : '')} className="w-full rounded-lg border border-border px-3 py-2 text-sm">
                        <option value="">No category</option>
                        {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <input placeholder="Title" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
                    {form.errors.title && <p className="text-xs text-danger">{form.errors.title}</p>}
                    <RichTextArea rows={4} className="w-full rounded-lg border border-border px-3 py-2 text-sm" placeholder="Content / preview text" value={form.data.content} onChange={(v) => form.setData('content', v)} />
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase text-text-muted">Price (Rs.) — leave blank for a free note</label>
                        <input type="number" min="0" step="0.01" placeholder="0" value={form.data.price} onChange={(e) => form.setData('price', e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-text">
                        <input type="checkbox" checked={form.data.is_published} onChange={(e) => form.setData('is_published', e.target.checked)} />
                        Published (visible on the public Notes page)
                    </label>
                    <button type="submit" disabled={form.processing} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-bold uppercase text-on-primary hover:bg-primary-hover disabled:opacity-50">
                        {form.processing ? 'Saving…' : note ? 'Save Changes' : 'Add Note'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function GuaranteedNotesIndex({ notes, subjects, filters, stats }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [modalNote, setModalNote] = useState<Note | null | undefined>(undefined);

    function submitSearch(e: FormEvent) {
        e.preventDefault();
        router.get('/admin/guaranteed-notes', { ...filters, search: search || undefined }, { preserveState: true });
    }

    function destroyNote(n: Note) {
        if (confirm(`Delete "${n.title}"? This also removes any purchase history tied to it.`)) {
            router.delete(`/admin/content-library/notes/${n.id}`, { preserveScroll: true });
        }
    }

    return (
        <AdminLayout header="Guaranteed Notes">
            <Head title="Guaranteed Notes" />

            <div className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-border bg-surface p-6 sm:p-8">
                <div className="flex gap-4">
                    <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary text-on-primary">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                    </span>
                    <div>
                        <h1 className="font-display text-3xl text-text">
                            Guaranteed <span className="text-primary">Notes</span>
                        </h1>
                        <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Asset management</p>
                        <p className="mt-2 max-w-xl text-sm text-text-secondary">
                            Manage premium study resources for students. Organize by categories and set pricing for individual assets.
                        </p>
                    </div>
                </div>
                <div className="flex flex-shrink-0 flex-wrap gap-2">
                    <button onClick={() => setModalNote(null)} className="rounded-xl bg-secondary px-5 py-2.5 text-sm font-bold uppercase text-on-secondary hover:bg-teal-800">
                        + Add Note
                    </button>
                    <Link href="/admin/content-library" className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-bold text-text hover:border-primary hover:text-primary">
                        Categories
                    </Link>
                    <Link href="/admin/guaranteed-notes/purchase-requests" className="relative rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-bold text-text hover:border-primary hover:text-primary">
                        Purchase Requests
                        {stats.pending_requests > 0 && (
                            <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                                {stats.pending_requests}
                            </span>
                        )}
                    </Link>
                </div>
            </div>

            <form onSubmit={submitSearch} className="mb-4 flex gap-2">
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notes…" className="flex-1 rounded-lg border border-border px-3 py-2.5 text-sm" />
                <button type="submit" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-on-primary hover:bg-primary-hover">Search</button>
            </form>

            <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
                <table className="w-full min-w-[800px] text-left text-sm">
                    <thead className="border-b border-border bg-surface-sunken text-xs uppercase tracking-wide text-text-muted">
                        <tr>
                            <th className="px-5 py-3">Title &amp; Description</th>
                            <th className="px-5 py-3">Category</th>
                            <th className="px-5 py-3">Type</th>
                            <th className="px-5 py-3">Access</th>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {notes.data.map((n) => {
                            const isPaid = Number(n.price ?? 0) > 0;
                            return (
                                <tr key={n.id}>
                                    <td className="px-5 py-3">
                                        <div className="font-medium text-text">{n.title}</div>
                                        {n.content && <div className="mt-0.5 line-clamp-1 max-w-xs text-xs text-text-muted">{n.content}</div>}
                                    </td>
                                    <td className="px-5 py-3 text-text-secondary">{n.subject?.name ?? '—'}</td>
                                    <td className="px-5 py-3 text-text-secondary">{n.file_path ? 'PDF' : 'Text'}</td>
                                    <td className="px-5 py-3">
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${isPaid ? 'bg-warning-bg text-warning' : 'bg-success-bg text-success'}`}>
                                            {isPaid ? `Paid · Rs. ${Number(n.price).toLocaleString()}` : 'Free'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${n.is_published ? 'bg-success-bg text-success' : 'bg-surface-sunken text-text-muted'}`}>
                                            {n.is_published ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <div className="flex justify-end gap-3">
                                            <button onClick={() => setModalNote(n)} className="text-xs font-bold uppercase text-primary hover:underline">Edit</button>
                                            <button onClick={() => destroyNote(n)} className="text-xs font-bold uppercase text-danger hover:underline">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {notes.data.length === 0 && (
                <div className="mt-4 rounded-3xl border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                    <p className="font-bold text-text">No notes yet</p>
                    <p className="mt-1 text-sm">Create categories first, then add notes for the public registry.</p>
                    <button onClick={() => setModalNote(null)} className="mt-4 rounded-xl bg-secondary px-5 py-2.5 text-sm font-bold uppercase text-on-secondary hover:bg-teal-800">
                        + Create first note
                    </button>
                </div>
            )}

            <div className="mt-6 flex flex-wrap justify-center gap-2">
                {notes.links.map((link, i) => (
                    <button
                        key={i}
                        disabled={!link.url}
                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                        className={`rounded-lg px-4 py-2 text-sm ${link.active ? 'bg-primary text-on-primary' : 'bg-surface text-text-secondary hover:bg-primary-subtle'} disabled:opacity-40`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}
            </div>

            {modalNote !== undefined && <NoteModal note={modalNote} subjects={subjects} onClose={() => setModalNote(undefined)} />}
        </AdminLayout>
    );
}
