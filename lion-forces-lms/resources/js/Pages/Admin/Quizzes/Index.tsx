import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

interface QuizRow { id: number; title: string; is_active: boolean; question_selection_mode: string; questions_count: number }

export default function QuizzesIndex({ course, quizzes }: { course: { id: number; title: string }; quizzes: QuizRow[] }) {
    return (
        <AdminLayout header={`Quizzes — ${course.title}`}>
            <Head title="Quizzes" />

            <div className="mb-4 flex justify-end">
                <Link href={`/admin/courses/${course.id}/quizzes/create`} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover">
                    + Add Quiz
                </Link>
            </div>

            <div className="space-y-3">
                {quizzes.map((q) => (
                    <div key={q.id} className="flex items-center justify-between rounded-2xl border border-border bg-surface p-5">
                        <div>
                            <h3 className="font-semibold text-text">{q.title}</h3>
                            <p className="text-sm text-text-secondary">
                                {q.question_selection_mode === 'manual' ? `${q.questions_count} questions (manual)` : 'Auto-selected questions'}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${q.is_active ? 'bg-success-bg text-success' : 'bg-surface-sunken text-text-muted'}`}>
                                {q.is_active ? 'Active' : 'Inactive'}
                            </span>
                            <Link href={`/admin/courses/${course.id}/quizzes/${q.id}/edit`} className="font-semibold text-primary hover:underline">Edit &rarr;</Link>
                            <button onClick={() => router.delete(`/admin/courses/${course.id}/quizzes/${q.id}`)} className="text-xs font-bold uppercase text-danger hover:underline">Delete</button>
                        </div>
                    </div>
                ))}
                {quizzes.length === 0 && <p className="text-sm text-text-secondary">No quizzes yet.</p>}
            </div>
        </AdminLayout>
    );
}
