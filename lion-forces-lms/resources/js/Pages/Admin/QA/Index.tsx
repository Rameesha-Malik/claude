import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import RichTextArea from '@/Components/RichTextArea';
import AdminLayout from '@/Layouts/AdminLayout';

interface Reply { id: number; reply_text: string; admin: { name: string } | null; created_at: string }
interface QuestionItem {
    id: number; question_text: string; status: string; created_at: string;
    user: { name: string; email: string } | null;
    course: { title: string; slug: string } | null;
    lesson: { title: string } | null;
    replies: Reply[];
}
interface Paginated<T> { data: T[]; links: { url: string | null; label: string; active: boolean }[] }
interface Props { questions: Paginated<QuestionItem>; status: string; unansweredCount: number }

export default function QAIndex({ questions, status, unansweredCount }: Props) {
    return (
        <AdminLayout header="Q&A">
            <Head title="Q&A" />

            <div className="mb-6 flex flex-wrap gap-2">
                {(['unanswered', 'answered', 'all'] as const).map((s) => (
                    <Link
                        key={s}
                        href={`/admin/qa?status=${s}`}
                        className={`rounded-full px-4 py-2 text-sm font-bold uppercase tracking-wide transition-colors ${
                            status === s ? 'bg-primary text-on-primary' : 'border border-border text-text-secondary hover:border-primary hover:text-primary'
                        }`}
                    >
                        {s === 'unanswered' ? `Unanswered (${unansweredCount})` : s.charAt(0).toUpperCase() + s.slice(1)}
                    </Link>
                ))}
            </div>

            <div className="space-y-4">
                {questions.data.map((q) => (
                    <QuestionCard key={q.id} question={q} />
                ))}
                {questions.data.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                        Nothing here.
                    </div>
                )}
            </div>

            {questions.links.length > 3 && (
                <div className="mt-6 flex flex-wrap gap-2">
                    {questions.links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url ?? '#'}
                            className={`rounded-lg px-3 py-1.5 text-sm ${link.active ? 'bg-primary text-on-primary' : 'border border-border text-text hover:border-primary'} ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}

function QuestionCard({ question }: { question: QuestionItem }) {
    const [replying, setReplying] = useState(false);
    const { data, setData, post, processing, reset } = useForm({ reply_text: '' });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/admin/qa/${question.id}/reply`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setReplying(false);
            },
        });
    };

    return (
        <div className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <div className="text-sm font-semibold text-text">
                        {question.user?.name ?? 'Unknown student'} <span className="font-normal text-text-secondary">— {question.user?.email}</span>
                    </div>
                    <div className="mt-0.5 text-xs text-text-muted">
                        {question.course?.title}
                        {question.lesson && ` · ${question.lesson.title}`}
                        {' · '}
                        {new Date(question.created_at).toLocaleString()}
                    </div>
                </div>
                <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                        question.status === 'answered' ? 'bg-success-bg text-success' : 'bg-warning-bg text-warning'
                    }`}
                >
                    {question.status}
                </span>
            </div>

            <p className="mt-3 text-sm text-text">{question.question_text}</p>

            {question.replies.map((r) => (
                <div key={r.id} className="mt-3 rounded-lg bg-primary-subtle p-3">
                    <span className="text-xs font-bold text-primary">{r.admin?.name ?? 'Admin'}</span>
                    <p className="mt-1 text-sm text-text">{r.reply_text}</p>
                </div>
            ))}

            {replying ? (
                <form onSubmit={submit} className="mt-3">
                    <RichTextArea
                        rows={3}
                        value={data.reply_text}
                        onChange={(v) => setData('reply_text', v)}
                        placeholder="Write a reply…"
                        className="w-full rounded-lg border border-border p-3 text-sm focus:border-primary focus:shadow-glow focus:outline-none"
                    />
                    <div className="mt-2 flex gap-2">
                        <button type="submit" disabled={processing} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover disabled:opacity-50">
                            Send Reply
                        </button>
                        <button type="button" onClick={() => setReplying(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-bold uppercase text-text hover:border-primary">
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <button onClick={() => setReplying(true)} className="mt-3 text-sm font-bold uppercase text-primary hover:underline">
                    {question.replies.length > 0 ? 'Add Another Reply' : 'Reply'}
                </button>
            )}
        </div>
    );
}
