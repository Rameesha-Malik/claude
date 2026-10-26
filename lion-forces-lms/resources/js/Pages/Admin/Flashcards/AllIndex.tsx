import { Head, router, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import CloseButton from '@/Components/CloseButton';
import StatusDot from '@/Components/StatusDot';
import AdminLayout from '@/Layouts/AdminLayout';

interface Subject { id: number; name: string }
interface CourseOption { id: number; title: string }
interface FlashcardRow {
    id: number; front_text: string; back_text: string; status: string;
    course: { id: number; title: string }; subject: Subject | null;
}
interface Props { flashcards: FlashcardRow[]; courses: CourseOption[]; subjects: Subject[] }

function AddFlashcardModal({ courses, subjects, onClose }: { courses: CourseOption[]; subjects: Subject[]; onClose: () => void }) {
    const form = useForm({ course_id: '' as number | '', subject_id: '' as number | '', front_text: '', back_text: '' });

    function submit(e: FormEvent) {
        e.preventDefault();
        if (!form.data.course_id) return;
        form.post(`/admin/courses/${form.data.course_id}/flashcards`, { onSuccess: onClose });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-bold text-text">Add Flashcard</h2>
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
                    </div>
                    <select
                        value={form.data.subject_id}
                        onChange={(e) => form.setData('subject_id', e.target.value ? Number(e.target.value) : '')}
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                    >
                        <option value="">No category (shown under &quot;General&quot;)</option>
                        {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <textarea placeholder="Front (question / prompt)" rows={3} value={form.data.front_text} onChange={(e) => form.setData('front_text', e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
                    {form.errors.front_text && <p className="text-xs text-danger">{form.errors.front_text}</p>}
                    <textarea placeholder="Back (answer)" rows={3} value={form.data.back_text} onChange={(e) => form.setData('back_text', e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
                    {form.errors.back_text && <p className="text-xs text-danger">{form.errors.back_text}</p>}
                    <button type="submit" disabled={form.processing || !form.data.course_id} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-bold uppercase text-on-primary hover:bg-primary-hover disabled:opacity-50">
                        {form.processing ? 'Saving…' : 'Add Flashcard'}
                    </button>
                </form>
            </div>
        </div>
    );
}

function FlashcardTableRow({ card, subjects }: { card: FlashcardRow; subjects: Subject[] }) {
    const [editing, setEditing] = useState(false);
    const form = useForm({ subject_id: card.subject?.id ?? ('' as number | ''), front_text: card.front_text, back_text: card.back_text });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.put(`/admin/courses/${card.course.id}/flashcards/${card.id}`, { preserveScroll: true, onSuccess: () => setEditing(false) });
    }

    function destroy() {
        if (confirm('Delete this flashcard?')) {
            router.delete(`/admin/courses/${card.course.id}/flashcards/${card.id}`, { preserveScroll: true });
        }
    }

    if (editing) {
        return (
            <tr>
                <td colSpan={5} className="px-5 py-4">
                    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
                        <select
                            value={form.data.subject_id}
                            onChange={(e) => form.setData('subject_id', e.target.value ? Number(e.target.value) : '')}
                            className="rounded-lg border border-border px-3 py-2 text-sm sm:col-span-2"
                        >
                            <option value="">No category (shown under &quot;General&quot;)</option>
                            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <textarea value={form.data.front_text} onChange={(e) => form.setData('front_text', e.target.value)} placeholder="Front" rows={3} className="rounded-lg border border-border px-3 py-2 text-sm sm:col-span-2" />
                        <textarea value={form.data.back_text} onChange={(e) => form.setData('back_text', e.target.value)} placeholder="Back" rows={3} className="rounded-lg border border-border px-3 py-2 text-sm sm:col-span-2" />
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
                <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Front</p>
                <p className="text-sm text-text">{card.front_text}</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-wide text-text-muted">Back</p>
                <p className="text-sm text-text-secondary">{card.back_text}</p>
            </td>
            <td className="px-5 py-3 text-text-secondary">{card.course.title}</td>
            <td className="px-5 py-3 text-text-secondary">{card.subject?.name ?? 'General'}</td>
            <td className="px-5 py-3">
                <StatusDot label={card.status} tone={card.status === 'approved' ? 'positive' : card.status === 'rejected' ? 'negative' : 'warning'} />
            </td>
            <td className="px-5 py-3 text-right">
                <button onClick={() => setEditing(true)} className="mr-3 text-xs font-bold uppercase text-primary hover:underline">Edit</button>
                <button onClick={destroy} className="text-xs font-bold uppercase text-danger hover:underline">Delete</button>
            </td>
        </tr>
    );
}

export default function FlashcardsAllIndex({ flashcards, courses, subjects }: Props) {
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <AdminLayout header="Flashcards">
            <Head title="Flashcards" />

            <p className="mb-4 text-sm text-text-secondary">
                Every flashcard across all courses. For bulk review/approve workflows on one course, use that course&apos;s own Flashcards page.
            </p>

            <div className="mb-4">
                <button onClick={() => setModalOpen(true)} className="rounded-xl bg-secondary px-5 py-2.5 text-sm font-bold uppercase text-on-secondary hover:bg-teal-800">
                    + Add Flashcard
                </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
                <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="border-b border-border bg-surface-sunken text-xs uppercase tracking-wide text-text-muted">
                        <tr>
                            <th className="px-5 py-3">Card</th>
                            <th className="px-5 py-3">Course</th>
                            <th className="px-5 py-3">Category</th>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {flashcards.map((f) => <FlashcardTableRow key={f.id} card={f} subjects={subjects} />)}
                    </tbody>
                </table>
            </div>

            {flashcards.length === 0 && <p className="py-10 text-center text-text-secondary">No flashcards yet.</p>}

            {modalOpen && <AddFlashcardModal courses={courses} subjects={subjects} onClose={() => setModalOpen(false)} />}
        </AdminLayout>
    );
}
