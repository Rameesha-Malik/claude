import { Head } from '@inertiajs/react';
import AnimatedCounter from '@/Components/AnimatedCounter';
import AnswerReviewRunner from '@/Components/AnswerReviewRunner';
import LiquidButton from '@/Components/LiquidButton';
import StudentLayout from '@/Layouts/StudentLayout';
import { trimDecimal } from '@/lib/format';

interface Option { id: number; option_text: string; is_correct: boolean }
interface Question { id: number; question_text: string; explanation: string | null; options: Option[] }
interface Answer {
    id: number; question_id: number; selected_option_id: number | null;
    is_correct: boolean | null; marks_awarded: string; question: Question; selected_option: Option | null;
}
interface Attempt {
    id: number; score: string; total_marks: string; percentage: string; passed: boolean;
    answers: Answer[];
}
interface Props { attempt: Attempt; testTitle: string; isRepeatable: boolean; practiceTestId: number | null }

export default function PracticeTestResult({ attempt, testTitle, isRepeatable, practiceTestId }: Props) {
    const correctCount = attempt.answers.filter((a) => a.is_correct === true).length;
    const wrongCount = attempt.answers.filter((a) => a.is_correct === false).length;
    const skippedCount = attempt.answers.filter((a) => a.is_correct === null).length;

    return (
        <StudentLayout header={`Result: ${testTitle}`}>
            <Head title={`Result: ${testTitle}`} />

            <div className={`mb-6 rounded-[2rem] border p-6 shadow-sm ${attempt.passed ? 'border-success bg-success-bg' : 'border-danger bg-danger-bg'}`}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className={`text-sm font-bold uppercase tracking-wide ${attempt.passed ? 'text-success' : 'text-danger'}`}>
                            {attempt.passed ? 'Passed' : 'Needs Improvement'}
                        </p>
                        <p className="mt-1 font-display text-5xl text-text">
                            <AnimatedCounter value={`${trimDecimal(attempt.percentage)}%`} />
                        </p>
                        <p className="mt-1 text-sm text-text-secondary">
                            Score: {trimDecimal(attempt.score)} / {trimDecimal(attempt.total_marks)}
                        </p>
                    </div>
                    <div className="flex gap-3 text-center text-sm">
                        <LiquidButton tone="success" shape="tile" className="px-4 py-2.5 text-center">
                            <p className="text-xl font-bold">{correctCount}</p>
                            <p className="opacity-80">Correct</p>
                        </LiquidButton>
                        <LiquidButton tone="danger" shape="tile" className="px-4 py-2.5 text-center">
                            <p className="text-xl font-bold">{wrongCount}</p>
                            <p className="opacity-80">Wrong</p>
                        </LiquidButton>
                        <LiquidButton tone="light" shape="tile" className="px-4 py-2.5 text-center">
                            <p className="text-xl font-bold">{skippedCount}</p>
                            <p className="opacity-80">Skipped</p>
                        </LiquidButton>
                    </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                    {isRepeatable && practiceTestId && (
                        <LiquidButton href={`/portal/practice-tests/${practiceTestId}`} className="px-5 py-2.5 text-sm uppercase tracking-wide">
                            Retake Test
                        </LiquidButton>
                    )}
                    <LiquidButton href="/portal/my-courses" tone="light" className="px-5 py-2.5 text-sm uppercase tracking-wide">
                        Back to My Courses
                    </LiquidButton>
                </div>
            </div>

            <h2 className="mb-4 font-display text-xl uppercase tracking-wide text-text">Question Review</h2>
            <AnswerReviewRunner answers={attempt.answers} hideStats />
        </StudentLayout>
    );
}
