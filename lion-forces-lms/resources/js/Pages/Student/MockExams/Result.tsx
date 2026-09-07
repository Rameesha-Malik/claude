import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import AnswerReviewCard, { WrongAnswersReview } from '@/Components/AnswerReviewCard';
import StudentLayout from '@/Layouts/StudentLayout';

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
        <StudentLayout header={`Result — ${examTitle}`}>
            <Head title={`Result — ${examTitle}`} />

            <div className={`mb-6 rounded-2xl border p-6 ${attempt.passed ? 'border-success bg-success-bg' : 'border-danger bg-danger-bg'}`}>
                <p className={`text-sm font-bold uppercase tracking-wide ${attempt.passed ? 'text-success' : 'text-danger'}`}>
                    {attempt.passed ? 'Passed' : 'Needs Improvement'}
                </p>
                <p className="mt-1 font-display text-4xl text-text">{attempt.percentage}%</p>
                <p className="mt-1 text-sm text-text-secondary">Overall Score: {attempt.score} / {attempt.total_marks}</p>
                <Link href="/portal/my-courses" className="mt-4 inline-block rounded-lg border border-border px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-text hover:border-primary">
                    Back to My Courses
                </Link>
            </div>

            <WrongAnswersReview answers={sections.flatMap((s) => s.answers)} />

            <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {sections.map((s) => {
                    const pct = Number(s.total_marks) > 0 ? Math.round((Math.max(Number(s.score), 0) / Number(s.total_marks)) * 100) : 0;
                    return (
                        <button
                            key={s.id}
                            onClick={() => setOpenSection(openSection === s.id ? null : s.id)}
                            className={`rounded-xl border p-4 text-left transition-colors ${openSection === s.id ? 'border-primary bg-primary-subtle' : 'border-border bg-surface hover:border-primary'}`}
                        >
                            <p className="font-semibold text-text">{s.name}</p>
                            <p className="text-sm text-text-secondary">{s.score} / {s.total_marks} · {pct}%</p>
                        </button>
                    );
                })}
            </div>

            {sections.filter((s) => s.id === openSection).map((s) => (
                <div key={s.id} className="space-y-5">
                    <h3 className="font-bold text-text">{s.name} — Question Review</h3>
                    {s.answers.map((a, i) => (
                        <AnswerReviewCard key={a.id} a={a} index={i} />
                    ))}
                    {s.answers.length === 0 && <p className="text-sm text-text-secondary">No questions in this section.</p>}
                </div>
            ))}
        </StudentLayout>
    );
}
