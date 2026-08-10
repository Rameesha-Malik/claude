import { Head, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
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

    const answeredCount = Object.values(answers).filter((v) => v !== null && v !== undefined).length;

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

                <div className="sticky top-0 z-10 mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm">
                    <div className="text-sm text-text-secondary">
                        <span className="font-bold text-text">{answeredCount}</span> / {questions.length} answered
                        <span className="mx-2">·</span>
                        {section.marks_per_question} mark(s) each
                        {Number(section.negative_marking) > 0 && <span className="mx-2">· -{section.negative_marking} for wrong</span>}
                    </div>
                    {section.duration_minutes && (
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
                            This section has no questions yet.
                        </p>
                    )}
                </div>

                {mockExam.disallow_back_navigation && (
                    <p className="mt-4 text-sm text-warning">Once you continue, you won't be able to return to this section.</p>
                )}

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={submit}
                        disabled={submitting}
                        className="rounded-lg bg-primary px-8 py-3 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover disabled:opacity-50"
                    >
                        {submitting ? 'Saving…' : isLastSection ? 'Submit Exam' : 'Next Section'}
                    </button>
                </div>
            </div>
        </StudentLayout>
    );
}
