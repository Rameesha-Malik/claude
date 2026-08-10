import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Test { id: number; title: string; is_active: boolean; stages_count: number }

export default function StagedTestsIndex({ course, tests }: { course: { id: number; title: string }; tests: Test[] }) {
    return (
        <AdminLayout header={`Staged Tests — ${course.title}`}>
            <Head title="Staged Tests" />

            <div className="mb-4 flex justify-end">
                <Link href={`/admin/courses/${course.id}/staged-tests/create`} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover">
                    + Add Staged Test
                </Link>
            </div>

            <div className="space-y-3">
                {tests.map((t) => (
                    <div key={t.id} className="flex items-center justify-between rounded-2xl border border-border bg-surface p-5">
                        <div>
                            <h3 className="font-semibold text-text">{t.title}</h3>
                            <p className="text-sm text-text-secondary">{t.stages_count} stage{t.stages_count === 1 ? '' : 's'}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${t.is_active ? 'bg-success-bg text-success' : 'bg-surface-sunken text-text-muted'}`}>
                                {t.is_active ? 'Active' : 'Inactive'}
                            </span>
                            <Link href={`/admin/courses/${course.id}/staged-tests/${t.id}/edit`} className="font-semibold text-primary hover:underline">Edit &rarr;</Link>
                            <button onClick={() => router.delete(`/admin/courses/${course.id}/staged-tests/${t.id}`)} className="text-xs font-bold uppercase text-danger hover:underline">Delete</button>
                        </div>
                    </div>
                ))}
                {tests.length === 0 && <p className="text-sm text-text-secondary">No staged tests yet.</p>}
            </div>
        </AdminLayout>
    );
}
