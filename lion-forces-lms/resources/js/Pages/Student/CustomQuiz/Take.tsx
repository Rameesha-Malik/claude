import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import QuestionRunner from '@/Components/QuestionRunner';
import StudentLayout from '@/Layouts/StudentLayout';

interface Option { id: number; option_text: string; image_path: string | null }
interface Question { id: number; question_text: string; image_path: string | null; options: Option[] }
interface Config { id: number; question_count: number }
interface Props {
    config: Config; subjectNames: string[]; topicNames: string[]; questions: Question[];
    timeLimitMinutes: number | null; name: string | null; mode: 'tutor' | 'timed'; timerEnabled: boolean;
}

function formatTime(totalSeconds: number): string {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

export default function TakeCustomQuiz({ config, subjectNames, topicNames, questions, timeLimitMinutes, name, mode, timerEnabled }: Props) {
    const [answers, setAnswers] = useState<Record<number, number | null>>({});
    const [submitting, setSubmitting] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState((timeLimitMinutes ?? 0) * 60);

    function submit() {
        if (submitting) return;
        setSubmitting(true);
        router.post(`/portal/custom-quiz/${config.id}/submit`, {
            answers: questions.map((q) => ({ question_id: q.id, selected_option_id: answers[q.id] ?? null })),
        }, { onError: () => setSubmitting(false) });
    }

    // Same pattern as Practice Tests' timed attempts -- 1 minute per
    // question (see CustomQuizController::show()), auto-submits at zero
    // so a student can't just let the clock run out to avoid a score.
    // Only runs at all when the student turned the timer on -- UWorld's
    // own Timer: None vs a duration dropdown, previously forced on for
    // every attempt regardless.
    useEffect(() => {
        if (!timerEnabled || !timeLimitMinutes) return;
        if (secondsLeft <= 0) {
            submit();
            return;
        }
        const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [secondsLeft, timerEnabled]);

    function selectOption(questionId: number, optionId: number) {
        setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    }

    const scope = [subjectNames.join(', '), topicNames.join(', ')].filter(Boolean).join(' / ');
    const title = name ?? (scope ? `Custom Quiz: ${scope}` : 'Custom Quiz');

    return (
        <StudentLayout header={title}>
            <Head title={title} />

            <QuestionRunner
                questions={questions}
                answers={answers}
                onSelect={selectOption}
                onSubmit={submit}
                submitting={submitting}
                submitLabel="Submit Quiz"
                emptyMessage="No questions matched your filters."
                headerExtra={
                    <>
                        1 mark each · no negative marking
                        {mode === 'timed' && <span className="ml-2 font-bold uppercase text-primary">Timed mode -- no feedback until submit</span>}
                    </>
                }
                timerNode={
                    timerEnabled && timeLimitMinutes ? (
                        <div className={`rounded-full px-4 py-1.5 text-sm font-bold ${secondsLeft <= 60 ? 'bg-danger-bg text-danger' : 'bg-primary-subtle text-primary'}`}>
                            Time left: {formatTime(secondsLeft)}
                        </div>
                    ) : undefined
                }
                compact
                instantFeedback={mode !== 'timed'}
            />
        </StudentLayout>
    );
}
