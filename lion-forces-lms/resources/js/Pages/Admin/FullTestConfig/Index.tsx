import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

interface CourseOption { id: number; title: string }
interface TestRow { id: number; title: string; is_active: boolean; stages_count: number; course: CourseOption | null }
interface Props { tests: TestRow[]; courses: CourseOption[] }

const inputClass = 'w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-primary focus:shadow-glow focus:outline-none';

export default function FullTestConfigIndex({ tests, courses }: Props) {
    const form = useForm({ title: 'New Test', course_id: '' as number | '', is_active: true });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post('/admin/full-test-config', { onSuccess: () => form.reset() });
    }

    function destroy(t: TestRow) {
        if (confirm(`Delete "${t.title}"? This removes all its stages.`)) {
            router.delete(`/admin/full-test-config/${t.id}`);
        }
    }

    return (
        <AdminLayout header="Full Test Config">
            <Head title="Full Test Config" />

            <div className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-border bg-gradient-to-br from-primary-subtle to-surface p-6 sm:p-8">
                <div>
                    <h1 className="font-display text-2xl text-text">Full Test Config</h1>
                    <p className="mt-1 max-w-xl text-sm text-text-secondary">
                        Create tests and define stages. Add questions to each stage. Users progress only when passing marks
                        are achieved.
                    </p>
                </div>
                <Link href="/admin/leaderboard" className="flex-shrink-0 rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-bold uppercase text-text hover:border-primary hover:text-primary">
                    🏆 Leaderboard
                </Link>
            </div>

            <div className="mb-6 rounded-2xl border border-border bg-surface p-6">
                <h2 className="mb-3 font-bold text-text">New test</h2>
                <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
                    <div className="min-w-[220px] flex-1">
                        <label className="mb-1 block text-sm font-medium text-text">Name</label>
                        <input className={inputClass} value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} />
                    </div>
                    <div className="min-w-[220px] flex-1">
                        <label className="mb-1 block text-sm font-medium text-text">Course (optional)</label>
                        <select className={inputClass} value={form.data.course_id} onChange={(e) => form.setData('course_id', e.target.value ? Number(e.target.value) : '')}>
                            <option value="">None</option>
                            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                    </div>
                    <label className="flex items-center gap-2 pb-2.5 text-sm text-text">
                        <input type="checkbox" checked={form.data.is_active} onChange={(e) => form.setData('is_active', e.target.checked)} />
                        Active
                    </label>
                    <button type="submit" disabled={form.processing} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold uppercase text-on-primary hover:bg-primary-hover disabled:opacity-50">
                        Create
                    </button>
                </form>
            </div>

            <div className="space-y-3">
                {tests.map((t) => (
                    <div key={t.id} className="rounded-2xl border border-border bg-surface p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-.98.626-1.813 1.5-2.122" />
                                    </svg>
                                </span>
                                <div>
                                    <h3 className="font-semibold text-text">{t.title}</h3>
                                    <p className="text-sm text-text-secondary">{t.course?.title ?? 'No course'} · {t.stages_count} stage(s)</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${t.is_active ? 'bg-success-bg text-success' : 'bg-surface-sunken text-text-muted'}`}>
                                    {t.is_active ? 'Active' : 'Inactive'}
                                </span>
                                <Link href={`/admin/full-test-config/${t.id}/edit`} className="rounded-lg border border-border px-4 py-2 text-sm font-bold text-text hover:border-primary hover:text-primary">
                                    ⚙ Edit &amp; stages
                                </Link>
                                <button onClick={() => destroy(t)} className="text-xs font-bold uppercase text-danger hover:underline">Delete</button>
                            </div>
                        </div>
                        {t.stages_count === 0 && (
                            <p className="mt-2 text-sm font-semibold text-warning">No stages yet. Edit this test and add stages.</p>
                        )}
                    </div>
                ))}
                {tests.length === 0 && <p className="text-sm text-text-secondary">No tests yet.</p>}
            </div>
        </AdminLayout>
    );
}
