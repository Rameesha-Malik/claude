import { Head, Link, router } from '@inertiajs/react';
import StatusDot from '@/Components/StatusDot';
import AdminLayout from '@/Layouts/AdminLayout';

interface Test { id: number; title: string; is_active: boolean; question_selection_mode: string; questions_count: number }

export default function PracticeTestsIndex({ course, tests }: { course: { id: number; title: string }; tests: Test[] }) {
    return (
        <AdminLayout header={`Practice Tests: ${course.title}`}>
            <Head title="Practice Tests" />

            <div className="mb-4 flex justify-end">
                <Link href={`/admin/courses/${course.id}/practice-tests/create`} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover">
                    + Add Practice Test
                </Link>
            </div>

            <div className="space-y-3">
                {tests.map((t) => (
                    <div key={t.id} className="flex items-center justify-between rounded-2xl border border-border bg-surface p-5">
                        <div>
                            <h3 className="font-semibold text-text">{t.title}</h3>
                            <p className="text-sm text-text-secondary">
                                {t.question_selection_mode === 'manual' ? `${t.questions_count} questions (manual)` : 'Auto-selected questions'}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <StatusDot label={t.is_active ? 'Active' : 'Inactive'} tone={t.is_active ? 'positive' : 'neutral'} />
                            <Link href={`/admin/courses/${course.id}/practice-tests/${t.id}/edit`} className="font-semibold text-primary hover:underline">Edit &rarr;</Link>
                            <button onClick={() => router.delete(`/admin/courses/${course.id}/practice-tests/${t.id}`)} className="text-xs font-bold uppercase text-danger hover:underline">Delete</button>
                        </div>
                    </div>
                ))}
                {tests.length === 0 && <p className="text-sm text-text-secondary">No practice tests yet.</p>}
            </div>
        </AdminLayout>
    );
}
