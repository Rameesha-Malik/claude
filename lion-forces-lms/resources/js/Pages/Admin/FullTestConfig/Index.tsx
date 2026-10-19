import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import Icon from '@/Components/Icon';
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
                <Link href="/admin/leaderboard" className="flex flex-shrink-0 items-center gap-1.5 rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-bold uppercase text-text hover:border-primary hover:text-primary">
                    <Icon d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" className="h-4 w-4" /> Leaderboard
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
                                <Link href={`/admin/full-test-config/${t.id}/edit`} className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-bold text-text hover:border-primary hover:text-primary">
                                    <Icon d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z M15 12a3 3 0 11-6 0 3 3 0 016 0z" className="h-4 w-4" /> Edit &amp; stages
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
