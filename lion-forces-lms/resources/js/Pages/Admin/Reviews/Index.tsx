import { Head, router, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Review {
    id: number; rating: number; review_text: string | null; status: string; created_at: string;
    course: { id: number; title: string } | null; user: { name: string } | null;
}
interface CourseOption { id: number; title: string }
interface Props { reviews: Review[]; courses: CourseOption[] }

const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-warning-bg text-warning',
    approved: 'bg-success-bg text-success',
    hidden: 'bg-surface-sunken text-text-muted',
};

function Stars({ rating }: { rating: number }) {
    return (
        <span className="text-gold-500" aria-label={`${rating} out of 5 stars`}>
            {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
        </span>
    );
}

function AddReviewModal({ courses, onClose }: { courses: CourseOption[]; onClose: () => void }) {
    const form = useForm({ course_id: courses[0]?.id ?? ('' as number | ''), student_email: '', rating: 5, review_text: '' });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post('/admin/reviews', { onSuccess: onClose });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-bold text-text">Add Review</h2>
                    <button onClick={onClose} className="text-text-muted hover:text-text">✕</button>
                </div>
                <form onSubmit={submit} className="space-y-3">
                    <select value={form.data.course_id} onChange={(e) => form.setData('course_id', Number(e.target.value))} className="w-full rounded-lg border border-border px-3 py-2 text-sm">
                        {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                    <input
                        placeholder="Student email"
                        value={form.data.student_email}
                        onChange={(e) => form.setData('student_email', e.target.value)}
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                    />
                    {form.errors.student_email && <p className="text-xs text-danger">{form.errors.student_email}</p>}
                    <select value={form.data.rating} onChange={(e) => form.setData('rating', Number(e.target.value))} className="w-full rounded-lg border border-border px-3 py-2 text-sm">
                        {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} star{r > 1 ? 's' : ''}</option>)}
                    </select>
                    <textarea
                        rows={3}
                        placeholder="Review text"
                        value={form.data.review_text}
                        onChange={(e) => form.setData('review_text', e.target.value)}
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                    />
                    <button type="submit" disabled={form.processing} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-bold uppercase text-on-primary hover:bg-primary-hover disabled:opacity-50">
                        {form.processing ? 'Saving…' : 'Add Review'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function ReviewsIndex({ reviews, courses }: Props) {
    const [filter, setFilter] = useState<string>('all');
    const [courseFilter, setCourseFilter] = useState<string>('all');
    const [modalOpen, setModalOpen] = useState(false);
    const filtered = reviews
        .filter((r) => filter === 'all' || r.status === filter)
        .filter((r) => courseFilter === 'all' || String(r.course?.id) === courseFilter);

    return (
        <AdminLayout header="Course Reviews">
            <Head title="Reviews" />

            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-surface p-6">
                <div>
                    <h1 className="font-display text-2xl text-text">Reviews</h1>
                    <p className="text-sm text-text-secondary">Moderate course reviews and add testimonials for the home page.</p>
                </div>
                <button onClick={() => setModalOpen(true)} className="rounded-xl bg-secondary px-5 py-2.5 text-sm font-bold uppercase text-on-secondary hover:bg-teal-800">
                    + Add Review
                </button>
            </div>

            <div className="mb-4 flex flex-wrap gap-3">
                <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm">
                    <option value="all">All courses</option>
                    {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
                <div className="flex gap-2">
                    {['all', 'pending', 'approved', 'hidden'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`rounded-full px-4 py-1.5 text-sm font-bold uppercase tracking-wide ${filter === s ? 'bg-primary text-on-primary' : 'border border-border text-text-secondary hover:border-primary'}`}
                        >
                            {s} {s !== 'all' && `(${reviews.filter((r) => r.status === s).length})`}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                {filtered.map((r) => (
                    <div key={r.id} className="rounded-2xl border border-border bg-surface p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Stars rating={r.rating} />
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${STATUS_STYLES[r.status]}`}>{r.status}</span>
                                </div>
                                <p className="mt-1 text-sm font-semibold text-text">{r.course?.title ?? 'Unknown course'} · {r.user?.name ?? 'Unknown student'}</p>
                                {r.review_text && <p className="mt-2 text-sm text-text-secondary">{r.review_text}</p>}
                                <p className="mt-2 text-xs text-text-muted">{new Date(r.created_at).toLocaleString()}</p>
                            </div>
                            <div className="flex gap-3">
                                {r.status !== 'approved' && (
                                    <button onClick={() => router.post(`/admin/reviews/${r.id}/approve`, {}, { preserveScroll: true })} className="text-sm font-bold uppercase text-success hover:underline">
                                        Approve
                                    </button>
                                )}
                                {r.status !== 'hidden' && (
                                    <button onClick={() => router.post(`/admin/reviews/${r.id}/hide`, {}, { preserveScroll: true })} className="text-sm font-bold uppercase text-warning hover:underline">
                                        Hide
                                    </button>
                                )}
                                <button
                                    onClick={() => confirm('Delete this review permanently?') && router.delete(`/admin/reviews/${r.id}`, { preserveScroll: true })}
                                    className="text-xs font-bold uppercase text-danger hover:underline"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && <p className="text-sm text-text-secondary">No reviews here.</p>}
            </div>

            {modalOpen && <AddReviewModal courses={courses} onClose={() => setModalOpen(false)} />}
        </AdminLayout>
    );
}
