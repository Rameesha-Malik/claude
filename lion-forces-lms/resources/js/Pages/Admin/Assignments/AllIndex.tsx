import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import CloseButton from '@/Components/CloseButton';
import StatusDot from '@/Components/StatusDot';
import AdminLayout from '@/Layouts/AdminLayout';

interface CourseOption { id: number; title: string }
interface AssignmentRow {
    id: number; title: string; instructions: string | null; max_marks: number | null; due_date: string | null; is_active: boolean;
    submissions_count: number; ungraded_count: number; course: { id: number; title: string };
}
interface Props { assignments: AssignmentRow[]; courses: CourseOption[] }

function AddAssignmentModal({ courses, onClose }: { courses: CourseOption[]; onClose: () => void }) {
    const form = useForm({ course_id: '' as number | '', title: '', instructions: '', max_marks: '', due_date: '', is_active: true });

    function submit(e: FormEvent) {
        e.preventDefault();
        if (!form.data.course_id) return;
        form.post(`/admin/courses/${form.data.course_id}/assignments`, { onSuccess: onClose });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-bold text-text">Add Assignment</h2>
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
                        <p className="mt-1 text-xs text-text-muted">To assign this to a specific topic/section, use that course&apos;s own Assignments page instead.</p>
                    </div>
                    <input placeholder="Title" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
                    {form.errors.title && <p className="text-xs text-danger">{form.errors.title}</p>}
                    <textarea placeholder="Instructions" rows={4} value={form.data.instructions} onChange={(e) => form.setData('instructions', e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
                    <div className="flex gap-2">
                        <input type="number" placeholder="Max Marks" value={form.data.max_marks} onChange={(e) => form.setData('max_marks', e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
                        <input type="date" value={form.data.due_date} onChange={(e) => form.setData('due_date', e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
                    </div>
                    <button type="submit" disabled={form.processing || !form.data.course_id} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-bold uppercase text-on-primary hover:bg-primary-hover disabled:opacity-50">
                        {form.processing ? 'Saving…' : 'Add Assignment'}
                    </button>
                </form>
            </div>
        </div>
    );
}

function AssignmentTableRow({ assignment }: { assignment: AssignmentRow }) {
    const [editing, setEditing] = useState(false);
    const form = useForm({
        title: assignment.title, instructions: assignment.instructions ?? '', max_marks: assignment.max_marks ?? '',
        due_date: assignment.due_date ?? '', is_active: assignment.is_active,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.put(`/admin/courses/${assignment.course.id}/assignments/${assignment.id}`, { preserveScroll: true, onSuccess: () => setEditing(false) });
    }

    function destroy() {
        if (confirm(`Delete "${assignment.title}" and all its submissions?`)) {
            router.delete(`/admin/courses/${assignment.course.id}/assignments/${assignment.id}`, { preserveScroll: true });
        }
    }

    if (editing) {
        return (
            <tr>
                <td colSpan={6} className="px-5 py-4">
                    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
                        <input value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} placeholder="Title" className="rounded-lg border border-border px-3 py-2 text-sm sm:col-span-2" />
                        <textarea value={form.data.instructions} onChange={(e) => form.setData('instructions', e.target.value)} placeholder="Instructions" rows={4} className="rounded-lg border border-border px-3 py-2 text-sm sm:col-span-2" />
                        <input type="number" value={form.data.max_marks} onChange={(e) => form.setData('max_marks', e.target.value)} placeholder="Max Marks" className="rounded-lg border border-border px-3 py-2 text-sm" />
                        <input type="date" value={form.data.due_date} onChange={(e) => form.setData('due_date', e.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm" />
                        <label className="flex items-center gap-2 text-sm text-text-secondary sm:col-span-2">
                            <input type="checkbox" checked={form.data.is_active} onChange={(e) => form.setData('is_active', e.target.checked)} />
                            Active
                        </label>
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
                <div className="font-medium text-text">{assignment.title}</div>
                {assignment.ungraded_count > 0 && (
                    <span className="mt-1 inline-block rounded-full bg-warning-bg px-2 py-0.5 text-xs font-bold uppercase text-warning">
                        {assignment.ungraded_count} to grade
                    </span>
                )}
            </td>
            <td className="px-5 py-3 text-text-secondary">{assignment.course.title}</td>
            <td className="px-5 py-3 text-text-secondary">{assignment.max_marks ? `${assignment.max_marks} marks` : 'Ungraded'}</td>
            <td className="px-5 py-3 text-text-secondary">{assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No due date'}</td>
            <td className="px-5 py-3">
                <StatusDot label={assignment.is_active ? 'Active' : 'Inactive'} tone={assignment.is_active ? 'positive' : 'neutral'} />
            </td>
            <td className="px-5 py-3 text-right">
                <Link href={`/admin/courses/${assignment.course.id}/assignments/${assignment.id}/submissions`} className="mr-3 text-xs font-bold uppercase text-primary hover:underline">
                    Submissions
                </Link>
                <button onClick={() => setEditing(true)} className="mr-3 text-xs font-bold uppercase text-primary hover:underline">Edit</button>
                <button onClick={destroy} className="text-xs font-bold uppercase text-danger hover:underline">Delete</button>
            </td>
        </tr>
    );
}

export default function AssignmentsAllIndex({ assignments, courses }: Props) {
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <AdminLayout header="Assignments">
            <Head title="Assignments" />

            <p className="mb-4 text-sm text-text-secondary">Every assignment across all courses.</p>

            <div className="mb-4">
                <button onClick={() => setModalOpen(true)} className="rounded-xl bg-secondary px-5 py-2.5 text-sm font-bold uppercase text-on-secondary hover:bg-teal-800">
                    + Add Assignment
                </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
                <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="border-b border-border bg-surface-sunken text-xs uppercase tracking-wide text-text-muted">
                        <tr>
                            <th className="px-5 py-3">Assignment</th>
                            <th className="px-5 py-3">Course</th>
                            <th className="px-5 py-3">Marks</th>
                            <th className="px-5 py-3">Due</th>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {assignments.map((a) => <AssignmentTableRow key={a.id} assignment={a} />)}
                    </tbody>
                </table>
            </div>

            {assignments.length === 0 && <p className="py-10 text-center text-text-secondary">No assignments yet.</p>}

            {modalOpen && <AddAssignmentModal courses={courses} onClose={() => setModalOpen(false)} />}
        </AdminLayout>
    );
}
