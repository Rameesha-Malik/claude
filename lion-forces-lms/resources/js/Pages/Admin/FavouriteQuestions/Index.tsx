import { Head, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

interface FavRow {
    id: number; created_at: string;
    question: { id: number; question_text: string; subject: { name: string } | null } | null;
    user: { name: string; email: string } | null;
}
interface SubjectOption { id: number; name: string }
interface Props {
    favourites: { data: FavRow[]; links: { url: string | null; label: string; active: boolean }[] };
    subjects: SubjectOption[];
    filters: { search?: string; subject_id?: string };
}

export default function FavouriteQuestionsIndex({ favourites, subjects, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function submit(e: FormEvent) {
        e.preventDefault();
        router.get('/admin/favourite-questions', { ...filters, search: search || undefined }, { preserveState: true });
    }

    function setSubject(subjectId: string) {
        router.get('/admin/favourite-questions', { ...filters, subject_id: subjectId || undefined }, { preserveState: true });
    }

    return (
        <AdminLayout header="Favourite Questions">
            <Head title="Favourite Questions" />

            <div className="mb-4 rounded-3xl border border-border bg-surface p-6">
                <p className="mb-1 font-bold text-text">All questions that students have marked as favourites.</p>
                <p className="mb-4 text-sm text-text-secondary">Filter by student, question ID, or subject.</p>
                <div className="flex flex-wrap gap-3">
                    <form onSubmit={submit} className="flex flex-1 gap-2">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Student name, email, or Question ID…"
                            className="flex-1 rounded-lg border border-border px-3 py-2.5 text-sm"
                        />
                        <button type="submit" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-on-primary hover:bg-primary-hover">Search</button>
                    </form>
                    <select
                        value={filters.subject_id ?? ''}
                        onChange={(e) => setSubject(e.target.value)}
                        className="rounded-lg border border-border px-3 py-2.5 text-sm"
                    >
                        <option value="">All subjects</option>
                        {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
                <table className="w-full min-w-[640px] text-left text-sm">
                    <thead className="border-b border-border bg-surface-sunken text-xs uppercase tracking-wide text-text-muted">
                        <tr>
                            <th className="px-5 py-3">Question</th>
                            <th className="px-5 py-3">Student</th>
                            <th className="px-5 py-3">Saved</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {favourites.data.map((f) => (
                            <tr key={f.id}>
                                <td className="max-w-md px-5 py-3">
                                    <div className="line-clamp-2 font-medium text-text">{f.question?.question_text ?? '(deleted question)'}</div>
                                    {f.question?.subject && <div className="text-xs text-text-muted">{f.question.subject.name}</div>}
                                </td>
                                <td className="px-5 py-3">
                                    <div className="font-medium text-text">{f.user?.name}</div>
                                    <div className="text-xs text-text-muted">{f.user?.email}</div>
                                </td>
                                <td className="px-5 py-3 text-text-secondary">{new Date(f.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {favourites.data.length === 0 && <p className="py-10 text-center text-text-secondary">No favourites yet.</p>}

            <div className="mt-6 flex flex-wrap justify-center gap-2">
                {favourites.links.map((link, i) => (
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
