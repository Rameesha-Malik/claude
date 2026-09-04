import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import QuestionRunner from '@/Components/QuestionRunner';
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

            <QuestionRunner
                resetKey={stage.id}
                questions={questions}
                answers={answers}
                onSelect={selectOption}
                onSubmit={submit}
                submitting={submitting}
                submitLabel={isLastStage ? 'Submit Final Stage' : 'Submit Stage'}
                emptyMessage="This stage has no questions yet."
                headerExtra={
                    <>
                        <span className="mx-2">·</span>
                        Pass at <span className="font-bold text-text">{stage.pass_threshold_percent}%</span>
                        {Number(stage.negative_marking) > 0 && <span className="mx-2">· -{stage.negative_marking} for wrong</span>}
                    </>
                }
                timerNode={
                    stage.duration_minutes ? (
                        <div className={`rounded-lg px-4 py-1.5 text-sm font-bold ${secondsLeft <= 60 ? 'bg-danger-bg text-danger' : 'bg-primary-subtle text-primary'}`}>
                            Time left: {formatTime(secondsLeft)}
                        </div>
                    ) : undefined
                }
            />

            <p className="mt-4 text-sm text-warning">
                You need {stage.pass_threshold_percent}% to pass this stage and continue. Falling short ends the test here.
            </p>
        </StudentLayout>
    );
}
