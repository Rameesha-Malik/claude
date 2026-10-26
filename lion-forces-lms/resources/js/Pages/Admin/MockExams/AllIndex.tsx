import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import StatusDot from '@/Components/StatusDot';
import AdminLayout from '@/Layouts/AdminLayout';

interface ExamRow {
    id: number; title: string; is_active: boolean; sections_count: number; total_duration_minutes: number | null;
    course: { id: number; title: string };
}
interface CourseOption { id: number; title: string }
interface Props { exams: ExamRow[]; courses: CourseOption[] }

export default function MockExamsAllIndex({ exams, courses }: Props) {
    const [courseId, setCourseId] = useState<number | ''>('');

    function addNew(e: FormEvent) {
        e.preventDefault();
        if (courseId) router.visit(`/admin/courses/${courseId}/mock-exams/create`);
    }

    return (
        <AdminLayout header="Mock Exams">
            <Head title="Mock Exams" />

            <p className="mb-4 text-sm text-text-secondary">
                Every mock exam across all courses. Pick a course below to create a new one -- its sections are still built on that course&apos;s own page.
            </p>

            <form onSubmit={addNew} className="mb-4 flex flex-wrap items-center gap-2">
                <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value ? Number(e.target.value) : '')}
                    className="rounded-lg border border-border px-3 py-2 text-sm"
                >
                    <option value="">Select a course…</option>
                    {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
                <button type="submit" disabled={!courseId} className="rounded-xl bg-secondary px-5 py-2.5 text-sm font-bold uppercase text-on-secondary hover:bg-teal-800 disabled:opacity-50">
                    + Add Mock Exam
                </button>
            </form>

            <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
                <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="border-b border-border bg-surface-sunken text-xs uppercase tracking-wide text-text-muted">
                        <tr>
                            <th className="px-5 py-3">Exam</th>
                            <th className="px-5 py-3">Course</th>
                            <th className="px-5 py-3">Sections</th>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {exams.map((e) => (
                            <tr key={e.id}>
                                <td className="px-5 py-3 font-medium text-text">{e.title}</td>
                                <td className="px-5 py-3 text-text-secondary">{e.course.title}</td>
                                <td className="px-5 py-3 text-text-secondary">
                                    {e.sections_count} section{e.sections_count === 1 ? '' : 's'}
                                    {e.total_duration_minutes ? ` · ${e.total_duration_minutes} min` : ''}
                                </td>
                                <td className="px-5 py-3">
                                    <StatusDot label={e.is_active ? 'Active' : 'Inactive'} tone={e.is_active ? 'positive' : 'neutral'} />
                                </td>
                                <td className="px-5 py-3 text-right">
                                    <Link href={`/admin/courses/${e.course.id}/mock-exams/${e.id}/edit`} className="mr-3 font-semibold text-primary hover:underline">Edit &rarr;</Link>
                                    <button onClick={() => router.delete(`/admin/courses/${e.course.id}/mock-exams/${e.id}`)} className="text-xs font-bold uppercase text-danger hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {exams.length === 0 && <p className="py-10 text-center text-text-secondary">No mock exams yet.</p>}
        </AdminLayout>
    );
}
