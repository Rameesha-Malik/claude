import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AnswerReviewRunner from '@/Components/AnswerReviewRunner';
import LiquidButton from '@/Components/LiquidButton';
import StudentLayout from '@/Layouts/StudentLayout';
import { trimDecimal } from '@/lib/format';

interface Option { id: number; option_text: string; is_correct: boolean }
interface Question { id: number; question_text: string; explanation: string | null; options: Option[] }
interface Answer {
    id: number; question_id: number; selected_option_id: number | null;
    is_correct: boolean | null; marks_awarded: string; question: Question; selected_option: Option | null;
}
interface SectionResult { id: number; name: string; score: string; total_marks: string; answers: Answer[] }
interface Attempt { id: number; score: string; total_marks: string; percentage: string; passed: boolean }
interface Props { attempt: Attempt; examTitle: string; sections: SectionResult[] }

export default function MockExamResult({ attempt, examTitle, sections }: Props) {
    const [openSection, setOpenSection] = useState<number | null>(sections[0]?.id ?? null);

    return (
        <StudentLayout header={`Result: ${examTitle}`}>
            <Head title={`Result: ${examTitle}`} />

            <div className={`mb-6 rounded-[1.5rem] border p-6 ${attempt.passed ? 'border-success bg-success-bg' : 'border-danger bg-danger-bg'}`}>
                <p className={`text-sm font-bold uppercase tracking-wide ${attempt.passed ? 'text-success' : 'text-danger'}`}>
                    {attempt.passed ? 'Passed' : 'Needs Improvement'}
                </p>
                <p className="mt-1 font-display text-4xl text-text">{trimDecimal(attempt.percentage)}%</p>
                <p className="mt-1 text-sm text-text-secondary">Overall Score: {trimDecimal(attempt.score)} / {trimDecimal(attempt.total_marks)}</p>
                <LiquidButton href="/portal/my-courses" tone="light" className="mt-4 px-5 py-2.5 text-sm uppercase tracking-wide">
                    Back to My Courses
                </LiquidButton>
            </div>

            <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {sections.map((s) => {
                    const pct = Number(s.total_marks) > 0 ? Math.round((Math.max(Number(s.score), 0) / Number(s.total_marks)) * 100) : 0;
                    return (
                        <LiquidButton
                            key={s.id}
                            type="button"
                            tone={openSection === s.id ? 'dark' : 'light'}
                            shape="tile"
                            onClick={() => setOpenSection(openSection === s.id ? null : s.id)}
                            className="p-4"
                        >
                            <p className="font-semibold">{s.name}</p>
                            <p className="text-sm opacity-80">{s.score} / {s.total_marks} · {pct}%</p>
                        </LiquidButton>
                    );
                })}
            </div>

            {sections.filter((s) => s.id === openSection).map((s) => (
                <div key={s.id}>
                    <h3 className="mb-4 font-bold text-text">{s.name}: Question Review</h3>
                    {s.answers.length > 0 ? (
                        <AnswerReviewRunner answers={s.answers} resetKey={s.id} />
                    ) : (
                        <p className="text-sm text-text-secondary">No questions in this section.</p>
                    )}
                </div>
            ))}
        </StudentLayout>
    );
}
