import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Quiz {
    id: number; title: string; is_active: boolean; duration_minutes: number;
    questions_count: number; attempts_count: number; subject: { name: string } | null;
}

export default function DemoQuizIndex({ quizzes }: { quizzes: Quiz[] }) {
    return (
        <AdminLayout header="Demo Quizzes">
            <Head title="Demo Quiz" />

            <div className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-border bg-gradient-to-br from-primary-subtle to-surface p-6 sm:p-8">
                <div className="flex gap-4">
                    <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary text-on-primary">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                        </svg>
                    </span>
                    <div>
                        <h1 className="font-display text-3xl text-text">
                            Demo <span className="text-primary">Quizzes</span>
                        </h1>
                        <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Public practice zone</p>
                        <p className="mt-2 max-w-xl text-sm text-text-secondary">
                            Create and manage demo quizzes. Assign a category to show them under category cards on the public Demo Quiz page.
                        </p>
                    </div>
                </div>
                <div className="flex flex-shrink-0 flex-wrap gap-2">
                    <Link href="/admin/demo-quiz/page-content" className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-bold text-text hover:border-primary hover:text-primary">
                        Demo Page Content
                    </Link>
                    <Link href="/admin/content-library" className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-bold text-text hover:border-primary hover:text-primary">
                        Categories
                    </Link>
                    <Link href="/admin/demo-quiz/create" className="rounded-xl bg-secondary px-5 py-2.5 text-sm font-bold uppercase text-on-secondary hover:bg-teal-800">
                        + Add Demo Quiz
                    </Link>
                </div>
            </div>

            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-text-muted">All demo quizzes</p>

            {quizzes.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                    No demo quiz set up yet — the homepage link will show "not available" until one is active.
                </div>
            ) : (
                <div className="space-y-3">
                    {quizzes.map((q) => (
                        <div key={q.id} className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-surface p-5">
                            <div className="flex items-center gap-3">
                                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-subtle text-primary">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                                    </svg>
                                </span>
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="font-bold text-text">{q.title}</h3>
                                        {q.subject && (
                                            <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-[0.65rem] font-bold uppercase text-primary">{q.subject.name}</span>
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
