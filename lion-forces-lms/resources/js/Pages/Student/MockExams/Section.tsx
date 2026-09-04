import { Head, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import QuestionRunner from '@/Components/QuestionRunner';
import StudentLayout from '@/Layouts/StudentLayout';

interface Option { id: number; option_text: string }
interface Question { id: number; question_text: string; image_path: string | null; options: Option[] }
interface SectionInfo { id: number; name: string; order: number; duration_minutes: number | null; marks_per_question: string; negative_marking: string }
interface SectionNav { id: number; name: string; order: number }
interface Props {
    mockExam: { id: number; title: string; fullscreen_required: boolean; disallow_back_navigation: boolean };
    attemptId: number;
    section: SectionInfo;
    sections: SectionNav[];
    isLastSection: boolean;
    questions: Question[];
}

function formatTime(totalSeconds: number): string {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

export default function MockExamSectionPage({ mockExam, attemptId, section, sections, isLastSection, questions }: Props) {
    const [answers, setAnswers] = useState<Record<number, number | null>>({});
    const [submitting, setSubmitting] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const initialSeconds = (section.duration_minutes ?? 0) * 60;
    const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

    // Inertia reuses this same component instance across section-to-section
    // navigation (same page component, new props) rather than remounting
    // it -- without this, `answers`/`submitting`/`secondsLeft` from the
    // PREVIOUS section would leak into the next one, permanently disabling
    // the submit button (stuck "Saving...") since `submitting` never reset.
    useEffect(() => {
        setAnswers({});
        setSubmitting(false);
        setSecondsLeft(initialSeconds);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [section.id]);

    useEffect(() => {
        if (mockExam.fullscreen_required && containerRef.current && !document.fullscreenElement) {
            containerRef.current.requestFullscreen?.().catch(() => {
                // Some browsers require a user gesture; the exam still works, just not fullscreen.
            });
        }
    }, [mockExam.fullscreen_required]);

    function submit() {
        if (submitting) return;
        setSubmitting(true);
        const payload = {
            answers: questions.map((q) => ({ question_id: q.id, selected_option_id: answers[q.id] ?? null })),
        };
        router.post(`/portal/mock-exams/${mockExam.id}/attempts/${attemptId}/sections/${section.id}/submit`, payload, {
            onError: () => setSubmitting(false),
        });
    }

    useEffect(() => {
        if (!section.duration_minutes) return;
        if (secondsLeft <= 0) {
            submit();
            return;
        }
        const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [secondsLeft, section.duration_minutes]);

    function selectOption(questionId: number, optionId: number) {
        setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    }

    return (
        <StudentLayout header={mockExam.title}>
            <Head title={`${mockExam.title} — ${section.name}`} />

            <div ref={containerRef} className="bg-canvas">
                <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-text-muted">
                    {sections.map((s) => (
                        <span
                            key={s.id}
                            className={`rounded-full px-3 py-1 ${s.id === section.id ? 'bg-primary text-on-primary' : s.order < section.order ? 'bg-success-bg text-success' : 'bg-surface-sunken'}`}
                        >
                            {s.order}. {s.name}
                        </span>
                    ))}
                </div>

                <QuestionRunner
                    resetKey={section.id}
                    questions={questions}
                    answers={answers}
                    onSelect={selectOption}
                    onSubmit={submit}
                    submitting={submitting}
                    submitLabel={isLastSection ? 'Submit Exam' : 'Next Section'}
                    allowBack={!mockExam.disallow_back_navigation}
                    emptyMessage="This section has no questions yet."
                    headerExtra={
                        <>
                            <span className="mx-2">·</span>
                            {section.marks_per_question} mark(s) each
                            {Number(section.negative_marking) > 0 && <span className="mx-2">· -{section.negative_marking} for wrong</span>}
                        </>
                    }
                    timerNode={
                        section.duration_minutes ? (
                            <div className={`rounded-lg px-4 py-1.5 text-sm font-bold ${secondsLeft <= 60 ? 'bg-danger-bg text-danger' : 'bg-primary-subtle text-primary'}`}>
                                Time left: {formatTime(secondsLeft)}
                            </div>
                        ) : undefined
                    }
                />

                {mockExam.disallow_back_navigation && (
                    <p className="mt-4 text-sm text-warning">Once you continue, you won't be able to return to this section.</p>
                )}
            </div>
        </StudentLayout>
    );
}
