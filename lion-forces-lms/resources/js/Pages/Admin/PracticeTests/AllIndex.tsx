import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import StatusDot from '@/Components/StatusDot';
import AdminLayout from '@/Layouts/AdminLayout';

interface TestRow {
    id: number; title: string; is_active: boolean; question_selection_mode: string; questions_count: number;
    course: { id: number; title: string };
}
interface CourseOption { id: number; title: string }
interface Props { tests: TestRow[]; courses: CourseOption[] }

export default function PracticeTestsAllIndex({ tests, courses }: Props) {
    const [courseId, setCourseId] = useState<number | ''>('');

    function addNew(e: FormEvent) {
        e.preventDefault();
        if (courseId) router.visit(`/admin/courses/${courseId}/practice-tests/create`);
    }

    return (
        <AdminLayout header="Practice Tests">
            <Head title="Practice Tests" />

            <p className="mb-4 text-sm text-text-secondary">
                Every practice test across all courses. Pick a course below to create a new one -- its questions are still built on that course&apos;s own page.
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
                    + Add Practice Test
                </button>
            </form>

            <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
                <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="border-b border-border bg-surface-sunken text-xs uppercase tracking-wide text-text-muted">
                        <tr>
                            <th className="px-5 py-3">Test</th>
                            <th className="px-5 py-3">Course</th>
                            <th className="px-5 py-3">Questions</th>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {tests.map((t) => (
                            <tr key={t.id}>
                                <td className="px-5 py-3 font-medium text-text">{t.title}</td>
                                <td className="px-5 py-3 text-text-secondary">{t.course.title}</td>
                                <td className="px-5 py-3 text-text-secondary">
                                    {t.question_selection_mode === 'manual' ? `${t.questions_count} (manual)` : 'Auto-selected'}
                                </td>
                                <td className="px-5 py-3">
                                    <StatusDot label={t.is_active ? 'Active' : 'Inactive'} tone={t.is_active ? 'positive' : 'neutral'} />
                                </td>
                                <td className="px-5 py-3 text-right">
                                    <Link href={`/admin/courses/${t.course.id}/practice-tests/${t.id}/edit`} className="mr-3 font-semibold text-primary hover:underline">Edit &rarr;</Link>
                                    <button onClick={() => router.delete(`/admin/courses/${t.course.id}/practice-tests/${t.id}`)} className="text-xs font-bold uppercase text-danger hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {tests.length === 0 && <p className="py-10 text-center text-text-secondary">No practice tests yet.</p>}
        </AdminLayout>
    );
}
