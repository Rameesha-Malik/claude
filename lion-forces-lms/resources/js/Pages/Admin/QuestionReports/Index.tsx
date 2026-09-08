import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

interface ReportRow {
    id: number; reason: string; status: string; created_at: string;
    question: { id: number; question_text: string; subject: { name: string } | null } | null;
    user: { name: string; email: string } | null;
}
interface Props {
    reports: { data: ReportRow[]; links: { url: string | null; label: string; active: boolean }[] };
    status: string;
    pendingCount: number;
}

export default function QuestionReportsIndex({ reports, status, pendingCount }: Props) {
    return (
        <AdminLayout header="Reported Questions">
            <Head title="Reported Questions" />

            <p className="mb-4 text-sm text-text-secondary">
                Questions candidates flagged as wrong, broken, or confusing while attempting a demo quiz, quiz, practice
                test, mock exam, or staged test.
                {pendingCount > 0 && <span className="ml-1 font-semibold text-warning">{pendingCount} awaiting review.</span>}
            </p>

            <div className="mb-4 flex gap-2">
                {['pending', 'resolved', 'dismissed', 'all'].map((s) => (
                    <button
                        key={s}
                        onClick={() => router.get('/admin/reported-questions', { status: s }, { preserveState: true })}
                        className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize ${status === s ? 'bg-primary text-on-primary' : 'bg-surface text-text-secondary hover:bg-primary-subtle'}`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
                <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="border-b border-border bg-surface-sunken text-xs uppercase tracking-wide text-text-muted">
                        <tr>
                            <th className="px-5 py-3">Question</th>
                            <th className="px-5 py-3">Reported By</th>
                            <th className="px-5 py-3">Reason</th>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {reports.data.map((r) => (
                            <tr key={r.id}>
                                <td className="max-w-xs px-5 py-3">
                                    <div className="line-clamp-2 font-medium text-text">{r.question?.question_text ?? '(deleted question)'}</div>
                                    {r.question?.subject && <div className="text-xs text-text-muted">{r.question.subject.name}</div>}
                                </td>
                                <td className="px-5 py-3">
                                    {r.user ? (
                                        <>
                                            <div className="font-medium text-text">{r.user.name}</div>
                                            <div className="text-xs text-text-muted">{r.user.email}</div>
                                        </>
                                    ) : <span className="text-text-muted">Guest (demo quiz)</span>}
                                </td>
                                <td className="max-w-xs px-5 py-3 text-text-secondary">{r.reason}</td>
                                <td className="px-5 py-3">
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${
                                        r.status === 'resolved' ? 'bg-success-bg text-success' : r.status === 'pending' ? 'bg-warning-bg text-warning' : 'bg-surface-sunken text-text-muted'
                                    }`}>{r.status}</span>
                                </td>
                                <td className="px-5 py-3 text-right">
                                    {r.status === 'pending' && (
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => router.post(`/admin/reported-questions/${r.id}/resolve`)} className="text-xs font-bold uppercase text-success hover:underline">Resolve</button>
                                            <button onClick={() => router.post(`/admin/reported-questions/${r.id}/dismiss`)} className="text-xs font-bold uppercase text-danger hover:underline">Dismiss</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {reports.data.length === 0 && <p className="py-10 text-center text-text-secondary">No reports found.</p>}

            <div className="mt-6 flex flex-wrap justify-center gap-2">
                {reports.links.map((link, i) => (
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
