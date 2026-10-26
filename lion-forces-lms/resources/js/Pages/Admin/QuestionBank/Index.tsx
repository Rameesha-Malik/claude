import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import QuestionBankForm from '@/Components/QuestionBankForm';
import { BulkUploadResult, QuestionBankBulkUploadForm, QuestionBankBulkUploadResult } from '@/Components/QuestionBankBulkUpload';
import AdminLayout from '@/Layouts/AdminLayout';

interface Subject { id: number; name: string }
interface Topic { id: number; subject_id: number; name: string }
interface CourseOption { id: number; title: string }
interface Option { id?: number; option_text: string | null; image_path: string | null; is_correct: boolean }
interface Question {
    id: number; question_text: string; explanation: string | null; difficulty: string; image_path: string | null;
    subject: Subject | null; topic: Topic | null; course: CourseOption | null; options: Option[];
}
interface Paginated<T> { data: T[]; links: { url: string | null; label: string; active: boolean }[] }
interface Props {
    questions: Paginated<Question>;
    subjects: Subject[];
    topics: Topic[];
    courses: CourseOption[];
    filters: { subject_id?: string };
    bulkUploadResult: BulkUploadResult | null;
}

const inputClass = 'w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:shadow-glow focus:outline-none';
const btnClass = 'rounded-lg bg-primary px-4 py-2 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover disabled:opacity-50';

export default function QuestionBankIndex({ questions, subjects, topics, courses, filters, bulkUploadResult }: Props) {
    const [tab, setTab] = useState<'Questions' | 'Subjects' | 'Topics'>('Questions');

    return (
        <AdminLayout header="Question Bank">
            <Head title="Question Bank" />
            <p className="mb-4 max-w-2xl text-sm text-text-secondary">
                The shared Question Bank. Anything created here can be assigned into multiple courses' practice tests,
                quizzes, and mock exams. One edit updates it everywhere it's used.
            </p>

            <div className="mb-6 flex gap-2 border-b border-border">
                {(['Questions', 'Subjects', 'Topics'] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`border-b-2 px-4 py-3 text-sm font-bold uppercase tracking-wide ${tab === t ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text'}`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {tab === 'Questions' && (
                <QuestionsPanel
                    questions={questions}
                    subjects={subjects}
                    topics={topics}
                    courses={courses}
                    filters={filters}
                    bulkUploadResult={bulkUploadResult}
                />
            )}
            {tab === 'Subjects' && <SubjectsPanel subjects={subjects} />}
            {tab === 'Topics' && <TopicsPanel subjects={subjects} topics={topics} />}
        </AdminLayout>
    );
}

function QuestionsPanel({ questions, subjects, topics, courses, filters, bulkUploadResult }: { questions: Paginated<Question>; subjects: Subject[]; topics: Topic[]; courses: CourseOption[]; filters: { subject_id?: string }; bulkUploadResult: BulkUploadResult | null }) {
    const [showAdd, setShowAdd] = useState(false);
    const [showBulk, setShowBulk] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <select
                    className={inputClass}
                    style={{ width: 220 }}
                    value={filters.subject_id ?? ''}
                    onChange={(e) => router.get('/admin/question-bank', { subject_id: e.target.value || undefined }, { preserveState: true })}
                >
                    <option value="">All subjects</option>
                    {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <div className="flex gap-2">
                    <button onClick={() => setShowBulk((v) => !v)} className={`${btnClass} bg-surface-sunken text-text hover:bg-surface-sunken/80`}>
                        {showBulk ? 'Cancel' : 'Bulk Upload (CSV)'}
                    </button>
                    <button onClick={() => setShowAdd((v) => !v)} className={btnClass}>{showAdd ? 'Cancel' : '+ Add Question'}</button>
                </div>
            </div>

            {showBulk && <QuestionBankBulkUploadForm courses={courses} onDone={() => setShowBulk(false)} />}
            {bulkUploadResult && <QuestionBankBulkUploadResult result={bulkUploadResult} />}

            {showAdd && <QuestionBankForm subjects={subjects} topics={topics} courses={courses} onDone={() => setShowAdd(false)} />}

            <div className="space-y-3">
                {questions.data.map((q) => (
                    editingId === q.id ? (
                        <QuestionBankForm
                            key={q.id}
                            question={q}
                            subjects={subjects}
                            topics={topics}
                            courses={courses}
                            onDone={() => setEditingId(null)}
                        />
                    ) : (
                        <div key={q.id} className="rounded-2xl border border-border bg-surface p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="mb-2 flex gap-2">
                                        {q.course ? (
                                            <span className="rounded-full bg-success-bg px-2 py-0.5 text-xs font-bold text-success">{q.course.title}</span>
                                        ) : (
                                            <span className="rounded-full bg-warning-bg px-2 py-0.5 text-xs font-bold text-warning">No course tagged</span>
                                        )}
                                        {q.subject && <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-xs font-bold text-primary">{q.subject.name}</span>}
                                        {q.topic && <span className="rounded-full bg-surface-sunken px-2 py-0.5 text-xs font-bold text-text-secondary">{q.topic.name}</span>}
                                        <span className="rounded-full bg-surface-sunken px-2 py-0.5 text-xs font-bold uppercase text-text-muted">{q.difficulty}</span>
                                    </div>
                                    {q.image_path && (
                                        <img src={`/storage/${q.image_path}`} alt="" className="mb-2 max-h-32 rounded-lg border border-border" />
                                    )}
                                    <p className="font-medium text-text">{q.question_text}</p>
                                    <ul className="mt-2 space-y-1 text-sm">
                                        {q.options.map((o, i) => (
                                            <li key={i} className={o.is_correct ? 'font-semibold text-success' : 'text-text-secondary'}>
                                                {o.is_correct && '✓ '}
                                                {o.image_path ? (
                                                    <img src={`/storage/${o.image_path}`} alt="" className="mt-1 inline-block max-h-16 rounded border border-border align-middle" />
                                                ) : (
                                                    o.option_text
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="flex flex-shrink-0 flex-col items-end gap-2">
                                    <button onClick={() => setEditingId(q.id)} className="text-xs font-bold uppercase text-primary hover:underline">Edit</button>
                                    <button onClick={() => router.delete(`/admin/question-bank/questions/${q.id}`)} className="text-xs font-bold uppercase text-danger hover:underline">Delete</button>
                                </div>
                            </div>
                        </div>
                    )
                ))}
                {questions.data.length === 0 && <p className="text-sm text-text-secondary">No questions yet.</p>}
            </div>

            <Pagination links={questions.links} />
        </div>
    );
}

function SubjectsPanel({ subjects }: { subjects: Subject[] }) {
    const addForm = useForm({ name: '' });

    return (
        <div className="max-w-md">
            <div className="mb-4 flex flex-wrap gap-2">
                {subjects.map((s) => (
                    <span key={s.id} className="rounded-full bg-surface-sunken px-3 py-1 text-sm text-text">{s.name}</span>
                ))}
            </div>
            <form
                onSubmit={(e) => { e.preventDefault(); addForm.post('/admin/question-bank/subjects', { onSuccess: () => addForm.reset() }); }}
                className="flex gap-2"
            >
                <input className={inputClass} placeholder="New subject name" value={addForm.data.name} onChange={(e) => addForm.setData('name', e.target.value)} />
                <button type="submit" disabled={addForm.processing} className={btnClass}>Add</button>
            </form>
            {Object.values(addForm.errors).map((m, i) => <div key={i} className="mt-1 text-sm text-danger">{String(m)}</div>)}
        </div>
    );
}

function TopicsPanel({ subjects, topics }: { subjects: Subject[]; topics: Topic[] }) {
    const addForm = useForm({ subject_id: subjects[0]?.id ?? ('' as number | ''), name: '' });

    return (
        <div className="max-w-md">
            {subjects.map((s) => {
                const subjectTopics = topics.filter((t) => t.subject_id === s.id);
                if (subjectTopics.length === 0) return null;
                return (
                    <div key={s.id} className="mb-4">
                        <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-text-muted">{s.name}</p>
                        <div className="flex flex-wrap gap-2">
                            {subjectTopics.map((t) => (
                                <span key={t.id} className="rounded-full bg-surface-sunken px-3 py-1 text-sm text-text">{t.name}</span>
                            ))}
                        </div>
                    </div>
                );
            })}
            {topics.length === 0 && <p className="mb-4 text-sm text-text-secondary">No topics yet.</p>}

            <form
                onSubmit={(e) => { e.preventDefault(); addForm.post('/admin/question-bank/topics', { onSuccess: () => addForm.setData('name', '') }); }}
                className="flex gap-2"
            >
                <select className={inputClass} style={{ width: 160 }} value={addForm.data.subject_id} onChange={(e) => addForm.setData('subject_id', Number(e.target.value))}>
                    {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <input className={inputClass} placeholder="New topic name" value={addForm.data.name} onChange={(e) => addForm.setData('name', e.target.value)} />
                <button type="submit" disabled={addForm.processing} className={btnClass}>Add</button>
            </form>
            {Object.values(addForm.errors).map((m, i) => <div key={i} className="mt-1 text-sm text-danger">{String(m)}</div>)}
        </div>
    );
}

function Pagination({ links }: { links: { url: string | null; label: string; active: boolean }[] }) {
    if (links.length <= 3) return null;
    return (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
            {links.map((link, i) => (
                <button
                    key={i}
                    disabled={!link.url}
                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                    className={`rounded-lg px-4 py-2 text-sm ${link.active ? 'bg-primary text-on-primary' : 'bg-surface text-text-secondary hover:bg-primary-subtle'} disabled:opacity-40`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                />
            ))}
        </div>
    );
}
