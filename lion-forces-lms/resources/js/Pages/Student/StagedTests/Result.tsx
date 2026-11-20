import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AnswerReviewRunner from '@/Components/AnswerReviewRunner';
import LiquidButton from '@/Components/LiquidButton';
import StatusDot from '@/Components/StatusDot';
import StudentLayout from '@/Layouts/StudentLayout';
import { trimDecimal } from '@/lib/format';

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
        <StudentLayout header={`Result: ${testTitle}`}>
            <Head title={`Result: ${testTitle}`} />

            <div className={`mb-6 rounded-[1.5rem] border p-6 ${attempt.passed ? 'border-success bg-success-bg' : 'border-danger bg-danger-bg'}`}>
                <p className={`text-sm font-bold uppercase tracking-wide ${attempt.passed ? 'text-success' : 'text-danger'}`}>
                    {attempt.passed ? 'All Stages Passed' : 'Did Not Clear All Stages'}
                </p>
                <p className="mt-1 font-display text-4xl text-text">{trimDecimal(attempt.percentage)}%</p>
                <p className="mt-1 text-sm text-text-secondary">Overall Score: {trimDecimal(attempt.score)} / {trimDecimal(attempt.total_marks)}</p>
                {stoppedAt && (
                    <p className="mt-2 text-sm font-semibold text-danger">Stopped at "{stoppedAt.name}": its pass threshold wasn't met.</p>
                )}
                <LiquidButton href="/portal/my-courses" tone="light" className="mt-4 px-5 py-2.5 text-sm uppercase tracking-wide">
                    Back to My Courses
                </LiquidButton>
            </div>

            <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {stages.map((s) => {
                    const pct = Number(s.total_marks) > 0 ? Math.round((Math.max(Number(s.score), 0) / Number(s.total_marks)) * 100) : 0;
                    return (
                        <LiquidButton
                            key={s.id}
                            type="button"
                            tone="light"
                            shape="tile"
                            onClick={() => s.completed && setOpenStage(openStage === s.id ? null : s.id)}
                            disabled={!s.completed}
                            className={`p-4 ${openStage === s.id ? 'ring-2 ring-primary' : ''}`}
                        >
                            <div className="flex items-center justify-between">
                                <p className="font-semibold">{s.name}</p>
                                {s.completed && (
                                    <StatusDot label={s.passed ? 'Passed' : 'Failed'} tone={s.passed ? 'positive' : 'negative'} />
                                )}
                            </div>
                            <p className="text-sm opacity-80">{s.completed ? `${s.score} / ${s.total_marks} · ${pct}%` : 'Not reached'}</p>
                        </LiquidButton>
                    );
                })}
            </div>

            {stages.filter((s) => s.id === openStage).map((s) => (
                <div key={s.id}>
                    <h3 className="mb-4 font-bold text-text">{s.name}: Question Review</h3>
                    {s.answers.length > 0 ? (
                        <AnswerReviewRunner answers={s.answers} resetKey={s.id} />
                    ) : (
                        <p className="text-sm text-text-secondary">No questions in this stage.</p>
                    )}
                </div>
            ))}
        </StudentLayout>
    );
}
