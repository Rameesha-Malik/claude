import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Subject { id: number; name: string }
interface Option { id?: number; option_text: string; is_correct: boolean }
interface Question { id: number; question_text: string; explanation: string | null; difficulty: string; subject: Subject | null; options: Option[] }
interface Note { id: number; title: string; content: string | null; subject: Subject | null }
interface Paginated<T> { data: T[]; links: { url: string | null; label: string; active: boolean }[] }
interface Props {
    questions: Paginated<Question>;
    notes: Paginated<Note>;
    subjects: Subject[];
    filters: { subject_id?: string };
}

const inputClass = 'w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:shadow-glow focus:outline-none';
const btnClass = 'rounded-lg bg-primary px-4 py-2 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover disabled:opacity-50';

export default function ContentLibraryIndex({ questions, notes, subjects, filters }: Props) {
    const [tab, setTab] = useState<'Questions' | 'Notes' | 'Subjects'>('Questions');

    return (
        <AdminLayout header="Content Library">
            <Head title="Content Library" />
            <p className="mb-4 max-w-2xl text-sm text-text-secondary">
                The shared Question Bank and Notes Bank. Anything created here can be assigned into multiple
                courses' practice tests, mock exams, and notes sections — one edit updates it everywhere it's used.
            </p>

            <div className="mb-6 flex gap-2 border-b border-border">
                {(['Questions', 'Notes', 'Subjects'] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`border-b-2 px-4 py-3 text-sm font-bold uppercase tracking-wide ${tab === t ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text'}`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {tab === 'Questions' && <QuestionsPanel questions={questions} subjects={subjects} filters={filters} />}
            {tab === 'Notes' && <NotesPanel notes={notes} subjects={subjects} />}
            {tab === 'Subjects' && <SubjectsPanel subjects={subjects} />}
        </AdminLayout>
    );
}

function QuestionsPanel({ questions, subjects, filters }: { questions: Paginated<Question>; subjects: Subject[]; filters: { subject_id?: string } }) {
    const [showAdd, setShowAdd] = useState(false);

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <select
                    className={inputClass}
                    style={{ width: 220 }}
                    value={filters.subject_id ?? ''}
                    onChange={(e) => router.get('/admin/content-library', { subject_id: e.target.value || undefined }, { preserveState: true })}
                >
                    <option value="">All subjects</option>
                    {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <button onClick={() => setShowAdd((v) => !v)} className={btnClass}>{showAdd ? 'Cancel' : '+ Add Question'}</button>
            </div>

            {showAdd && <QuestionForm subjects={subjects} onDone={() => setShowAdd(false)} />}

            <div className="space-y-3">
                {questions.data.map((q) => (
                    <div key={q.id} className="rounded-2xl border border-border bg-surface p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="mb-2 flex gap-2">
                                    {q.subject && <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-xs font-bold text-primary">{q.subject.name}</span>}
                                    <span className="rounded-full bg-surface-sunken px-2 py-0.5 text-xs font-bold uppercase text-text-muted">{q.difficulty}</span>
                                </div>
                                <p className="font-medium text-text">{q.question_text}</p>
                                <ul className="mt-2 space-y-1 text-sm">
                                    {q.options.map((o, i) => (
                                        <li key={i} className={o.is_correct ? 'font-semibold text-success' : 'text-text-secondary'}>
                                            {o.is_correct ? '✓ ' : '— '}{o.option_text}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <button onClick={() => router.delete(`/admin/content-library/questions/${q.id}`)} className="text-xs font-bold uppercase text-danger hover:underline">Delete</button>
                        </div>
                    </div>
                ))}
                {questions.data.length === 0 && <p className="text-sm text-text-secondary">No questions yet.</p>}
            </div>

            <Pagination links={questions.links} />
        </div>
    );
}

function QuestionForm({ subjects, onDone }: { subjects: Subject[]; onDone: () => void }) {
    const form = useForm({
        subject_id: '',
        question_text: '',
        explanation: '',
        difficulty: 'medium',
        options: [{ option_text: '', is_correct: true }, { option_text: '', is_correct: false }, { option_text: '', is_correct: false }, { option_text: '', is_correct: false }],
    });

    function setOption(i: number, field: 'option_text' | 'is_correct', value: string | boolean) {
        const options = [...form.data.options];
        if (field === 'is_correct') {
            options.forEach((o, j) => (o.is_correct = j === i));
        } else {
            options[i] = { ...options[i], option_text: value as string };
        }
        form.setData('options', options);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.post('/admin/content-library/questions', { onSuccess: () => { form.reset(); onDone(); } });
    }

    return (
        <form onSubmit={submit} className="mb-6 space-y-3 rounded-2xl border border-border bg-surface p-5">
            <div className="grid grid-cols-2 gap-3">
                <select className={inputClass} value={form.data.subject_id} onChange={(e) => form.setData('subject_id', e.target.value)}>
                    <option value="">No subject</option>
                    {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select className={inputClass} value={form.data.difficulty} onChange={(e) => form.setData('difficulty', e.target.value)}>
                    {['easy', 'medium', 'hard'].map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>
            <textarea rows={2} className={inputClass} placeholder="Question text" value={form.data.question_text} onChange={(e) => form.setData('question_text', e.target.value)} />
            {form.data.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                    <input type="radio" checked={opt.is_correct} onChange={() => setOption(i, 'is_correct', true)} />
                    <input className={inputClass} placeholder={`Option ${i + 1}`} value={opt.option_text} onChange={(e) => setOption(i, 'option_text', e.target.value)} />
                </div>
            ))}
            <textarea rows={2} className={inputClass} placeholder="Explanation (optional)" value={form.data.explanation} onChange={(e) => form.setData('explanation', e.target.value)} />
            <button type="submit" disabled={form.processing} className={btnClass}>Save Question</button>
            {Object.values(form.errors).map((m, i) => <div key={i} className="text-sm text-danger">{String(m)}</div>)}
        </form>
    );
}

function NotesPanel({ notes, subjects }: { notes: Paginated<Note>; subjects: Subject[] }) {
    const addForm = useForm({ subject_id: '', title: '', content: '' });

    return (
        <div>
            <div className="mb-6 space-y-3">
                {notes.data.map((note) => (
                    <div key={note.id} className="rounded-2xl border border-border bg-surface p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                {note.subject && <span className="mb-1 inline-block rounded-full bg-primary-subtle px-2 py-0.5 text-xs font-bold text-primary">{note.subject.name}</span>}
                                <h4 className="font-semibold text-text">{note.title}</h4>
                                <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{note.content}</p>
                            </div>
                            <button onClick={() => router.delete(`/admin/content-library/notes/${note.id}`)} className="text-xs font-bold uppercase text-danger hover:underline">Delete</button>
                        </div>
                    </div>
                ))}
                {notes.data.length === 0 && <p className="text-sm text-text-secondary">No notes yet.</p>}
            </div>

            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">Add New</h3>
            <form
                onSubmit={(e) => { e.preventDefault(); addForm.post('/admin/content-library/notes', { onSuccess: () => addForm.reset() }); }}
                className="max-w-xl space-y-2 rounded-2xl border border-border bg-surface p-5"
            >
                <select className={inputClass} value={addForm.data.subject_id} onChange={(e) => addForm.setData('subject_id', e.target.value)}>
                    <option value="">No subject</option>
                    {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <input className={inputClass} placeholder="Title" value={addForm.data.title} onChange={(e) => addForm.setData('title', e.target.value)} />
                <textarea rows={4} className={inputClass} placeholder="Content" value={addForm.data.content} onChange={(e) => addForm.setData('content', e.target.value)} />
                <button type="submit" disabled={addForm.processing} className={btnClass}>Add Note</button>
                {Object.values(addForm.errors).map((m, i) => <div key={i} className="text-sm text-danger">{String(m)}</div>)}
            </form>

            <Pagination links={notes.links} />
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
                onSubmit={(e) => { e.preventDefault(); addForm.post('/admin/content-library/subjects', { onSuccess: () => addForm.reset() }); }}
                className="flex gap-2"
            >
                <input className={inputClass} placeholder="New subject name" value={addForm.data.name} onChange={(e) => addForm.setData('name', e.target.value)} />
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
