import { Head, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

interface NoteRow {
    id: number; note_text: string; created_at: string;
    question: { id: number; question_text: string } | null;
    user: { name: string; email: string } | null;
}
interface Props {
    notes: { data: NoteRow[]; links: { url: string | null; label: string; active: boolean }[] };
    filters: { search?: string };
}

export default function StudentQuestionNotesIndex({ notes, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function submitSearch(e: FormEvent) {
        e.preventDefault();
        router.get('/admin/student-question-notes', { search: search || undefined }, { preserveState: true });
    }

    return (
        <AdminLayout header="Student MCQ Notes">
            <Head title="Student MCQ Notes" />

            <p className="mb-4 text-sm text-text-secondary">Admin can review personal notes created by students per MCQ.</p>

            <form onSubmit={submitSearch} className="mb-4 flex gap-2">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by note, student, or question ID…"
                    className="flex-1 rounded-lg border border-border px-3 py-2.5 text-sm"
                />
                <button type="submit" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-on-primary hover:bg-primary-hover">Search</button>
            </form>

            <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
                <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="border-b border-border bg-surface-sunken text-xs uppercase tracking-wide text-text-muted">
                        <tr>
                            <th className="px-5 py-3">Student</th>
                            <th className="px-5 py-3">Question</th>
                            <th className="px-5 py-3">Note</th>
                            <th className="px-5 py-3">Saved</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {notes.data.map((n) => (
                            <tr key={n.id}>
                                <td className="px-5 py-3">
                                    <div className="font-medium text-text">{n.user?.name}</div>
                                    <div className="text-xs text-text-muted">{n.user?.email}</div>
                                </td>
                                <td className="max-w-xs px-5 py-3">
                                    <div className="line-clamp-2 text-text-secondary">{n.question?.question_text ?? '(deleted question)'}</div>
                                    <div className="text-xs text-text-muted">ID: {n.question?.id}</div>
                                </td>
                                <td className="max-w-sm px-5 py-3 text-text-secondary">{n.note_text}</td>
                                <td className="px-5 py-3 text-text-muted">{new Date(n.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {notes.data.length === 0 && <p className="py-10 text-center text-text-secondary">No student notes found.</p>}

            <div className="mt-6 flex flex-wrap justify-center gap-2">
                {notes.links.map((link, i) => (
                    <button
                        key={i}
                        disabled={!link.url}
                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                        className={`rounded-lg px-4 py-2 text-sm ${link.active ? 'bg-primary text-on-primary' : 'bg-surface text-text-secondary hover:bg-primary-subtle'} disabled:opacity-40`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}
            </div>
        </AdminLayout>
    );
}
