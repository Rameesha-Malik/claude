import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import StudentLayout from '@/Layouts/StudentLayout';

interface Option { id: number; option_text: string }
interface Question { id: number; question_text: string; image_path: string | null; options: Option[] }
interface QuizRecord { id: number; title: string; marks_per_question: string; negative_marking: string }
interface Props { quiz: QuizRecord; questions: Question[] }

export default function TakeQuiz({ quiz, questions }: Props) {
    const [answers, setAnswers] = useState<Record<number, number | null>>({});
    const [submitting, setSubmitting] = useState(false);

    const answeredCount = useMemo(() => Object.values(answers).filter((v) => v !== null && v !== undefined).length, [answers]);

    function submit() {
        if (submitting) return;
        setSubmitting(true);
        router.post(`/portal/quizzes/${quiz.id}/submit`, {
            answers: questions.map((q) => ({ question_id: q.id, selected_option_id: answers[q.id] ?? null })),
        }, { onError: () => setSubmitting(false) });
    }

    function selectOption(questionId: number, optionId: number) {
        setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    }

    return (
        <StudentLayout header={quiz.title}>
            <Head title={quiz.title} />

            <div className="sticky top-0 z-10 mb-6 rounded-3xl border border-border bg-surface p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm text-text-secondary">
                        <span className="font-bold text-text">{answeredCount}</span> / {questions.length} answered
                        <span className="mx-2">·</span>
                        {quiz.marks_per_question} mark(s) each
                        {Number(quiz.negative_marking) > 0 && <span className="mx-2">· -{quiz.negative_marking} for wrong</span>}
                    </div>
                    <span className="rounded-full bg-primary-subtle px-4 py-1.5 text-sm font-bold text-primary">No time limit</span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-sunken">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-secondary to-primary transition-all duration-normal"
                        style={{ width: `${questions.length ? (answeredCount / questions.length) * 100 : 0}%` }}
                    />
                </div>
            </div>

            <div className="space-y-5">
                {questions.map((q, i) => (
                    <div key={q.id} className="rounded-3xl border border-border bg-surface p-5 transition-shadow duration-normal hover:shadow-md">
                        <p className="mb-3 font-semibold text-text">
                            <span className="mr-2 text-text-muted">Q{i + 1}.</span>
                            {q.question_text}
                        </p>
                        {q.image_path && (
                            <img src={`/storage/${q.image_path}`} alt="" className="mb-3 max-h-64 rounded-xl border border-border" />
                        )}
                        <div className="space-y-2">
                            {q.options.map((opt) => (
                                <label
                                    key={opt.id}
                                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 text-sm transition-all duration-fast ${
                                        answers[q.id] === opt.id ? 'border-primary bg-primary-subtle shadow-sm' : 'border-border hover:border-primary hover:bg-surface-sunken'
                                    }`}
                                >
                                    <span
                                        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                                            answers[q.id] === opt.id ? 'border-primary bg-primary' : 'border-border'
                                        }`}
                                    >
                                        {answers[q.id] === opt.id && <span className="h-2 w-2 rounded-full bg-on-primary" />}
                                    </span>
                                    <input
                                        type="radio"
                                        name={`question-${q.id}`}
                                        checked={answers[q.id] === opt.id}
                                        onChange={() => selectOption(q.id, opt.id)}
                                        className="sr-only"
                                    />
                                    <span className="text-text">{opt.option_text}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
                {questions.length === 0 && (
                    <p className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                        No questions are available for this quiz yet.
                    </p>
                )}
            </div>

            <div className="mt-6 flex justify-end">
                <button
                    onClick={submit}
                    disabled={submitting || questions.length === 0}
                    className="rounded-full bg-primary px-8 py-3 text-sm font-bold uppercase tracking-wide text-on-primary shadow-sm transition-all duration-fast hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-md disabled:opacity-50 disabled:hover:translate-y-0"
                >
                    {submitting ? 'Submitting…' : 'Submit Quiz'}
                </button>
            </div>
        </StudentLayout>
    );
}
