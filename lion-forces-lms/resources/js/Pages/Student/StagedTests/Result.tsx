import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import AnswerReviewCard, { WrongAnswersReview } from '@/Components/AnswerReviewCard';
import StudentLayout from '@/Layouts/StudentLayout';

interface Option { id: number; option_text: string; is_correct: boolean }
interface Question { id: number; question_text: string; explanation: string | null; options: Option[] }
interface Answer {
    id: number; question_id: number; selected_option_id: number | null;
    is_correct: boolean | null; marks_awarded: string; question: Question; selected_option: Option | null;
}
interface StageResult { id: number; name: string; score: string; total_marks: string; passed: boolean; completed: boolean; answers: Answer[] }
interface Attempt { id: number; score: string; total_marks: string; percentage: string; passed: boolean }
interface Props { attempt: Attempt; testTitle: string; stages: StageResult[] }

export default function StagedTestResult({ attempt, testTitle, stages }: Props) {
    const firstOpenable = stages.find((s) => s.completed)?.id ?? null;
    const [openStage, setOpenStage] = useState<number | null>(firstOpenable);
    const stoppedAt = stages.find((s) => s.completed && !s.passed);

    return (
        <StudentLayout header={`Result — ${testTitle}`}>
            <Head title={`Result — ${testTitle}`} />

            <div className={`mb-6 rounded-2xl border p-6 ${attempt.passed ? 'border-success bg-success-bg' : 'border-danger bg-danger-bg'}`}>
                <p className={`text-sm font-bold uppercase tracking-wide ${attempt.passed ? 'text-success' : 'text-danger'}`}>
                    {attempt.passed ? 'All Stages Passed' : 'Did Not Clear All Stages'}
                </p>
                <p className="mt-1 font-display text-4xl text-text">{attempt.percentage}%</p>
                <p className="mt-1 text-sm text-text-secondary">Overall Score: {attempt.score} / {attempt.total_marks}</p>
                {stoppedAt && (
                    <p className="mt-2 text-sm font-semibold text-danger">Stopped at "{stoppedAt.name}" — its pass threshold wasn't met.</p>
                )}
                <Link href="/portal/my-courses" className="mt-4 inline-block rounded-lg border border-border px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-text hover:border-primary">
                    Back to My Courses
                </Link>
            </div>

            <WrongAnswersReview answers={stages.flatMap((s) => s.answers)} />

            <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {stages.map((s) => {
                    const pct = Number(s.total_marks) > 0 ? Math.round((Math.max(Number(s.score), 0) / Number(s.total_marks)) * 100) : 0;
                    return (
                        <button
                            key={s.id}
                            onClick={() => s.completed && setOpenStage(openStage === s.id ? null : s.id)}
                            disabled={!s.completed}
                            className={`rounded-xl border p-4 text-left transition-colors disabled:opacity-40 ${
                                openStage === s.id ? 'border-primary bg-primary-subtle' : 'border-border bg-surface hover:border-primary'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <p className="font-semibold text-text">{s.name}</p>
                                {s.completed && (
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${s.passed ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger'}`}>
                                        {s.passed ? 'Passed' : 'Failed'}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-text-secondary">{s.completed ? `${s.score} / ${s.total_marks} · ${pct}%` : 'Not reached'}</p>
                        </button>
                    );
                })}
            </div>

            {stages.filter((s) => s.id === openStage).map((s) => (
                <div key={s.id} className="space-y-5">
                    <h3 className="font-bold text-text">{s.name} — Question Review</h3>
                    {s.answers.map((a, i) => (
                        <AnswerReviewCard key={a.id} a={a} index={i} />
                    ))}
                    {s.answers.length === 0 && <p className="text-sm text-text-secondary">No questions in this stage.</p>}
                </div>
            ))}
        </StudentLayout>
    );
}
