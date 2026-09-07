import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

interface NoteOption { id: number; title: string }
interface FaqRow { id: number; question: string; answer: string; is_active: boolean; note: NoteOption | null }
interface Props { faqs: FaqRow[]; notes: NoteOption[] }

function FaqModal({ faq, notes, onClose }: { faq: FaqRow | null; notes: NoteOption[]; onClose: () => void }) {
    const form = useForm({
        note_id: faq?.note?.id ?? (notes[0]?.id ?? ('' as number | '')),
        question: faq?.question ?? '',
        answer: faq?.answer ?? '',
        is_active: faq?.is_active ?? true,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        if (faq) form.put(`/admin/guaranteed-notes/faqs/${faq.id}`, { onSuccess: onClose });
        else form.post('/admin/guaranteed-notes/faqs', { onSuccess: onClose });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-bold text-text">{faq ? 'Edit FAQ' : 'Add FAQ'}</h2>
                    <button onClick={onClose} className="text-text-muted hover:text-text">✕</button>
                </div>
                <form onSubmit={submit} className="space-y-3">
                    <select value={form.data.note_id} onChange={(e) => form.setData('note_id', Number(e.target.value))} className="w-full rounded-lg border border-border px-3 py-2 text-sm">
                        {notes.map((n) => <option key={n.id} value={n.id}>{n.title}</option>)}
                    </select>
                    <input placeholder="Question" value={form.data.question} onChange={(e) => form.setData('question', e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
                    {form.errors.question && <p className="text-xs text-danger">{form.errors.question}</p>}
                    <textarea rows={3} placeholder="Answer" value={form.data.answer} onChange={(e) => form.setData('answer', e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
                    {form.errors.answer && <p className="text-xs text-danger">{form.errors.answer}</p>}
                    <label className="flex items-center gap-2 text-sm text-text">
                        <input type="checkbox" checked={form.data.is_active} onChange={(e) => form.setData('is_active', e.target.checked)} />
                        Active (visible on the note's detail page)
                    </label>
                    <button type="submit" disabled={form.processing} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-bold uppercase text-on-primary hover:bg-primary-hover disabled:opacity-50">
                        {form.processing ? 'Saving…' : faq ? 'Save Changes' : 'Add FAQ'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function NoteFaqsIndex({ faqs, notes }: Props) {
    const [modalFaq, setModalFaq] = useState<FaqRow | null | undefined>(undefined);

    function destroy(faq: FaqRow) {
        if (confirm(`Delete this FAQ?`)) {
            router.delete(`/admin/guaranteed-notes/faqs/${faq.id}`, { preserveScroll: true });
        }
    }

    return (
        <AdminLayout header="Note FAQs">
            <Head title="Note FAQs" />

            <p className="mb-4 text-sm text-text-secondary">
                FAQs shown on guaranteed note detail pages. Assign each to a note. Back to{' '}
                <Link href="/admin/guaranteed-notes" className="font-semibold text-primary hover:underline">Guaranteed Notes</Link>.
            </p>

            <div className="mb-4">
                <button
                    onClick={() => setModalFaq(null)}
                    disabled={notes.length === 0}
                    className="rounded-xl bg-secondary px-5 py-2.5 text-sm font-bold uppercase text-on-secondary hover:bg-teal-800 disabled:opacity-50"
                >
                    + Add FAQ
                </button>
                {notes.length === 0 && <p className="mt-2 text-xs text-text-muted">Create a note first, under Guaranteed Notes.</p>}
            </div>

            {faqs.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                    <p className="font-bold text-text">No FAQs yet</p>
                    <p className="mt-1 text-sm">Add FAQs to answer common questions on a note's detail page.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {faqs.map((f) => (
                        <div key={f.id} className="rounded-2xl border border-border bg-surface p-4">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                    <span className="rounded-full bg-primary-subtle px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-primary">
                                        {f.note?.title ?? 'Unassigned'}
                                    </span>
                                    <p className="mt-2 font-semibold text-text">{f.question}</p>
                                    <p className="mt-1 text-sm text-text-secondary">{f.answer}</p>
                                </div>
                                <div className="flex flex-shrink-0 items-center gap-3">
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${f.is_active ? 'bg-success-bg text-success' : 'bg-surface-sunken text-text-muted'}`}>
                                        {f.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                    <button onClick={() => setModalFaq(f)} className="text-xs font-bold uppercase text-primary hover:underline">Edit</button>
                                    <button onClick={() => destroy(f)} className="text-xs font-bold uppercase text-danger hover:underline">Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modalFaq !== undefined && <FaqModal faq={modalFaq} notes={notes} onClose={() => setModalFaq(undefined)} />}
        </AdminLayout>
    );
}
