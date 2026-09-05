import { Head, Link, router, useForm } from '@inertiajs/react';
import RichTextArea from '@/Components/RichTextArea';
import AdminLayout from '@/Layouts/AdminLayout';

interface AssignmentRow {
    id: number; title: string; instructions: string | null; max_marks: number | null;
    due_date: string | null; is_active: boolean; section_id: number | null;
    submissions_count: number; ungraded_count: number;
}
interface Props {
    course: { id: number; title: string };
    assignments: AssignmentRow[];
    sections: { id: number; title: string }[];
}

const inputClass = 'w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:shadow-glow focus:outline-none';

export default function AssignmentsIndex({ course, assignments, sections }: Props) {
    const form = useForm({ title: '', instructions: '', max_marks: '', due_date: '', section_id: '' });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.post(`/admin/courses/${course.id}/assignments`, { onSuccess: () => form.reset() });
    }

    return (
        <AdminLayout header={`Assignments — ${course.title}`}>
            <Head title="Assignments" />

            <div className="grid gap-6 lg:grid-cols-3">
                <form onSubmit={submit} className="h-fit space-y-4 rounded-2xl border border-border bg-surface p-6 lg:col-span-1">
                    <h3 className="font-bold text-text">Add an Assignment</h3>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-text">Title</label>
                        <input className={inputClass} value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} />
                        {form.errors.title && <div className="mt-1 text-xs text-danger">{form.errors.title}</div>}
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-text">Instructions</label>
                        <RichTextArea rows={4} className={inputClass} value={form.data.instructions} onChange={(v) => form.setData('instructions', v)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-text">Max Marks</label>
                            <input type="number" className={inputClass} value={form.data.max_marks} onChange={(e) => form.setData('max_marks', e.target.value)} />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-text">Due Date</label>
                            <input type="date" className={inputClass} value={form.data.due_date} onChange={(e) => form.setData('due_date', e.target.value)} />
                        </div>
                    </div>
                    {sections.length > 0 && (
                        <div>
                            <label className="mb-1 block text-sm font-medium text-text">Topic</label>
                            <select className={inputClass} value={form.data.section_id} onChange={(e) => form.setData('section_id', e.target.value)}>
                                <option value="">No topic (ungrouped)</option>
                                {sections.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
                            </select>
                        </div>
                    )}
                    <button type="submit" disabled={form.processing} className="w-full rounded-lg bg-primary py-2.5 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover">
                        Add Assignment
                    </button>
                </form>

                <div className="space-y-3 lg:col-span-2">
                    {assignments.map((a) => (
                        <div key={a.id} className="rounded-2xl border border-border bg-surface p-5">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h4 className="font-semibold text-text">{a.title}</h4>
                                    <p className="mt-1 text-xs text-text-muted">
                                        {a.max_marks ? `${a.max_marks} marks` : 'Ungraded max'}
                                        {a.due_date && ` · Due ${new Date(a.due_date).toLocaleDateString()}`}
                                        {' · '}{a.submissions_count} submission{a.submissions_count === 1 ? '' : 's'}
                                    </p>
                                </div>
                                <div className="flex flex-shrink-0 items-center gap-3">
                                    {a.ungraded_count > 0 && (
                                        <span className="rounded-full bg-warning-bg px-2.5 py-0.5 text-xs font-bold uppercase text-warning">
                                            {a.ungraded_count} to grade
                                        </span>
                                    )}
                                    <Link
                                        href={`/admin/courses/${course.id}/assignments/${a.id}/submissions`}
                                        className="text-xs font-bold uppercase text-primary hover:underline"
                                    >
                                        View Submissions
                                    </Link>
                                    <button
                                        onClick={() => confirm('Delete this assignment and all its submissions?') && router.delete(`/admin/courses/${course.id}/assignments/${a.id}`)}
                                        className="text-xs font-bold uppercase text-danger hover:underline"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {assignments.length === 0 && <p className="text-sm text-text-secondary">No assignments yet.</p>}
                </div>
            </div>
        </AdminLayout>
    );
}
