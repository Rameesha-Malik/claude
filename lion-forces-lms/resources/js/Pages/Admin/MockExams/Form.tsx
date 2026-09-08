import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Subject { id: number; name: string }
interface QuestionRow { id: number; subject_id: number | null; question_text: string; difficulty: string }
interface SectionQuestion { id: number }
interface Section {
    id: number; name: string; order: number; duration_minutes: number | null;
    marks_per_question: string; negative_marking: string; questions: SectionQuestion[];
}
interface MockExam {
    id: number; title: string; target_exam_name: string | null; total_duration_minutes: number | null;
    attempt_limit: number | null; fullscreen_required: boolean; disallow_back_navigation: boolean;
    available_from: string | null; available_until: string | null; is_active: boolean; sections: Section[];
}
interface Props {
    course: { id: number; title: string };
    mockExam?: MockExam;
    subjects: Subject[];
    questionBank: QuestionRow[];
}

const inputClass = 'w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:shadow-glow focus:outline-none';
const labelClass = 'mb-1 block text-sm font-medium text-text';
const btnClass = 'rounded-lg bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover disabled:opacity-50';

export default function MockExamForm({ course, mockExam, subjects, questionBank }: Props) {
    const isEdit = !!mockExam;
    const form = useForm({
        title: mockExam?.title ?? '',
        target_exam_name: mockExam?.target_exam_name ?? '',
        total_duration_minutes: mockExam?.total_duration_minutes ?? '',
        attempt_limit: mockExam?.attempt_limit ?? '',
        fullscreen_required: mockExam?.fullscreen_required ?? true,
        disallow_back_navigation: mockExam?.disallow_back_navigation ?? true,
        available_from: mockExam?.available_from?.slice(0, 16) ?? '',
        available_until: mockExam?.available_until?.slice(0, 16) ?? '',
        is_active: mockExam?.is_active ?? true,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (isEdit) form.put(`/admin/courses/${course.id}/mock-exams/${mockExam!.id}`);
        else form.post(`/admin/courses/${course.id}/mock-exams`);
    }

    return (
        <AdminLayout header={isEdit ? `Edit Mock Exam — ${mockExam!.title}` : 'New Mock Exam'}>
            <Head title="Mock Exam" />

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
                    <div>
                        <label className={labelClass}>Total Duration (minutes, blank = sum of sections)</label>
                        <input type="number" className={inputClass} value={form.data.total_duration_minutes} onChange={(e) => form.setData('total_duration_minutes', e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>Attempt Limit (blank = unlimited)</label>
                        <input type="number" className={inputClass} value={form.data.attempt_limit} onChange={(e) => form.setData('attempt_limit', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass}>Available From</label>
                            <input type="datetime-local" className={inputClass} value={form.data.available_from} onChange={(e) => form.setData('available_from', e.target.value)} />
                        </div>
                        <div>
                            <label className={labelClass}>Available Until</label>
                            <input type="datetime-local" className={inputClass} value={form.data.available_until} onChange={(e) => form.setData('available_until', e.target.value)} />
                        </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-text">
                        <input type="checkbox" checked={form.data.fullscreen_required} onChange={(e) => form.setData('fullscreen_required', e.target.checked)} />
                        Require fullscreen while taking
                    </label>
                    <label className="flex items-center gap-2 text-sm text-text">
                        <input type="checkbox" checked={form.data.disallow_back_navigation} onChange={(e) => form.setData('disallow_back_navigation', e.target.checked)} />
                        Disallow returning to a completed section
                    </label>
                    <label className="flex items-center gap-2 text-sm text-text">
                        <input type="checkbox" checked={form.data.is_active} onChange={(e) => form.setData('is_active', e.target.checked)} />
                        Active (visible to students)
                    </label>
                    <button type="submit" disabled={form.processing} className={btnClass + ' w-full'}>
                        {isEdit ? 'Save Changes' : 'Create Mock Exam — Then Add Sections'}
                    </button>
                    {Object.values(form.errors).map((m, i) => <div key={i} className="text-sm text-danger">{String(m)}</div>)}
                </form>

                {isEdit && (
                    <div className="lg:col-span-2">
                        <SectionsPanel course={course} mockExam={mockExam!} subjects={subjects} questionBank={questionBank} />
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

function SectionsPanel({ course, mockExam, subjects, questionBank }: { course: { id: number }; mockExam: MockExam; subjects: Subject[]; questionBank: QuestionRow[] }) {
    const [adding, setAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-text">Sections ({mockExam.sections.length})</h3>
                {!adding && (
                    <button onClick={() => setAdding(true)} className="rounded-lg border border-primary px-4 py-1.5 text-sm font-bold uppercase text-primary hover:bg-primary-subtle">
                        + Add Section
                    </button>
                )}
            </div>

            {mockExam.sections.sort((a, b) => a.order - b.order).map((section) =>
                editingId === section.id ? (
                    <SectionForm
                        key={section.id}
                        course={course}
                        mockExam={mockExam}
                        section={section}
                        subjects={subjects}
                        questionBank={questionBank}
                        onDone={() => setEditingId(null)}
                    />
                ) : (
                    <div key={section.id} className="rounded-2xl border border-border bg-surface p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-text">{section.order}. {section.name}</h4>
                                <p className="text-sm text-text-secondary">
                                    {section.questions.length} question{section.questions.length === 1 ? '' : 's'}
                                    {section.duration_minutes ? ` · ${section.duration_minutes} min` : ' · No time limit'}
                                    {' · '}{section.marks_per_question} mark(s), -{section.negative_marking} negative
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setEditingId(section.id)} className="text-sm font-semibold text-primary hover:underline">Edit</button>
                                <button
                                    onClick={() => {
                                        if (confirm('Delete this section?')) {
                                            router.delete(`/admin/courses/${course.id}/mock-exams/${mockExam.id}/sections/${section.id}`);
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
                <SectionForm
                    course={course}
                    mockExam={mockExam}
                    subjects={subjects}
                    questionBank={questionBank}
                    onDone={() => setAdding(false)}
                />
            )}

            {mockExam.sections.length === 0 && !adding && (
                <p className="rounded-2xl border border-dashed border-border bg-surface p-6 text-center text-sm text-text-secondary">
                    Add at least one section (e.g. "Verbal Intelligence", "Non-Verbal Reasoning") before students can take this exam.
                </p>
            )}
        </div>
    );
}

function SectionForm({
    course, mockExam, section, subjects, questionBank, onDone,
}: {
    course: { id: number }; mockExam: MockExam; section?: Section; subjects: Subject[]; questionBank: QuestionRow[]; onDone: () => void;
}) {
    const isEdit = !!section;
    const [subjectFilter, setSubjectFilter] = useState('');
    const form = useForm({
        name: section?.name ?? '',
        duration_minutes: section?.duration_minutes ?? '',
        marks_per_question: section?.marks_per_question ?? '1',
        negative_marking: section?.negative_marking ?? '0',
        question_ids: section?.questions?.map((q) => q.id) ?? [] as number[],
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
        if (isEdit) form.put(`/admin/courses/${course.id}/mock-exams/${mockExam.id}/sections/${section!.id}`, opts);
        else form.post(`/admin/courses/${course.id}/mock-exams/${mockExam.id}/sections`, opts);
    }

    const filteredBank = subjectFilter ? questionBank.filter((q) => String(q.subject_id) === subjectFilter) : questionBank;

    return (
        <form onSubmit={submit} className="space-y-3 rounded-2xl border border-primary bg-surface p-5">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={labelClass}>Section Name</label>
                    <input className={inputClass} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="e.g. Verbal Intelligence" />
                </div>
                <div>
                    <label className={labelClass}>Duration (minutes)</label>
                    <input type="number" className={inputClass} value={form.data.duration_minutes} onChange={(e) => form.setData('duration_minutes', e.target.value)} />
                </div>
            </div>
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
                <button type="submit" disabled={form.processing} className={btnClass}>{isEdit ? 'Save Section' : 'Add Section'}</button>
                <button type="button" onClick={onDone} className="rounded-lg border border-border px-5 py-2.5 text-sm font-bold uppercase text-text hover:border-primary">Cancel</button>
            </div>
            {Object.values(form.errors).map((m, i) => <div key={i} className="text-sm text-danger">{String(m)}</div>)}
        </form>
    );
}
