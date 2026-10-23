import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { BulkUploadResult, QuestionBankBulkUploadForm, QuestionBankBulkUploadResult } from '@/Components/QuestionBankBulkUpload';
import QuestionBankForm from '@/Components/QuestionBankForm';
import AdminLayout from '@/Layouts/AdminLayout';

interface Subject { id: number; name: string }
interface Topic { id: number; subject_id: number; name: string }
interface Section { id: number; title: string }
interface Option { id: number; option_text: string; is_correct: boolean }
interface QuestionRow { id: number; subject_id: number | null; question_text: string; difficulty: string; options: Option[] }
interface QuizRecord {
    id: number; title: string; description: string | null; syllabus: string | null; thumbnail_path: string | null; section_id: number | null;
    question_selection_mode: string; subject_id: number | null; auto_question_count: number | null;
    shuffle_questions: boolean; marks_per_question: string; negative_marking: string;
    is_repeatable: boolean; is_active: boolean; questions: QuestionRow[];
}
interface Props {
    course: { id: number; title: string };
    quiz?: QuizRecord;
    sections: Section[];
    subjects: Subject[];
    topics: Topic[];
    questionBank: QuestionRow[];
    bulkUploadResult: BulkUploadResult | null;
}

const inputClass = 'w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:shadow-glow focus:outline-none';
const labelClass = 'mb-1 block text-sm font-medium text-text';

export default function QuizForm({ course, quiz, sections, subjects, topics, questionBank, bulkUploadResult }: Props) {
    const isEdit = !!quiz;
    const [subjectFilter, setSubjectFilter] = useState<string>('');
    const [showAddQuestion, setShowAddQuestion] = useState(false);
    const [showBulkUpload, setShowBulkUpload] = useState(false);

    const form = useForm({
        title: quiz?.title ?? '',
        description: quiz?.description ?? '',
        syllabus: quiz?.syllabus ?? '',
        thumbnail: null as File | null,
        section_id: quiz?.section_id ?? ('' as number | ''),
        question_selection_mode: quiz?.question_selection_mode ?? 'manual',
        subject_id: quiz?.subject_id ?? '',
        auto_question_count: quiz?.auto_question_count ?? '',
        shuffle_questions: quiz?.shuffle_questions ?? true,
        marks_per_question: quiz?.marks_per_question ?? '1',
        negative_marking: quiz?.negative_marking ?? '0',
        is_repeatable: quiz?.is_repeatable ?? true,
        is_active: quiz?.is_active ?? true,
        question_ids: quiz?.questions?.map((q) => q.id) ?? [] as number[],
    });

    function toggleQuestion(id: number) {
        const ids = form.data.question_ids.includes(id)
            ? form.data.question_ids.filter((q) => q !== id)
            : [...form.data.question_ids, id];
        form.setData('question_ids', ids);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (isEdit) form.put(`/admin/courses/${course.id}/quizzes/${quiz!.id}`);
        else form.post(`/admin/courses/${course.id}/quizzes`);
    }

    const filteredBank = subjectFilter ? questionBank.filter((q) => String(q.subject_id) === subjectFilter) : questionBank;

    return (
        <AdminLayout header={isEdit ? 'Edit Quiz' : 'New Quiz'}>
            <Head title="Quiz" />

            <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-4 rounded-2xl border border-border bg-surface p-6 lg:col-span-1">
                    <div>
                        <label className={labelClass}>Title</label>
                        <input className={inputClass} value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} />
                    </div>

                    <div>
                        <label className={labelClass}>Intro (optional)</label>
                        <textarea
                            rows={2}
                            className={inputClass}
                            placeholder="Shown to the student before they start the quiz"
                            value={form.data.description}
                            onChange={(e) => form.setData('description', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Syllabus (optional)</label>
                        <textarea
                            rows={2}
                            className={inputClass}
                            placeholder="What this quiz covers"
                            value={form.data.syllabus}
                            onChange={(e) => form.setData('syllabus', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Thumbnail (optional)</label>
                        <div className="flex items-center gap-3">
                            {quiz?.thumbnail_path && (
                                <img src={`/storage/${quiz.thumbnail_path}`} alt="" className="h-12 w-20 rounded-lg border border-border object-cover" />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className={inputClass}
                                onChange={(e) => form.setData('thumbnail', e.target.files?.[0] ?? null)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Topic (optional)</label>
                        {/* Client: "quiz topic - click - quiz" -- lets this quiz
                            also show as a clickable row under a Topic in the
                            student's Course Content sidebar, not just in the
                            Quizzes tab. */}
                        <select className={inputClass} value={form.data.section_id} onChange={(e) => form.setData('section_id', e.target.value ? Number(e.target.value) : '')}>
                            <option value="">Not tied to a topic (Quizzes tab only)</option>
                            {sections.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className={labelClass}>Question Selection</label>
                        <select className={inputClass} value={form.data.question_selection_mode} onChange={(e) => form.setData('question_selection_mode', e.target.value)}>
                            <option value="manual">Manual (pick questions)</option>
                            <option value="auto">Auto (by subject)</option>
                        </select>
                    </div>

                    {form.data.question_selection_mode === 'auto' && (
                        <>
                            <div>
                                <label className={labelClass}>Subject</label>
                                <select className={inputClass} value={form.data.subject_id} onChange={(e) => form.setData('subject_id', e.target.value)}>
                                    <option value="">Select subject</option>
                                    {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Number of Questions</label>
                                <input type="number" className={inputClass} value={form.data.auto_question_count} onChange={(e) => form.setData('auto_question_count', e.target.value)} />
                            </div>
                        </>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass}>Marks / Question</label>
                            <input type="number" step="0.5" className={inputClass} value={form.data.marks_per_question} onChange={(e) => form.setData('marks_per_question', e.target.value)} />
                        </div>
                        <div>
                            <label className={labelClass}>Negative Marking</label>
                            <input type="number" step="0.25" className={inputClass} value={form.data.negative_marking} onChange={(e) => form.setData('negative_marking', e.target.value)} />
                        </div>
                    </div>

                    <label className="flex items-center gap-2 text-sm text-text">
                        <input type="checkbox" checked={form.data.shuffle_questions} onChange={(e) => form.setData('shuffle_questions', e.target.checked)} />
                        Shuffle questions
                    </label>
                    <label className="flex items-center gap-2 text-sm text-text">
                        <input type="checkbox" checked={form.data.is_repeatable} onChange={(e) => form.setData('is_repeatable', e.target.checked)} />
                        Allow retakes
                    </label>
                    <label className="flex items-center gap-2 text-sm text-text">
                        <input type="checkbox" checked={form.data.is_active} onChange={(e) => form.setData('is_active', e.target.checked)} />
                        Active (visible to students)
                    </label>

                    <button type="submit" disabled={form.processing} className="w-full rounded-lg bg-primary py-2.5 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover">
                        {isEdit ? 'Save Changes' : 'Create Quiz'}
                    </button>
                    {Object.values(form.errors).map((m, i) => <div key={i} className="text-sm text-danger">{String(m)}</div>)}
                </div>

                {form.data.question_selection_mode === 'manual' && (
                    <div className="rounded-2xl border border-border bg-surface p-6 lg:col-span-2">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <h3 className="font-bold text-text">Select Questions ({form.data.question_ids.length} selected)</h3>
                            <div className="flex flex-wrap items-center gap-2">
                                <select className={inputClass} style={{ width: 200 }} value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
                                    <option value="">All subjects</option>
                                    {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setShowBulkUpload((v) => !v)}
                                    className="rounded-lg border border-border px-3 py-2 text-xs font-bold uppercase tracking-wide text-text hover:border-primary"
                                >
                                    {showBulkUpload ? 'Cancel' : 'Bulk Upload (CSV)'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddQuestion((v) => !v)}
                                    className="rounded-lg border border-primary px-3 py-2 text-xs font-bold uppercase tracking-wide text-primary hover:bg-primary-subtle"
                                >
                                    {showAddQuestion ? 'Cancel' : '+ Add New MCQ'}
                                </button>
                            </div>
                        </div>

                        {/* Both post straight to the Question Bank (Content Library's
                            endpoints) and redirect back to this exact quiz-builder URL,
                            so the newly added question shows up in the list below without
                            losing whatever else was already typed into this form. */}
                        {showBulkUpload && <QuestionBankBulkUploadForm onDone={() => setShowBulkUpload(false)} />}
                        {bulkUploadResult && <QuestionBankBulkUploadResult result={bulkUploadResult} />}
                        {showAddQuestion && <QuestionBankForm subjects={subjects} topics={topics} onDone={() => setShowAddQuestion(false)} />}

                        <div className="max-h-[600px] space-y-2 overflow-y-auto">
                            {filteredBank.map((q) => (
                                <label key={q.id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 hover:border-primary">
                                    <input type="checkbox" className="mt-1" checked={form.data.question_ids.includes(q.id)} onChange={() => toggleQuestion(q.id)} />
                                    <div>
                                        <p className="text-sm text-text">{q.question_text}</p>
                                        <p className="mt-1 text-xs uppercase text-text-muted">{q.difficulty}</p>
                                    </div>
                                </label>
                            ))}
                            {filteredBank.length === 0 && <p className="text-sm text-text-secondary">No questions in the bank yet. Add some in Content Library.</p>}
                        </div>
                    </div>
                )}
            </form>
        </AdminLayout>
    );
}
