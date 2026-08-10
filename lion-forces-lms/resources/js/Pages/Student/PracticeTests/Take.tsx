import { Head, router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import StudentLayout from '@/Layouts/StudentLayout';

interface Option { id: number; option_text: string }
interface Question { id: number; question_text: string; image_path: string | null; options: Option[] }
interface PracticeTest {
    id: number; title: string; timer_enabled: boolean; duration_minutes: number | null;
    marks_per_question: string; negative_marking: string;
}
interface Props { practiceTest: PracticeTest; questions: Question[] }

function formatTime(totalSeconds: number): string {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

export default function TakePracticeTest({ practiceTest, questions }: Props) {
    const [answers, setAnswers] = useState<Record<number, number | null>>({});
    const [submitting, setSubmitting] = useState(false);
    const startedAt = useRef(new Date().toISOString());

    const initialSeconds = (practiceTest.duration_minutes ?? 0) * 60;
    const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

    const answeredCount = useMemo(() => Object.values(answers).filter((v) => v !== null && v !== undefined).length, [answers]);

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

            <div className="sticky top-0 z-10 mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm">
                <div className="text-sm text-text-secondary">
                    <span className="font-bold text-text">{answeredCount}</span> / {questions.length} answered
                    <span className="mx-2">·</span>
                    {practiceTest.marks_per_question} mark(s) each
                    {Number(practiceTest.negative_marking) > 0 && <span className="mx-2">· -{practiceTest.negative_marking} for wrong</span>}
                </div>
                {practiceTest.timer_enabled && practiceTest.duration_minutes && (
                    <div className={`rounded-lg px-4 py-1.5 text-sm font-bold ${secondsLeft <= 60 ? 'bg-danger-bg text-danger' : 'bg-primary-subtle text-primary'}`}>
                        Time left: {formatTime(secondsLeft)}
                    </div>
                )}
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
                                    <input
                                        type="radio"
                                        name={`question-${q.id}`}
                                        checked={answers[q.id] === opt.id}
                                        onChange={() => selectOption(q.id, opt.id)}
                                    />
                                    <span className="text-text">{opt.option_text}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
                {questions.length === 0 && (
                    <p className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                        No questions are available for this test yet.
                    </p>
                )}
            </div>

            <div className="mt-6 flex justify-end">
                <button
                    onClick={submit}
                    disabled={submitting || questions.length === 0}
                    className="rounded-lg bg-primary px-8 py-3 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover disabled:opacity-50"
                >
                    {submitting ? 'Submitting…' : 'Submit Test'}
                </button>
            </div>
        </StudentLayout>
    );
}
