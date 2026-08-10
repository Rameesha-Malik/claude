import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Exam { id: number; title: string; is_active: boolean; sections_count: number; total_duration_minutes: number | null }

export default function MockExamsIndex({ course, exams }: { course: { id: number; title: string }; exams: Exam[] }) {
    return (
        <AdminLayout header={`Mock Exams — ${course.title}`}>
            <Head title="Mock Exams" />

            <div className="mb-4 flex justify-end">
                <Link href={`/admin/courses/${course.id}/mock-exams/create`} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover">
                    + Add Mock Exam
                </Link>
            </div>

            <div className="space-y-3">
                {exams.map((e) => (
                    <div key={e.id} className="flex items-center justify-between rounded-2xl border border-border bg-surface p-5">
                        <div>
                            <h3 className="font-semibold text-text">{e.title}</h3>
                            <p className="text-sm text-text-secondary">
                                {e.sections_count} section{e.sections_count === 1 ? '' : 's'}
                                {e.total_duration_minutes ? ` · ${e.total_duration_minutes} min` : ''}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${e.is_active ? 'bg-success-bg text-success' : 'bg-surface-sunken text-text-muted'}`}>
                                {e.is_active ? 'Active' : 'Inactive'}
                            </span>
                            <Link href={`/admin/courses/${course.id}/mock-exams/${e.id}/edit`} className="font-semibold text-primary hover:underline">Edit &rarr;</Link>
                            <button onClick={() => router.delete(`/admin/courses/${course.id}/mock-exams/${e.id}`)} className="text-xs font-bold uppercase text-danger hover:underline">Delete</button>
                        </div>
                    </div>
                ))}
                {exams.length === 0 && <p className="text-sm text-text-secondary">No mock exams yet.</p>}
            </div>
        </AdminLayout>
    );
}
