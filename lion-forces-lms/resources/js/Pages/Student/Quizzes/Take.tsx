import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import QuestionRunner from '@/Components/QuestionRunner';
import StudentLayout from '@/Layouts/StudentLayout';

interface Option { id: number; option_text: string }
interface Question { id: number; question_text: string; image_path: string | null; options: Option[] }
interface QuizRecord { id: number; title: string; marks_per_question: string; negative_marking: string }
interface Props { quiz: QuizRecord; questions: Question[] }

export default function TakeQuiz({ quiz, questions }: Props) {
    const [answers, setAnswers] = useState<Record<number, number | null>>({});
    const [submitting, setSubmitting] = useState(false);

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

            <QuestionRunner
                questions={questions}
                answers={answers}
                onSelect={selectOption}
                onSubmit={submit}
                submitting={submitting}
                submitLabel="Submit Quiz"
                emptyMessage="No questions are available for this quiz yet."
                headerExtra={
                    <>
                        <span className="mx-2">·</span>
                        {quiz.marks_per_question} mark(s) each
                        {Number(quiz.negative_marking) > 0 && <span className="mx-2">· -{quiz.negative_marking} for wrong</span>}
                    </>
                }
                timerNode={<span className="rounded-full bg-primary-subtle px-4 py-1.5 text-sm font-bold text-primary">No time limit</span>}
            />
        </StudentLayout>
    );
}
