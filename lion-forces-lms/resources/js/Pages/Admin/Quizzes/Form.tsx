import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Subject { id: number; name: string }
interface Option { id: number; option_text: string; is_correct: boolean }
interface QuestionRow { id: number; subject_id: number | null; question_text: string; difficulty: string; options: Option[] }
interface QuizRecord {
    id: number; title: string;
    question_selection_mode: string; subject_id: number | null; auto_question_count: number | null;
    shuffle_questions: boolean; marks_per_question: string; negative_marking: string;
    is_repeatable: boolean; is_active: boolean; questions: QuestionRow[];
}
interface Props {
    course: { id: number; title: string };
    quiz?: QuizRecord;
    subjects: Subject[];
    questionBank: QuestionRow[];
}

const inputClass = 'w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:shadow-glow focus:outline-none';
const labelClass = 'mb-1 block text-sm font-medium text-text';

export default function QuizForm({ course, quiz, subjects, questionBank }: Props) {
    const isEdit = !!quiz;
    const [subjectFilter, setSubjectFilter] = useState<string>('');

    const form = useForm({
        title: quiz?.title ?? '',
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
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="font-bold text-text">Select Questions ({form.data.question_ids.length} selected)</h3>
                            <select className={inputClass} style={{ width: 200 }} value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
                                <option value="">All subjects</option>
                                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
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
                            {filteredBank.length === 0 && <p className="text-sm text-text-secondary">No questions in the bank yet — add some in Content Library.</p>}
                        </div>
                    </div>
                )}
            </form>
        </AdminLayout>
    );
}
