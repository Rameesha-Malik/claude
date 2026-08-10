import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import StudentLayout from '@/Layouts/StudentLayout';

interface Option { id: number; option_text: string }
interface Question { id: number; question_text: string; image_path: string | null; options: Option[] }
interface StageInfo { id: number; name: string; order: number; duration_minutes: number | null; marks_per_question: string; negative_marking: string; pass_threshold_percent: string }
interface StageNav { id: number; name: string; order: number }
interface Props {
    stagedTest: { id: number; title: string };
    attemptId: number;
    stage: StageInfo;
    stages: StageNav[];
    isLastStage: boolean;
    questions: Question[];
}

function formatTime(totalSeconds: number): string {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

export default function StagedTestStagePage({ stagedTest, attemptId, stage, stages, isLastStage, questions }: Props) {
    const [answers, setAnswers] = useState<Record<number, number | null>>({});
    const [submitting, setSubmitting] = useState(false);

    const initialSeconds = (stage.duration_minutes ?? 0) * 60;
    const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

    // Same fix as Mock Exam's Section.tsx: Inertia reuses this component
    // instance across stage-to-stage navigation instead of remounting it,
    // so state from the previous stage (including a stuck `submitting`
    // flag that permanently disables the submit button) must be reset
    // explicitly whenever the stage identity changes.
    useEffect(() => {
        setAnswers({});
        setSubmitting(false);
        setSecondsLeft(initialSeconds);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stage.id]);

    function submit() {
        if (submitting) return;
        setSubmitting(true);
        const payload = {
            answers: questions.map((q) => ({ question_id: q.id, selected_option_id: answers[q.id] ?? null })),
        };
        router.post(`/portal/staged-tests/${stagedTest.id}/attempts/${attemptId}/stages/${stage.id}/submit`, payload, {
            onError: () => setSubmitting(false),
        });
    }

    useEffect(() => {
        if (!stage.duration_minutes) return;
        if (secondsLeft <= 0) {
            submit();
            return;
        }
        const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [secondsLeft, stage.duration_minutes]);

    function selectOption(questionId: number, optionId: number) {
        setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    }

    const answeredCount = Object.values(answers).filter((v) => v !== null && v !== undefined).length;

    return (
        <StudentLayout header={stagedTest.title}>
            <Head title={`${stagedTest.title} — ${stage.name}`} />

            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-text-muted">
                {stages.map((s) => (
                    <span
                        key={s.id}
                        className={`rounded-full px-3 py-1 ${s.id === stage.id ? 'bg-primary text-on-primary' : s.order < stage.order ? 'bg-success-bg text-success' : 'bg-surface-sunken'}`}
                    >
                        {s.order}. {s.name}
                    </span>
                ))}
            </div>

            <div className="sticky top-0 z-10 mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm">
                <div className="text-sm text-text-secondary">
                    <span className="font-bold text-text">{answeredCount}</span> / {questions.length} answered
                    <span className="mx-2">·</span>
                    Pass at <span className="font-bold text-text">{stage.pass_threshold_percent}%</span>
                    {Number(stage.negative_marking) > 0 && <span className="mx-2">· -{stage.negative_marking} for wrong</span>}
                </div>
                {stage.duration_minutes && (
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
                                    <input type="radio" name={`question-${q.id}`} checked={answers[q.id] === opt.id} onChange={() => selectOption(q.id, opt.id)} />
                                    <span className="text-text">{opt.option_text}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
                {questions.length === 0 && (
                    <p className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                        This stage has no questions yet.
                    </p>
                )}
            </div>

            <p className="mt-4 text-sm text-warning">
                You need {stage.pass_threshold_percent}% to pass this stage and continue. Falling short ends the test here.
            </p>

            <div className="mt-6 flex justify-end">
                <button
                    onClick={submit}
                    disabled={submitting}
                    className="rounded-lg bg-primary px-8 py-3 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover disabled:opacity-50"
                >
                    {submitting ? 'Saving…' : isLastStage ? 'Submit Final Stage' : 'Submit Stage'}
                </button>
            </div>
        </StudentLayout>
    );
}
