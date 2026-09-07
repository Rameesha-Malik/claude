import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import QuestionRunner from '@/Components/QuestionRunner';
import StudentLayout from '@/Layouts/StudentLayout';

interface Option { id: number; option_text: string }
interface Question { id: number; question_text: string; image_path: string | null; options: Option[] }
interface Config { id: number; question_count: number }
interface Props { config: Config; subjectName: string | null; questions: Question[] }

export default function TakeCustomQuiz({ config, subjectName, questions }: Props) {
    const [answers, setAnswers] = useState<Record<number, number | null>>({});
    const [submitting, setSubmitting] = useState(false);

    function submit() {
        if (submitting) return;
        setSubmitting(true);
        router.post(`/portal/custom-quiz/${config.id}/submit`, {
            answers: questions.map((q) => ({ question_id: q.id, selected_option_id: answers[q.id] ?? null })),
        }, { onError: () => setSubmitting(false) });
    }

    function selectOption(questionId: number, optionId: number) {
        setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    }

    const title = subjectName ? `Custom Quiz — ${subjectName}` : 'Custom Quiz';

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
                headerExtra={<>1 mark each · no negative marking</>}
                timerNode={<span className="rounded-full bg-primary-subtle px-4 py-1.5 text-sm font-bold text-primary">No time limit</span>}
            />
        </StudentLayout>
    );
}
