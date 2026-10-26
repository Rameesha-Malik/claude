import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import QuestionRunner from '@/Components/QuestionRunner';
import StudentLayout from '@/Layouts/StudentLayout';

interface Option { id: number; option_text: string; image_path: string | null }
interface Question { id: number; question_text: string; image_path: string | null; options: Option[] }
interface Config { id: number; question_count: number }
interface Props {
    config: Config; subjectNames: string[]; topicNames: string[]; questions: Question[];
    name: string | null; mode: 'tutor' | 'timed';
    timerEnabled: boolean; timerMode: 'total' | 'per_question' | null;
    timerMinutes: number | null; timerSecondsPerQuestion: number | null;
}

function formatTime(totalSeconds: number): string {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

export default function TakeCustomQuiz({
    config, subjectNames, topicNames, questions, name, mode, timerEnabled, timerMode, timerMinutes, timerSecondsPerQuestion,
}: Props) {
    const [answers, setAnswers] = useState<Record<number, number | null>>({});
    const [submitting, setSubmitting] = useState(false);

    const wholeQuizTimed = timerEnabled && timerMode === 'total' && !!timerMinutes;
    const [secondsLeft, setSecondsLeft] = useState((timerMinutes ?? 0) * 60);

    function submit() {
        if (submitting) return;
        setSubmitting(true);
        router.post(`/portal/custom-quiz/${config.id}/submit`, {
            answers: questions.map((q) => ({ question_id: q.id, selected_option_id: answers[q.id] ?? null })),
        }, { onError: () => setSubmitting(false) });
    }

    // Whole-quiz countdown -- only ever active in "total" timer mode; a
    // "per_question" config runs its own countdown inside QuestionRunner
    // instead (it's the only place that knows which question is current),
    // so this effect does nothing at all in that mode.
    useEffect(() => {
        if (!wholeQuizTimed) return;
        if (secondsLeft <= 0) {
            submit();
            return;
        }
        const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [secondsLeft, wholeQuizTimed]);

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
                    wholeQuizTimed ? (
                        <div className={`rounded-full px-4 py-1.5 text-sm font-bold ${secondsLeft <= 60 ? 'bg-danger-bg text-danger' : 'bg-primary-subtle text-primary'}`}>
                            Time left: {formatTime(secondsLeft)}
                        </div>
                    ) : undefined
                }
                perQuestionSeconds={timerEnabled && timerMode === 'per_question' ? timerSecondsPerQuestion ?? undefined : undefined}
                compact
                instantFeedback={mode !== 'timed'}
            />
        </StudentLayout>
    );
}
