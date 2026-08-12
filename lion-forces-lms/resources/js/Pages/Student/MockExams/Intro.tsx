import { Head, router } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';

interface Section { id: number; name: string; order: number; duration_minutes: number | null; questions_count: number }
interface MockExam {
    id: number; title: string; target_exam_name: string | null; total_duration_minutes: number | null;
    attempt_limit: number | null; fullscreen_required: boolean; disallow_back_navigation: boolean; sections: Section[];
}
interface Props {
    mockExam: MockExam; attemptsUsed: number; isAvailable: boolean; canStart: boolean;
    inProgressAttemptId: number | null; resumeSectionId: number | null;
}

export default function MockExamIntro({ mockExam, attemptsUsed, isAvailable, canStart, inProgressAttemptId, resumeSectionId }: Props) {
    const totalMinutes = mockExam.total_duration_minutes ?? mockExam.sections.reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0);
    const totalQuestions = mockExam.sections.reduce((sum, s) => sum + s.questions_count, 0);

    function start() {
        router.post(`/portal/mock-exams/${mockExam.id}/start`);
    }

    function resume() {
        if (inProgressAttemptId && resumeSectionId) {
            router.get(`/portal/mock-exams/${mockExam.id}/attempts/${inProgressAttemptId}/sections/${resumeSectionId}`);
        }
    }

    return (
        <StudentLayout header={mockExam.title}>
            <Head title={mockExam.title} />

            <div className="mx-auto max-w-2xl space-y-6">
                <div className="rounded-2xl border border-border bg-surface p-6">
                    <h2 className="font-display text-2xl text-text">{mockExam.title}</h2>
                    {mockExam.target_exam_name && (
                        <p className="mt-1 text-sm font-bold uppercase tracking-wide text-gold-700">{mockExam.target_exam_name} Pattern</p>
                    )}
                    <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                        <div className="rounded-lg bg-surface-sunken p-3">
                            <p className="text-xl font-bold text-text">{mockExam.sections.length}</p>
                            <p className="text-xs uppercase text-text-muted">Sections</p>
                        </div>
                        <div className="rounded-lg bg-surface-sunken p-3">
                            <p className="text-xl font-bold text-text">{totalQuestions}</p>
                            <p className="text-xs uppercase text-text-muted">Questions</p>
                        </div>
                        <div className="rounded-lg bg-surface-sunken p-3">
                            <p className="text-xl font-bold text-text">{totalMinutes || '—'}</p>
                            <p className="text-xs uppercase text-text-muted">Minutes</p>
                        </div>
                    </div>

                    <div className="mt-5 space-y-2">
                        {mockExam.sections.map((s) => (
                            <div key={s.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-2 text-sm">
                                <span className="text-text">{s.order}. {s.name}</span>
                                <span className="text-text-muted">{s.questions_count} Qs{s.duration_minutes ? ` · ${s.duration_minutes} min` : ''}</span>
                            </div>
                        ))}
                    </div>

                    <ul className="mt-5 list-disc space-y-1 pl-5 text-sm text-text-secondary">
                        {mockExam.fullscreen_required && <li>This exam requires fullscreen mode.</li>}
                        {mockExam.disallow_back_navigation && <li>Once you move past a section, you cannot return to it.</li>}
                        {mockExam.attempt_limit && <li>Attempt limit: {attemptsUsed} / {mockExam.attempt_limit} used.</li>}
                        {!mockExam.attempt_limit && <li>Unlimited attempts.</li>}
                    </ul>

                    {!isAvailable && (
                        <p className="mt-5 rounded-lg bg-warning-bg p-3 text-sm font-semibold text-warning">This mock exam is not currently open.</p>
                    )}

                    <div className="mt-6 flex gap-3">
                        {inProgressAttemptId ? (
                            <button onClick={resume} className="rounded-lg bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover">
                                Resume Exam
                            </button>
                        ) : (
                            <button
                                onClick={start}
                                disabled={!canStart || !isAvailable || mockExam.sections.length === 0}
                                className="rounded-lg bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover disabled:opacity-50"
                            >
                                Start Exam
                            </button>
                        )}
                    </div>
                    {!canStart && !inProgressAttemptId && (
                        <p className="mt-2 text-sm text-danger">You've used all your attempts for this mock exam.</p>
                    )}
                </div>
            </div>
        </StudentLayout>
    );
}
