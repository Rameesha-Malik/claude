import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import QuestionRunner from '@/Components/QuestionRunner';
import PublicLayout from '@/Layouts/PublicLayout';

interface Option { id: number; option_text: string }
interface Question { id: number; question_text: string; image_path: string | null; options: Option[] }
interface Quiz { id: number; title: string; duration_minutes: number }
interface Props { quiz: Quiz; attemptId: number; questions: Question[] }

function formatTime(totalSeconds: number): string {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

export default function DemoQuizTake({ quiz, attemptId, questions }: Props) {
    const [answers, setAnswers] = useState<Record<number, number | null>>({});
    const [submitting, setSubmitting] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(quiz.duration_minutes * 60);

    function submit() {
        if (submitting) return;
        setSubmitting(true);
        router.post(`/demo-quiz/${attemptId}/submit`, {
            answers: questions.map((q) => ({ question_id: q.id, selected_option_id: answers[q.id] ?? null })),
        }, { onError: () => setSubmitting(false) });
    }

    useEffect(() => {
        if (secondsLeft <= 0) {
            submit();
            return;
        }
        const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [secondsLeft]);

    function selectOption(questionId: number, optionId: number) {
        setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    }

    return (
        <PublicLayout>
            <Head title={quiz.title} />

            <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
                <QuestionRunner
                    questions={questions}
                    answers={answers}
                    onSelect={selectOption}
                    onSubmit={submit}
                    submitting={submitting}
                    submitLabel="Submit Quiz"
                    emptyMessage="This demo quiz has no questions yet."
                    timerNode={
                        <div className={`rounded-lg px-4 py-1.5 text-sm font-bold ${secondsLeft <= 60 ? 'bg-danger-bg text-danger' : 'bg-primary-subtle text-primary'}`}>
                            Time left: {formatTime(secondsLeft)}
                        </div>
                    }
                />
            </div>
        </PublicLayout>
    );
}
