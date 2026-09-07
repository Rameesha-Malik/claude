import { Head, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import QuestionRunner from '@/Components/QuestionRunner';
import StudentLayout from '@/Layouts/StudentLayout';

interface Option { id: number; option_text: string }
interface Question { id: number; question_text: string; image_path: string | null; options: Option[] }
interface PracticeTest {
    id: number; title: string; timer_enabled: boolean; duration_minutes: number | null;
    marks_per_question: string; negative_marking: string;
}
interface Props { practiceTest: PracticeTest; questions: Question[]; quizRules?: string | null }

function formatTime(totalSeconds: number): string {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

export default function TakePracticeTest({ practiceTest, questions, quizRules }: Props) {
    const [answers, setAnswers] = useState<Record<number, number | null>>({});
    const [submitting, setSubmitting] = useState(false);
    const startedAt = useRef(new Date().toISOString());

    const initialSeconds = (practiceTest.duration_minutes ?? 0) * 60;
    const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

    function submit() {
        if (submitting) return;
        setSubmitting(true);
        const payload = {
            answers: questions.map((q) => ({ question_id: q.id, selected_option_id: answers[q.id] ?? null })),
            started_at: startedAt.current,
        };
        router.post(`/portal/practice-tests/${practiceTest.id}/submit`, payload, {
            onError: () => setSubmitting(false),
        });
    }

    useEffect(() => {
        if (!practiceTest.timer_enabled || !practiceTest.duration_minutes) return;
        if (secondsLeft <= 0) {
            submit();
            return;
        }
        const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [secondsLeft, practiceTest.timer_enabled]);

    function selectOption(questionId: number, optionId: number) {
        setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    }

    return (
        <StudentLayout header={practiceTest.title}>
            <Head title={practiceTest.title} />

            {quizRules && (
                <div className="mb-4 rounded-2xl border border-border bg-surface-sunken p-4 text-sm text-text-secondary">
                    <p className="mb-1 text-xs font-bold uppercase tracking-wide text-text-muted">Instructions</p>
                    {quizRules}
                </div>
            )}

            <QuestionRunner
                questions={questions}
                answers={answers}
                onSelect={selectOption}
                onSubmit={submit}
                submitting={submitting}
                submitLabel="Submit Test"
                emptyMessage="No questions are available for this test yet."
                headerExtra={
                    <>
                        <span className="mx-2">·</span>
                        {practiceTest.marks_per_question} mark(s) each
                        {Number(practiceTest.negative_marking) > 0 && <span className="mx-2">· -{practiceTest.negative_marking} for wrong</span>}
                    </>
                }
                timerNode={
                    practiceTest.timer_enabled && practiceTest.duration_minutes ? (
                        <div className={`rounded-full px-4 py-1.5 text-sm font-bold ${secondsLeft <= 60 ? 'bg-danger-bg text-danger' : 'bg-primary-subtle text-primary'}`}>
                            Time left: {formatTime(secondsLeft)}
                        </div>
                    ) : undefined
                }
            />
        </StudentLayout>
    );
}
