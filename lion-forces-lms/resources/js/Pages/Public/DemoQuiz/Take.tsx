import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
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

    const answeredCount = Object.values(answers).filter((v) => v !== null && v !== undefined).length;

    return (
        <PublicLayout>
            <Head title={quiz.title} />

            <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="sticky top-20 z-10 mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm">
                    <div className="text-sm text-text-secondary">
                        <span className="font-bold text-text">{answeredCount}</span> / {questions.length} answered
                    </div>
                    <div className={`rounded-lg px-4 py-1.5 text-sm font-bold ${secondsLeft <= 60 ? 'bg-danger-bg text-danger' : 'bg-primary-subtle text-primary'}`}>
                        Time left: {formatTime(secondsLeft)}
                    </div>
                </div>

                <div className="space-y-5">
                    {questions.map((q, i) => (
                        <div key={q.id} className="rounded-2xl border border-border bg-surface p-5">
                            <p className="mb-3 font-semibold text-text">
                                <span className="mr-2 text-text-muted">Q{i + 1}.</span>
                                {q.question_text}
                            </p>
                            {q.image_path && (
                                <img src={`/storage/${q.image_path}`} alt="" className="mb-3 max-h-64 rounded-lg border border-border" />
                            )}
                            <div className="space-y-2">
                                {q.options.map((opt) => (
                                    <label
                                        key={opt.id}
                                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors ${
                                            answers[q.id] === opt.id ? 'border-primary bg-primary-subtle' : 'border-border hover:border-primary'
                                        }`}
                                    >
                                        <input type="radio" name={`question-${q.id}`} checked={answers[q.id] === opt.id} onChange={() => selectOption(q.id, opt.id)} />
                                        <span className="text-text">{opt.option_text}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={submit}
                        disabled={submitting}
                        className="rounded-lg bg-primary px-8 py-3 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover disabled:opacity-50"
                    >
                        {submitting ? 'Submitting…' : 'Submit Quiz'}
                    </button>
                </div>
            </div>
        </PublicLayout>
    );
}
