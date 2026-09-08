import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import RichTextArea from '@/Components/RichTextArea';
import AdminLayout from '@/Layouts/AdminLayout';

interface Subject { id: number; name: string }
interface FlashcardRow {
    id: number; front_text: string; back_text: string; status: string; is_auto_generated: boolean; subject: Subject | null;
}
interface Props {
    course: { id: number; title: string };
    flashcards: FlashcardRow[];
    subjects: Subject[];
}

const inputClass = 'w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:shadow-glow focus:outline-none';

export default function FlashcardsIndex({ course, flashcards, subjects }: Props) {
    const form = useForm({ subject_id: '' as number | '', front_text: '', back_text: '' });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.post(`/admin/courses/${course.id}/flashcards`, { onSuccess: () => form.reset() });
    }

    return (
        <AdminLayout header={`Flashcards — ${course.title}`}>
            <Head title="Flashcards" />

            <div className="grid gap-6 lg:grid-cols-3">
                <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-surface p-6 lg:col-span-1">
                    <h3 className="font-bold text-text">Add a Flashcard</h3>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-text">Category</label>
                        <select className={inputClass} value={form.data.subject_id} onChange={(e) => form.setData('subject_id', e.target.value ? Number(e.target.value) : '')}>
                            <option value="">No category (shown under &quot;General&quot;)</option>
                            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-text">Front (question / prompt)</label>
                        <RichTextArea rows={3} className={inputClass} value={form.data.front_text} onChange={(v) => form.setData('front_text', v)} />
                        {form.errors.front_text && <div className="mt-1 text-xs text-danger">{form.errors.front_text}</div>}
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-text">Back (answer)</label>
                        <RichTextArea rows={3} className={inputClass} value={form.data.back_text} onChange={(v) => form.setData('back_text', v)} />
                        {form.errors.back_text && <div className="mt-1 text-xs text-danger">{form.errors.back_text}</div>}
                    </div>
                    <button type="submit" disabled={form.processing} className="w-full rounded-lg bg-primary py-2.5 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover">
                        Add Flashcard
                    </button>
                </form>

                <div className="space-y-3 lg:col-span-2">
                    {flashcards.map((f) => (
                        <FlashcardRow key={f.id} card={f} courseId={course.id} subjects={subjects} />
                    ))}
                    {flashcards.length === 0 && <p className="text-sm text-text-secondary">No flashcards yet.</p>}
                </div>
            </div>
        </AdminLayout>
    );
}

// Approve/Reject/Delete already existed here; Edit didn't -- the backend
// (FlashcardController::update) already accepted front_text/back_text/
// subject_id, there was just no UI to reach it.
function FlashcardRow({ card, courseId, subjects }: { card: FlashcardRow; courseId: number; subjects: Subject[] }) {
    const [editing, setEditing] = useState(false);
    const form = useForm({ subject_id: card.subject?.id ?? ('' as number | ''), front_text: card.front_text, back_text: card.back_text });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.put(`/admin/courses/${courseId}/flashcards/${card.id}`, { onSuccess: () => setEditing(false) });
    }

    if (editing) {
        return (
            <form onSubmit={submit} className="space-y-3 rounded-2xl border border-primary bg-surface p-5">
                <select className={inputClass} value={form.data.subject_id} onChange={(e) => form.setData('subject_id', e.target.value ? Number(e.target.value) : '')}>
                    <option value="">No category (shown under &quot;General&quot;)</option>
                    {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-text-muted">Front</label>
                    <RichTextArea rows={3} className={inputClass} value={form.data.front_text} onChange={(v) => form.setData('front_text', v)} />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-text-muted">Back</label>
                    <RichTextArea rows={3} className={inputClass} value={form.data.back_text} onChange={(v) => form.setData('back_text', v)} />
                </div>
                <div className="flex gap-2">
                    <button type="submit" disabled={form.processing} className="rounded-lg bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover">Save</button>
                    <button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-border px-4 py-2 text-xs font-bold uppercase tracking-wide text-text-secondary hover:border-primary">Cancel</button>
                </div>
            </form>
        );
    }

    return (
        <div className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <span className="mb-1 inline-block rounded-full bg-primary-subtle px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-primary">
                        {card.subject?.name ?? 'General'}
                    </span>
                    <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Front</p>
                    <p className="text-sm text-text">{card.front_text}</p>
                    <p className="mt-2 text-xs font-bold uppercase tracking-wide text-text-muted">Back</p>
                    <p className="text-sm text-text-secondary">{card.back_text}</p>
                </div>
                <span
                    className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-bold uppercase ${
                        card.status === 'approved' ? 'bg-success-bg text-success' : card.status === 'rejected' ? 'bg-danger-bg text-danger' : 'bg-warning-bg text-warning'
                    }`}
                >
                    {card.status}
                </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 border-t border-border pt-3">
                <button onClick={() => setEditing(true)} className="text-xs font-bold uppercase text-primary hover:underline">Edit</button>
                {card.status !== 'approved' && (
                    <button
                        onClick={() => router.post(`/admin/courses/${courseId}/flashcards/${card.id}/status`, { status: 'approved' })}
                        className="text-xs font-bold uppercase text-success hover:underline"
                    >
                        Approve
                    </button>
                )}
                {card.status !== 'rejected' && (
                    <button
                        onClick={() => router.post(`/admin/courses/${courseId}/flashcards/${card.id}/status`, { status: 'rejected' })}
                        className="text-xs font-bold uppercase text-warning hover:underline"
                    >
                        Reject
                    </button>
                )}
                <button
                    onClick={() => router.delete(`/admin/courses/${courseId}/flashcards/${card.id}`)}
                    className="text-xs font-bold uppercase text-danger hover:underline"
                >
                    Delete
                </button>
            </div>
        </div>
    );
}
