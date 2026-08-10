import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Subject { id: number; name: string }
interface QuestionRow { id: number; subject_id: number | null; question_text: string; difficulty: string }
interface StageQuestion { id: number }
interface Stage {
    id: number; name: string; order: number; duration_minutes: number | null;
    pass_threshold_percent: string; marks_per_question: string; negative_marking: string; questions: StageQuestion[];
}
interface StagedTest {
    id: number; title: string; target_exam_name: string | null; is_active: boolean; stages: Stage[];
}
interface Props {
    course: { id: number; title: string };
    stagedTest?: StagedTest;
    subjects: Subject[];
    questionBank: QuestionRow[];
}

const inputClass = 'w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:shadow-glow focus:outline-none';
const labelClass = 'mb-1 block text-sm font-medium text-text';
const btnClass = 'rounded-lg bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover disabled:opacity-50';

export default function StagedTestForm({ course, stagedTest, subjects, questionBank }: Props) {
    const isEdit = !!stagedTest;
    const form = useForm({
        title: stagedTest?.title ?? '',
        target_exam_name: stagedTest?.target_exam_name ?? '',
        is_active: stagedTest?.is_active ?? true,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (isEdit) form.put(`/admin/courses/${course.id}/staged-tests/${stagedTest!.id}`);
        else form.post(`/admin/courses/${course.id}/staged-tests`);
    }

    return (
        <AdminLayout header={isEdit ? `Edit Staged Test — ${stagedTest!.title}` : 'New Staged Test'}>
            <Head title="Staged Test" />

            <div className="grid gap-6 lg:grid-cols-3">
                <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-surface p-6 lg:col-span-1">
                    <div>
                        <label className={labelClass}>Title</label>
                        <input className={inputClass} value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>Target Exam (ISSB, PMA, ...)</label>
                        <input className={inputClass} value={form.data.target_exam_name} onChange={(e) => form.setData('target_exam_name', e.target.value)} />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-text">
                        <input type="checkbox" checked={form.data.is_active} onChange={(e) => form.setData('is_active', e.target.checked)} />
                        Active (visible to students)
                    </label>
                    <button type="submit" disabled={form.processing} className={btnClass + ' w-full'}>
                        {isEdit ? 'Save Changes' : 'Create Staged Test — Then Add Stages'}
                    </button>
                    {Object.values(form.errors).map((m, i) => <div key={i} className="text-sm text-danger">{String(m)}</div>)}
                </form>

                {isEdit && (
                    <div className="lg:col-span-2">
                        <StagesPanel course={course} stagedTest={stagedTest!} subjects={subjects} questionBank={questionBank} />
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

function StagesPanel({ course, stagedTest, subjects, questionBank }: { course: { id: number }; stagedTest: StagedTest; subjects: Subject[]; questionBank: QuestionRow[] }) {
    const [adding, setAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-text">Stages ({stagedTest.stages.length})</h3>
                {!adding && (
                    <button onClick={() => setAdding(true)} className="rounded-lg border border-primary px-4 py-1.5 text-sm font-bold uppercase text-primary hover:bg-primary-subtle">
                        + Add Stage
                    </button>
                )}
            </div>

            <p className="text-sm text-text-secondary">
                Stages run in order. A student must clear a stage's pass threshold to unlock the next one — failing a stage ends the attempt there.
            </p>

            {stagedTest.stages.sort((a, b) => a.order - b.order).map((stage) =>
                editingId === stage.id ? (
                    <StageForm
                        key={stage.id}
                        course={course}
                        stagedTest={stagedTest}
                        stage={stage}
                        subjects={subjects}
                        questionBank={questionBank}
                        onDone={() => setEditingId(null)}
                    />
                ) : (
                    <div key={stage.id} className="rounded-2xl border border-border bg-surface p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-text">{stage.order}. {stage.name}</h4>
                                <p className="text-sm text-text-secondary">
                                    {stage.questions.length} question{stage.questions.length === 1 ? '' : 's'}
                                    {stage.duration_minutes ? ` · ${stage.duration_minutes} min` : ' · No time limit'}
                                    {' · '}Pass at {stage.pass_threshold_percent}%
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setEditingId(stage.id)} className="text-sm font-semibold text-primary hover:underline">Edit</button>
                                <button
                                    onClick={() => {
                                        if (confirm('Delete this stage?')) {
                                            router.delete(`/admin/courses/${course.id}/staged-tests/${stagedTest.id}/stages/${stage.id}`);
                                        }
                                    }}
                                    className="text-xs font-bold uppercase text-danger hover:underline"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ),
            )}

            {adding && (
                <StageForm course={course} stagedTest={stagedTest} subjects={subjects} questionBank={questionBank} onDone={() => setAdding(false)} />
            )}

            {stagedTest.stages.length === 0 && !adding && (
                <p className="rounded-2xl border border-dashed border-border bg-surface p-6 text-center text-sm text-text-secondary">
                    Add at least one stage (e.g. "Stage 1: Verbal IQ") before students can take this test.
                </p>
            )}
        </div>
    );
}

function StageForm({
    course, stagedTest, stage, subjects, questionBank, onDone,
}: {
    course: { id: number }; stagedTest: StagedTest; stage?: Stage; subjects: Subject[]; questionBank: QuestionRow[]; onDone: () => void;
}) {
    const isEdit = !!stage;
    const [subjectFilter, setSubjectFilter] = useState('');
    const form = useForm({
        name: stage?.name ?? '',
        duration_minutes: stage?.duration_minutes ?? '',
        pass_threshold_percent: stage?.pass_threshold_percent ?? '50',
        marks_per_question: stage?.marks_per_question ?? '1',
        negative_marking: stage?.negative_marking ?? '0',
        question_ids: stage?.questions?.map((q) => q.id) ?? [] as number[],
    });

    function toggle(id: number) {
        const ids = form.data.question_ids.includes(id)
            ? form.data.question_ids.filter((q) => q !== id)
            : [...form.data.question_ids, id];
        form.setData('question_ids', ids);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        const opts = { onSuccess: onDone };
        if (isEdit) form.put(`/admin/courses/${course.id}/staged-tests/${stagedTest.id}/stages/${stage!.id}`, opts);
        else form.post(`/admin/courses/${course.id}/staged-tests/${stagedTest.id}/stages`, opts);
    }

    const filteredBank = subjectFilter ? questionBank.filter((q) => String(q.subject_id) === subjectFilter) : questionBank;

    return (
        <form onSubmit={submit} className="space-y-3 rounded-2xl border border-primary bg-surface p-5">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={labelClass}>Stage Name</label>
                    <input className={inputClass} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="e.g. Stage 1: Verbal IQ" />
                </div>
                <div>
                    <label className={labelClass}>Duration (minutes)</label>
                    <input type="number" className={inputClass} value={form.data.duration_minutes} onChange={(e) => form.setData('duration_minutes', e.target.value)} />
                </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className={labelClass}>Pass Threshold (%)</label>
                    <input type="number" step="1" min="0" max="100" className={inputClass} value={form.data.pass_threshold_percent} onChange={(e) => form.setData('pass_threshold_percent', e.target.value)} />
                </div>
                <div>
                    <label className={labelClass}>Marks / Question</label>
                    <input type="number" step="0.5" className={inputClass} value={form.data.marks_per_question} onChange={(e) => form.setData('marks_per_question', e.target.value)} />
                </div>
                <div>
                    <label className={labelClass}>Negative Marking</label>
                    <input type="number" step="0.25" className={inputClass} value={form.data.negative_marking} onChange={(e) => form.setData('negative_marking', e.target.value)} />
                </div>
            </div>

            <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-bold text-text">Questions ({form.data.question_ids.length} selected)</h4>
                <select className={inputClass} style={{ width: 200 }} value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
                    <option value="">All subjects</option>
                    {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>
            <div className="max-h-80 space-y-2 overflow-y-auto rounded-lg border border-border p-2">
                {filteredBank.map((q) => (
                    <label key={q.id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-2 hover:border-primary">
                        <input type="checkbox" className="mt-1" checked={form.data.question_ids.includes(q.id)} onChange={() => toggle(q.id)} />
                        <div>
                            <p className="text-sm text-text">{q.question_text}</p>
                            <p className="text-xs uppercase text-text-muted">{q.difficulty}</p>
                        </div>
                    </label>
                ))}
                {filteredBank.length === 0 && <p className="text-sm text-text-secondary">No questions in the bank yet.</p>}
            </div>

            <div className="flex gap-3">
                <button type="submit" disabled={form.processing} className={btnClass}>{isEdit ? 'Save Stage' : 'Add Stage'}</button>
                <button type="button" onClick={onDone} className="rounded-lg border border-border px-5 py-2.5 text-sm font-bold uppercase text-text hover:border-primary">Cancel</button>
            </div>
            {Object.values(form.errors).map((m, i) => <div key={i} className="text-sm text-danger">{String(m)}</div>)}
        </form>
    );
}
