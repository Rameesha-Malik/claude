import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AccordionRow from '@/Components/AccordionRow';
import { LiteMarkdownInline } from '@/Components/LiteMarkdown';
import RevealOnScroll from '@/Components/RevealOnScroll';
import StudentLayout from '@/Layouts/StudentLayout';

interface Option { id: number; option_text: string; is_correct: boolean }
interface Question { id: number; question_text: string; options: Option[]; subject: { name: string } | null }
interface NoteItem { id: number; note_text: string; created_at: string; question: Question }
interface Props { notes: NoteItem[] }

const PENCIL_PATH = 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.5-9.5a2.121 2.121 0 013 3L12 16l-4 1 1-4 9.5-9.5z';

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
        <AccordionRow
            icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={PENCIL_PATH} />
                </svg>
            }
            title={<LiteMarkdownInline text={item.question.question_text} />}
            pill={
                item.question.subject && (
                    <span className="flex-shrink-0 rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-on-primary">
                        {item.question.subject.name}
                    </span>
                )
            }
            subtitle={`Noted on ${new Date(item.created_at).toLocaleDateString()}`}
        >
            <div className="mb-3 flex justify-end gap-1.5">
                {!editing && (
                    <button
                        onClick={() => setEditing(true)}
                        title="Edit note"
                        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[0.5rem] text-text-muted hover:bg-primary-subtle hover:text-primary"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d={PENCIL_PATH} />
                        </svg>
                    </button>
                )}
                <button
                    onClick={remove}
                    title="Delete note"
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[0.5rem] text-text-muted hover:bg-danger-bg hover:text-danger"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m2 0v13a1 1 0 01-1 1H8a1 1 0 01-1-1V7h10z" />
                    </svg>
                </button>
            </div>

            {editing ? (
                <div className="space-y-2">
                    <textarea
                        rows={3}
                        className="w-full rounded-[0.75rem] border border-border px-3 py-2 text-sm focus:border-primary focus:shadow-glow focus:outline-none"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <div className="flex gap-2">
                        <button onClick={save} className="rounded-[0.75rem] bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover">
                            Save Note
                        </button>
                        <button onClick={() => { setText(saved); setEditing(false); }} className="rounded-[0.75rem] border border-border px-4 py-2 text-xs font-bold uppercase tracking-wide text-text-secondary hover:bg-surface-sunken">
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <p className="whitespace-pre-line rounded-[1.5rem] bg-primary-subtle p-3 text-sm text-text">{saved}</p>
            )}
        </AccordionRow>
    );
}

export default function QuestionNotesIndex({ notes }: Props) {
    return (
        <StudentLayout header="MCQ Notes">
            <Head title="MCQ Notes" />

            <p className="mb-6 max-w-2xl text-sm text-text-secondary">
                Personal notes you've written on a question while attempting a quiz or test, a memory jog for tricky
                ones, kept private to you.
            </p>

            {notes.length === 0 ? (
                <div className="rounded-[2rem] border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                    No notes yet. While taking a quiz or test, tap the pencil icon on any question to jot one down.
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
