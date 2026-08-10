import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Quiz { id: number; title: string; is_active: boolean; duration_minutes: number; questions_count: number; attempts_count: number }

export default function DemoQuizIndex({ quizzes }: { quizzes: Quiz[] }) {
    return (
        <AdminLayout header="Demo Quiz">
            <Head title="Demo Quiz" />

            <p className="mb-4 text-sm text-text-secondary">
                The public, no-login trial quiz linked from the homepage ("Try Free Demo Quiz"). Only the most recently created active quiz is shown to visitors.
            </p>

            <div className="mb-4 flex justify-end">
                <Link href="/admin/demo-quiz/create" className="rounded-lg bg-primary px-4 py-2 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover">
                    + Add Demo Quiz
                </Link>
            </div>

            <div className="space-y-3">
                {quizzes.map((q) => (
                    <div key={q.id} className="flex items-center justify-between rounded-2xl border border-border bg-surface p-5">
                        <div>
                            <h3 className="font-semibold text-text">{q.title}</h3>
                            <p className="text-sm text-text-secondary">
                                {q.questions_count} questions · {q.duration_minutes} min · {q.attempts_count} attempt{q.attempts_count === 1 ? '' : 's'} so far
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${q.is_active ? 'bg-success-bg text-success' : 'bg-surface-sunken text-text-muted'}`}>
                                {q.is_active ? 'Active' : 'Inactive'}
                            </span>
                            <Link href={`/admin/demo-quiz/${q.id}/edit`} className="font-semibold text-primary hover:underline">Edit &rarr;</Link>
                            <button onClick={() => router.delete(`/admin/demo-quiz/${q.id}`)} className="text-xs font-bold uppercase text-danger hover:underline">Delete</button>
                        </div>
                    </div>
                ))}
                {quizzes.length === 0 && <p className="text-sm text-text-secondary">No demo quiz set up yet — the homepage link will show "not available" until one is active.</p>}
            </div>
        </AdminLayout>
    );
}
