import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

interface FlashcardRow {
    id: number; front_text: string; back_text: string; status: string; is_auto_generated: boolean;
}
interface Props {
    course: { id: number; title: string };
    flashcards: FlashcardRow[];
}

const inputClass = 'w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:shadow-glow focus:outline-none';

export default function FlashcardsIndex({ course, flashcards }: Props) {
    const form = useForm({ front_text: '', back_text: '' });

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
                        <label className="mb-1 block text-sm font-medium text-text">Front (question / prompt)</label>
                        <textarea rows={3} className={inputClass} value={form.data.front_text} onChange={(e) => form.setData('front_text', e.target.value)} />
                        {form.errors.front_text && <div className="mt-1 text-xs text-danger">{form.errors.front_text}</div>}
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-text">Back (answer)</label>
                        <textarea rows={3} className={inputClass} value={form.data.back_text} onChange={(e) => form.setData('back_text', e.target.value)} />
                        {form.errors.back_text && <div className="mt-1 text-xs text-danger">{form.errors.back_text}</div>}
                    </div>
                    <button type="submit" disabled={form.processing} className="w-full rounded-lg bg-primary py-2.5 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover">
                        Add Flashcard
                    </button>
                </form>

                <div className="space-y-3 lg:col-span-2">
                    {flashcards.map((f) => (
                        <div key={f.id} className="rounded-2xl border border-border bg-surface p-5">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Front</p>
                                    <p className="text-sm text-text">{f.front_text}</p>
                                    <p className="mt-2 text-xs font-bold uppercase tracking-wide text-text-muted">Back</p>
                                    <p className="text-sm text-text-secondary">{f.back_text}</p>
                                </div>
                                <span
                                    className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-bold uppercase ${
                                        f.status === 'approved' ? 'bg-success-bg text-success' : f.status === 'rejected' ? 'bg-danger-bg text-danger' : 'bg-warning-bg text-warning'
                                    }`}
                                >
                                    {f.status}
                                </span>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-3 border-t border-border pt-3">
                                {f.status !== 'approved' && (
                                    <button
                                        onClick={() => router.post(`/admin/courses/${course.id}/flashcards/${f.id}/status`, { status: 'approved' })}
                                        className="text-xs font-bold uppercase text-success hover:underline"
                                    >
                                        Approve
                                    </button>
                                )}
                                {f.status !== 'rejected' && (
                                    <button
                                        onClick={() => router.post(`/admin/courses/${course.id}/flashcards/${f.id}/status`, { status: 'rejected' })}
                                        className="text-xs font-bold uppercase text-warning hover:underline"
                                    >
                                        Reject
                                    </button>
                                )}
                                <button
                                    onClick={() => router.delete(`/admin/courses/${course.id}/flashcards/${f.id}`)}
                                    className="text-xs font-bold uppercase text-danger hover:underline"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                    {flashcards.length === 0 && <p className="text-sm text-text-secondary">No flashcards yet.</p>}
                </div>
            </div>
        </AdminLayout>
    );
}
