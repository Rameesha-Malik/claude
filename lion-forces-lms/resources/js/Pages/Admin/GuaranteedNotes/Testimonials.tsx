import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

interface NoteOption { id: number; title: string }
interface TestimonialRow {
    id: number; student_name: string; testimonial_text: string; rating: number | null; is_featured: boolean; note: NoteOption | null;
}
interface Props { testimonials: TestimonialRow[]; notes: NoteOption[] }

function TestimonialModal({ testimonial, notes, onClose }: { testimonial: TestimonialRow | null; notes: NoteOption[]; onClose: () => void }) {
    const form = useForm({
        note_id: testimonial?.note?.id ?? (notes[0]?.id ?? ('' as number | '')),
        student_name: testimonial?.student_name ?? '',
        testimonial_text: testimonial?.testimonial_text ?? '',
        rating: testimonial?.rating ?? 5,
        is_featured: testimonial?.is_featured ?? false,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        if (testimonial) form.put(`/admin/guaranteed-notes/testimonials/${testimonial.id}`, { onSuccess: onClose });
        else form.post('/admin/guaranteed-notes/testimonials', { onSuccess: onClose });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-bold text-text">{testimonial ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
                    <button onClick={onClose} className="text-text-muted hover:text-text">✕</button>
                </div>
                <form onSubmit={submit} className="space-y-3">
                    <select value={form.data.note_id} onChange={(e) => form.setData('note_id', Number(e.target.value))} className="w-full rounded-lg border border-border px-3 py-2 text-sm">
                        {notes.map((n) => <option key={n.id} value={n.id}>{n.title}</option>)}
                    </select>
                    <input placeholder="Student name" value={form.data.student_name} onChange={(e) => form.setData('student_name', e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
                    {form.errors.student_name && <p className="text-xs text-danger">{form.errors.student_name}</p>}
                    <textarea rows={3} placeholder="Testimonial" value={form.data.testimonial_text} onChange={(e) => form.setData('testimonial_text', e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
                    {form.errors.testimonial_text && <p className="text-xs text-danger">{form.errors.testimonial_text}</p>}
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase text-text-muted">Rating</label>
                        <select value={form.data.rating} onChange={(e) => form.setData('rating', Number(e.target.value))} className="w-full rounded-lg border border-border px-3 py-2 text-sm">
                            {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} star{r > 1 ? 's' : ''}</option>)}
                        </select>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-text">
                        <input type="checkbox" checked={form.data.is_featured} onChange={(e) => form.setData('is_featured', e.target.checked)} />
                        Featured
                    </label>
                    <button type="submit" disabled={form.processing} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-bold uppercase text-on-primary hover:bg-primary-hover disabled:opacity-50">
                        {form.processing ? 'Saving…' : testimonial ? 'Save Changes' : 'Add Testimonial'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function NoteTestimonialsIndex({ testimonials, notes }: Props) {
    const [modalTestimonial, setModalTestimonial] = useState<TestimonialRow | null | undefined>(undefined);

    function destroy(t: TestimonialRow) {
        if (confirm(`Delete ${t.student_name}'s testimonial?`)) {
            router.delete(`/admin/guaranteed-notes/testimonials/${t.id}`, { preserveScroll: true });
        }
    }

    return (
        <AdminLayout header="Note Testimonials">
            <Head title="Note Testimonials" />

            <p className="mb-4 text-sm text-text-secondary">
                Testimonials shown on guaranteed note detail pages. Assign each to a note. Back to{' '}
                <Link href="/admin/guaranteed-notes" className="font-semibold text-primary hover:underline">Guaranteed Notes</Link>.
            </p>

            <div className="mb-4">
                <button
                    onClick={() => setModalTestimonial(null)}
                    disabled={notes.length === 0}
                    className="rounded-xl bg-secondary px-5 py-2.5 text-sm font-bold uppercase text-on-secondary hover:bg-teal-800 disabled:opacity-50"
                >
                    + Add Testimonial
                </button>
                {notes.length === 0 && <p className="mt-2 text-xs text-text-muted">Create a note first, under Guaranteed Notes.</p>}
            </div>

            {testimonials.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                    <p className="font-bold text-text">No testimonials yet</p>
                    <p className="mt-1 text-sm">Add testimonials to show on guaranteed note detail pages.</p>
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    {testimonials.map((t) => (
                        <div key={t.id} className="rounded-2xl border border-border bg-surface p-4">
                            <div className="flex items-start justify-between gap-2">
                                <span className="rounded-full bg-primary-subtle px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-primary">
                                    {t.note?.title ?? 'Unassigned'}
                                </span>
                                {t.is_featured && <span className="rounded-full bg-warning-bg px-2 py-0.5 text-xs font-bold uppercase text-warning">Featured</span>}
                            </div>
                            <p className="mt-2 font-bold text-text">{t.student_name}</p>
                            {t.rating && <p className="text-xs text-warning">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</p>}
                            <p className="mt-2 text-sm text-text-secondary">{t.testimonial_text}</p>
                            <div className="mt-3 flex gap-3">
                                <button onClick={() => setModalTestimonial(t)} className="text-xs font-bold uppercase text-primary hover:underline">Edit</button>
                                <button onClick={() => destroy(t)} className="text-xs font-bold uppercase text-danger hover:underline">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modalTestimonial !== undefined && <TestimonialModal testimonial={modalTestimonial} notes={notes} onClose={() => setModalTestimonial(undefined)} />}
        </AdminLayout>
    );
}
