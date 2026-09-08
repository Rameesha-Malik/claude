import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Subject { id: number; name: string }
interface CourseOption { id: number; title: string }
interface QuestionRow { id: number; subject_id: number | null; question_text: string; difficulty: string }
interface StageQuestion { id: number }
interface Stage {
    id: number; name: string; order: number; duration_minutes: number | null; stage_group_id: number | null;
    pass_threshold_percent: string; marks_per_question: string; negative_marking: string; questions: StageQuestion[];
}
interface StageGroup { id: number; name: string | null; pass_threshold_percent: string; order: number }
interface StagedTest {
    id: number; title: string; course_id: number | null; target_exam_name: string | null; is_active: boolean;
    stages: Stage[]; stage_groups: StageGroup[];
}
interface Props {
    stagedTest: StagedTest;
    courses: CourseOption[];
    subjects: Subject[];
    questionBank: QuestionRow[];
}

const inputClass = 'w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:shadow-glow focus:outline-none';
const labelClass = 'mb-1 block text-sm font-medium text-text';
const btnClass = 'rounded-lg bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover disabled:opacity-50';

export default function FullTestConfigEdit({ stagedTest, courses, subjects, questionBank }: Props) {
    const form = useForm({
        title: stagedTest.title,
        course_id: stagedTest.course_id ?? ('' as number | ''),
        target_exam_name: stagedTest.target_exam_name ?? '',
        is_active: stagedTest.is_active,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.put(`/admin/full-test-config/${stagedTest.id}`);
    }

    return (
        <AdminLayout header="Edit Test">
            <Head title={`Edit — ${stagedTest.title}`} />

            <Link href="/admin/full-test-config" className="mb-4 inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary">
                ← Back to tests
            </Link>

            <div className="mb-6 rounded-2xl border border-border bg-surface p-6">
                <h2 className="mb-1 font-bold text-text">Edit test</h2>
                <p className="mb-4 text-sm text-text-secondary">
                    Update test details and stages. Use <strong>Stage groups</strong> below to merge stages: a student
                    attempts each stage in the group in order, then must pass the combined score to proceed.
                </p>
                <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
                    <div className="min-w-[220px] flex-1">
                        <label className={labelClass}>Test name</label>
                        <input className={inputClass} value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} />
                    </div>
                    <div className="min-w-[220px] flex-1">
                        <label className={labelClass}>Course</label>
                        <select className={inputClass} value={form.data.course_id} onChange={(e) => form.setData('course_id', e.target.value ? Number(e.target.value) : '')}>
                            <option value="">None</option>
                            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                    </div>
                    <div className="min-w-[220px] flex-1">
                        <label className={labelClass}>Target Exam (ISSB, PMA, ...)</label>
                        <input className={inputClass} value={form.data.target_exam_name} onChange={(e) => form.setData('target_exam_name', e.target.value)} />
                    </div>
                    <label className="flex items-center gap-2 pb-2.5 text-sm text-text">
                        <input type="checkbox" checked={form.data.is_active} onChange={(e) => form.setData('is_active', e.target.checked)} />
                        Active
                    </label>
                    <button type="submit" disabled={form.processing} className={btnClass}>Save Changes</button>
                </form>
            </div>

            <StagesPanel stagedTest={stagedTest} subjects={subjects} questionBank={questionBank} />

            <MergeStagesPanel stagedTest={stagedTest} />
        </AdminLayout>
    );
}

function StagesPanel({ stagedTest, subjects, questionBank }: { stagedTest: StagedTest; subjects: Subject[]; questionBank: QuestionRow[] }) {
    const [adding, setAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const groupById = Object.fromEntries(stagedTest.stage_groups.map((g) => [g.id, g]));

    return (
        <div className="mb-6 rounded-2xl border border-border bg-surface p-6">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="font-bold text-text">Stages ({stagedTest.stages.length})</h3>
                {!adding && (
                    <button onClick={() => setAdding(true)} className="rounded-lg border border-primary px-4 py-1.5 text-sm font-bold uppercase text-primary hover:bg-primary-subtle">
                        + Add new stage
                    </button>
                )}
            </div>

            <p className="mb-4 text-sm text-text-secondary">
                Stages run in order. An ungrouped stage gates the next one on its own pass threshold, failing ends the
                attempt there. A stage in a group doesn't gate on its own — see Stage groups below.
            </p>

            <div className="space-y-3">
                {stagedTest.stages.sort((a, b) => a.order - b.order).map((stage) =>
                    editingId === stage.id ? (
                        <StageForm
                            key={stage.id}
                            stagedTest={stagedTest}
                            stage={stage}
                            subjects={subjects}
                            questionBank={questionBank}
                            onDone={() => setEditingId(null)}
                        />
                    ) : (
                        <div key={stage.id} className="rounded-2xl border border-border bg-surface-sunken p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-semibold text-text">
                                        {stage.order}. {stage.name}
                                        {stage.stage_group_id && groupById[stage.stage_group_id] && (
                                            <span className="ml-2 rounded-full bg-primary-subtle px-2 py-0.5 text-xs font-bold uppercase text-primary">
                                                Group: {groupById[stage.stage_group_id].name || `#${stage.stage_group_id}`}
                                            </span>
                                        )}
                                    </h4>
                                    <p className="text-sm text-text-secondary">
                                        {stage.questions.length} question{stage.questions.length === 1 ? '' : 's'}
                                        {stage.duration_minutes ? ` · ${stage.duration_minutes} min` : ' · No time limit'}
                                        {!stage.stage_group_id && ` · Pass at ${stage.pass_threshold_percent}%`}
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setEditingId(stage.id)} className="text-sm font-semibold text-primary hover:underline">Edit</button>
                                    <button
                                        onClick={() => confirm('Delete this stage?') && router.delete(`/admin/full-test-config/${stagedTest.id}/stages/${stage.id}`)}
                                        className="text-xs font-bold uppercase text-danger hover:underline"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ),
                )}

                {adding && <StageForm stagedTest={stagedTest} subjects={subjects} questionBank={questionBank} onDone={() => setAdding(false)} />}

                {stagedTest.stages.length === 0 && !adding && (
                    <p className="rounded-2xl border border-dashed border-border bg-surface p-6 text-center text-sm text-text-secondary">
                        No stages. Click <strong>Add new stage</strong> to define progression.
                    </p>
                )}
            </div>
        </div>
    );
}

function StageForm({
    stagedTest, stage, subjects, questionBank, onDone,
}: {
    stagedTest: StagedTest; stage?: Stage; subjects: Subject[]; questionBank: QuestionRow[]; onDone: () => void;
}) {
    const isEdit = !!stage;
    const [subjectFilter, setSubjectFilter] = useState('');
    const form = useForm({
        name: stage?.name ?? '',
        stage_group_id: stage?.stage_group_id ?? ('' as number | ''),
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

    function submit(e: FormEvent) {
        e.preventDefault();
        const opts = { onSuccess: onDone };
        if (isEdit) form.put(`/admin/full-test-config/${stagedTest.id}/stages/${stage!.id}`, opts);
        else form.post(`/admin/full-test-config/${stagedTest.id}/stages`, opts);
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
                    <input
                        type="number" step="1" min="0" max="100" className={inputClass}
                        value={form.data.pass_threshold_percent}
                        onChange={(e) => form.setData('pass_threshold_percent', e.target.value)}
                        disabled={!!form.data.stage_group_id}
                    />
                    {form.data.stage_group_id ? <p className="mt-1 text-xs text-text-muted">Ignored — this stage is in a group; the group's threshold applies instead.</p> : null}
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

            {stagedTest.stage_groups.length > 0 && (
                <div>
                    <label className={labelClass}>Stage group</label>
                    <select className={inputClass} value={form.data.stage_group_id} onChange={(e) => form.setData('stage_group_id', e.target.value ? Number(e.target.value) : '')}>
                        <option value="">Ungrouped — passes individually</option>
                        {stagedTest.stage_groups.map((g) => <option key={g.id} value={g.id}>{g.name || `Group #${g.id}`}</option>)}
                    </select>
                </div>
            )}

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

function MergeStagesPanel({ stagedTest }: { stagedTest: StagedTest }) {
    const [adding, setAdding] = useState(false);
    const ungroupedStages = stagedTest.stages.filter((s) => !s.stage_group_id).sort((a, b) => a.order - b.order);
    const form = useForm({ name: '', pass_threshold_percent: '50', stage_ids: [] as number[] });

    function toggle(id: number) {
        const ids = form.data.stage_ids.includes(id) ? form.data.stage_ids.filter((s) => s !== id) : [...form.data.stage_ids, id];
        form.setData('stage_ids', ids);
    }

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post(`/admin/full-test-config/${stagedTest.id}/groups`, { onSuccess: () => { form.reset(); setAdding(false); } });
    }

    return (
        <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="mb-1 flex items-center gap-2">
                <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75l-9.75-5.25 4.179-2.25m11.142 0l-5.571 3-5.571-3" />
                </svg>
                <h3 className="font-bold text-text">Merge stages (stage groups)</h3>
            </div>
            <p className="mb-4 text-sm text-text-secondary">
                Student attempts each stage in a group in order; after the last stage, combined score must meet the passing
                % to proceed. If no groups are set, each stage is passed individually.
            </p>

            {stagedTest.stage_groups.length > 0 && (
                <div className="mb-4 space-y-2">
                    {stagedTest.stage_groups.map((g) => (
                        <div key={g.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                            <div>
                                <span className="font-semibold text-text">{g.name || `Group #${g.id}`}</span>
                                <span className="ml-2 text-text-secondary">
                                    Pass at {g.pass_threshold_percent}% ·{' '}
                                    {stagedTest.stages.filter((s) => s.stage_group_id === g.id).map((s) => s.name).join(', ')}
                                </span>
                            </div>
                            <button
                                onClick={() => confirm('Ungroup these stages? They will pass individually again.') && router.delete(`/admin/full-test-config/${stagedTest.id}/groups/${g.id}`)}
                                className="text-xs font-bold uppercase text-danger hover:underline"
                            >
                                Ungroup
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {adding ? (
                <form onSubmit={submit} className="space-y-3 rounded-2xl border border-primary p-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass}>Group name (optional)</label>
                            <input className={inputClass} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="e.g. Interview + Medical" />
                        </div>
                        <div>
                            <label className={labelClass}>Combined pass threshold (%)</label>
                            <input type="number" min="0" max="100" className={inputClass} value={form.data.pass_threshold_percent} onChange={(e) => form.setData('pass_threshold_percent', e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Stages to merge (pick at least 2)</label>
                        <div className="space-y-1.5 rounded-lg border border-border p-2">
                            {ungroupedStages.map((s) => (
                                <label key={s.id} className="flex items-center gap-2 text-sm text-text">
                                    <input type="checkbox" checked={form.data.stage_ids.includes(s.id)} onChange={() => toggle(s.id)} />
                                    {s.order}. {s.name}
                                </label>
                            ))}
                            {ungroupedStages.length < 2 && <p className="text-sm text-text-secondary">Need at least 2 ungrouped stages to merge.</p>}
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button type="submit" disabled={form.processing || form.data.stage_ids.length < 2} className={btnClass}>Add merged group</button>
                        <button type="button" onClick={() => setAdding(false)} className="rounded-lg border border-border px-5 py-2.5 text-sm font-bold uppercase text-text hover:border-primary">Cancel</button>
                    </div>
                    {Object.values(form.errors).map((m, i) => <div key={i} className="text-sm text-danger">{String(m)}</div>)}
                </form>
            ) : (
                <button
                    onClick={() => setAdding(true)}
                    disabled={ungroupedStages.length < 2}
                    className="rounded-lg border border-primary px-4 py-2 text-sm font-bold uppercase text-primary hover:bg-primary-subtle disabled:cursor-not-allowed disabled:opacity-40"
                >
                    + Add merged group
                </button>
            )}
            {ungroupedStages.length < 2 && !adding && (
                <p className="mt-2 text-sm text-text-muted">Add at least one stage above, then click <strong>Add merged group</strong> to merge stages and set a combined passing %.</p>
            )}
        </div>
    );
}
