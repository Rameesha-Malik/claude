import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { LiteMarkdownInline } from '@/Components/LiteMarkdown';
import RevealOnScroll from '@/Components/RevealOnScroll';
import StudentLayout from '@/Layouts/StudentLayout';

interface Option { id: number; option_text: string; is_correct: boolean }
interface Question { id: number; question_text: string; options: Option[]; subject: { name: string } | null }
interface NoteItem { id: number; note_text: string; question: Question }
interface Props { notes: NoteItem[] }

function NoteCard({ item }: { item: NoteItem }) {
    const [editing, setEditing] = useState(false);
    const [text, setText] = useState(item.note_text);
    const [deleted, setDeleted] = useState(false);
    const [saved, setSaved] = useState(item.note_text);

    function save() {
        router.post(`/questions/${item.question.id}/note`, { note_text: text }, {
            preserveScroll: true,
            onSuccess: () => { setSaved(text); setEditing(false); },
        });
    }

    function remove() {
        router.post(`/questions/${item.question.id}/note`, { note_text: '' }, {
            preserveScroll: true,
            onSuccess: () => setDeleted(true),
        });
    }

    if (deleted) return null;

    return (
        <div className="rounded-3xl border border-border bg-surface p-5">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                <div>
                    {item.question.subject && (
                        <span className="mb-1 inline-block rounded-full bg-primary-subtle px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-primary">
                            {item.question.subject.name}
                        </span>
                    )}
                    <p className="font-semibold text-text"><LiteMarkdownInline text={item.question.question_text} /></p>
                </div>
                <div className="flex flex-shrink-0 gap-3">
                    <button onClick={() => setEditing((v) => !v)} className="text-xs font-bold uppercase text-primary hover:underline">
                        {editing ? 'Cancel' : 'Edit'}
                    </button>
                    <button onClick={remove} className="text-xs font-bold uppercase text-danger hover:underline">Delete</button>
                </div>
            </div>

            {editing ? (
                <div className="space-y-2">
                    <textarea
                        rows={3}
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:shadow-glow focus:outline-none"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <button onClick={save} className="rounded-lg bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover">
                        Save Note
                    </button>
                </div>
            ) : (
                <p className="whitespace-pre-line rounded-2xl bg-primary-subtle p-3 text-sm text-text">{saved}</p>
            )}
        </div>
    );
}

export default function QuestionNotesIndex({ notes }: Props) {
    return (
        <StudentLayout header="MCQ Notes">
            <Head title="MCQ Notes" />

            <p className="mb-6 max-w-2xl text-sm text-text-secondary">
                Personal notes you've written on a question while attempting a quiz or test — a memory jog for tricky
                ones, kept private to you.
            </p>

            {notes.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                    No notes yet — while taking a quiz or test, tap the pencil icon on any question to jot one down.
                </div>
            ) : (
                <RevealOnScroll staggerMs={40} className="space-y-5">
                    {notes.map((item) => (
                        <NoteCard key={item.id} item={item} />
                    ))}
                </RevealOnScroll>
            )}
        </StudentLayout>
    );
}
