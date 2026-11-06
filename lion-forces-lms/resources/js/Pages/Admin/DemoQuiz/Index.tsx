import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import EmptyState from '@/Components/EmptyState';

interface Quiz {
    id: number; title: string; is_active: boolean; duration_minutes: number;
    questions_count: number; attempts_count: number; subject: { name: string } | null; category: { name: string } | null;
}

export default function DemoQuizIndex({ quizzes }: { quizzes: Quiz[] }) {
    return (
        <AdminLayout header="Demo Quizzes">
            <Head title="Demo Quiz" />

            <AdminPageHeader
                eyebrow="Public practice zone"
                title="Demo Quizzes"
                description="Create and manage demo quizzes. Assign a category to show them under category cards on the public Demo Quiz page."
                right={
                    <>
                        <Link href="/admin/demo-quiz/page-content" className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-bold text-text hover:border-primary hover:text-primary">
                            Demo Page Content
                        </Link>
                        <Link href="/admin/categories" className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-bold text-text hover:border-primary hover:text-primary">
                            Categories
                        </Link>
                        <Link href="/admin/demo-quiz/create" className="rounded-xl bg-secondary px-5 py-2.5 text-sm font-bold uppercase text-on-secondary hover:bg-teal-800">
                            + Add Demo Quiz
                        </Link>
                    </>
                }
            />

            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-text-muted">All demo quizzes</p>

            {quizzes.length === 0 ? (
                <EmptyState>No demo quiz set up yet. The homepage link will show "not available" until one is active.</EmptyState>
            ) : (
                <div className="space-y-3">
                    {quizzes.map((q) => (
                        <div key={q.id} className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-surface p-5">
                            <div className="flex items-center gap-3">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="font-bold text-text">{q.title}</h3>
                                        {q.category && (
                                            <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-[0.65rem] font-bold uppercase text-primary">{q.category.name}</span>
                                        )}
                                        {q.subject && (
                                            <span className="rounded-full bg-surface-sunken px-2 py-0.5 text-[0.65rem] font-bold uppercase text-text-secondary">{q.subject.name}</span>
                                        )}
                                        <span className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase ${q.is_active ? 'bg-success-bg text-success' : 'bg-surface-sunken text-text-muted'}`}>
                                            {q.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-text-secondary">
                                        {q.questions_count} questions · {q.duration_minutes} min · {q.attempts_count} attempt{q.attempts_count === 1 ? '' : 's'} so far
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link href={`/admin/demo-quiz/${q.id}/edit`} className="rounded-full border border-border px-4 py-2 text-xs font-bold uppercase text-text hover:border-primary hover:text-primary">
                                    Questions
                                </Link>
                                <Link href={`/admin/demo-quiz/${q.id}/edit`} className="rounded-full border border-border px-4 py-2 text-xs font-bold uppercase text-text hover:border-primary hover:text-primary">
                                    Edit
                                </Link>
                                <button
                                    onClick={() => confirm(`Delete "${q.title}"?`) && router.delete(`/admin/demo-quiz/${q.id}`)}
                                    className="rounded-full border border-danger px-4 py-2 text-xs font-bold uppercase text-danger hover:bg-danger-bg"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}
