import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Subject { id: number; name: string }
interface QuestionRow { id: number; subject_id: number | null; question_text: string; difficulty: string }
interface DemoQuiz {
    id: number; title: string; subject_id: number | null; duration_minutes: number; shuffle_questions: boolean; is_active: boolean;
    questions: QuestionRow[];
}
interface Props { demoQuiz?: DemoQuiz; subjects: Subject[]; questionBank: QuestionRow[] }

const inputClass = 'w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:shadow-glow focus:outline-none';
const labelClass = 'mb-1 block text-sm font-medium text-text';

export default function DemoQuizForm({ demoQuiz, subjects, questionBank }: Props) {
    const isEdit = !!demoQuiz;
    const [subjectFilter, setSubjectFilter] = useState('');

    const form = useForm({
        title: demoQuiz?.title ?? 'Free Demo Quiz',
        subject_id: demoQuiz?.subject_id ?? ('' as number | ''),
        duration_minutes: demoQuiz?.duration_minutes ?? 15,
        shuffle_questions: demoQuiz?.shuffle_questions ?? true,
        is_active: demoQuiz?.is_active ?? true,
        question_ids: demoQuiz?.questions?.map((q) => q.id) ?? [] as number[],
    });

    function toggleQuestion(id: number) {
        const ids = form.data.question_ids.includes(id)
            ? form.data.question_ids.filter((q) => q !== id)
            : [...form.data.question_ids, id];
        form.setData('question_ids', ids);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (isEdit) form.put(`/admin/demo-quiz/${demoQuiz!.id}`);
        else form.post('/admin/demo-quiz');
    }

    const filteredBank = subjectFilter ? questionBank.filter((q) => String(q.subject_id) === subjectFilter) : questionBank;

    return (
        <AdminLayout header={isEdit ? 'Edit Demo Quiz' : 'New Demo Quiz'}>
            <Head title="Demo Quiz" />

            <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-4 rounded-2xl border border-border bg-surface p-6 lg:col-span-1">
                    <div>
                        <label className={labelClass}>Title</label>
                        <input className={inputClass} value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>Category</label>
                        <select
                            className={inputClass}
                            value={form.data.subject_id}
                            onChange={(e) => form.setData('subject_id', e.target.value ? Number(e.target.value) : '')}
                        >
                            <option value="">No category (not grouped on the public page)</option>
                            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Duration (minutes)</label>
                        <input type="number" className={inputClass} value={form.data.duration_minutes} onChange={(e) => form.setData('duration_minutes', Number(e.target.value))} />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-text">
                        <input type="checkbox" checked={form.data.shuffle_questions} onChange={(e) => form.setData('shuffle_questions', e.target.checked)} />
                        Shuffle questions
                    </label>
                    <label className="flex items-center gap-2 text-sm text-text">
                        <input type="checkbox" checked={form.data.is_active} onChange={(e) => form.setData('is_active', e.target.checked)} />
                        Active (shown to site visitors)
                    </label>
                    <button type="submit" disabled={form.processing} className="w-full rounded-lg bg-primary py-2.5 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover">
                        {isEdit ? 'Save Changes' : 'Create Demo Quiz'}
                    </button>
                    {Object.values(form.errors).map((m, i) => <div key={i} className="text-sm text-danger">{String(m)}</div>)}
                </div>

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
            </form>
        </AdminLayout>
    );
}
