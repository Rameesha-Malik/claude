import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Props {
    content: { title: string; subtitle: string };
    totalQuestions: number;
}

export default function DemoQuizPageContent({ content, totalQuestions }: Props) {
    const form = useForm({ title: content.title, subtitle: content.subtitle });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.put('/admin/demo-quiz/page-content');
    }

    return (
        <AdminLayout header="Demo Page Content">
            <Head title="Demo Page Content" />

            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div className="flex gap-4">
                    <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary text-on-primary">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                        </svg>
                    </span>
                    <div>
                        <h1 className="font-display text-2xl text-text">Demo Page Content</h1>
                        <p className="mt-1 max-w-xl text-sm text-text-secondary">
                            Edit the hero text shown on the public Demo Quiz page (/demo-quiz).
                        </p>
                    </div>
                </div>
                <a href="/demo-quiz" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-bold text-text hover:border-primary hover:text-primary">
                    View demo page ↗
                </a>
            </div>

            <form onSubmit={submit} className="rounded-3xl border border-border bg-surface p-6">
                <h2 className="mb-4 font-bold text-text">Hero section</h2>

                <div className="mb-4">
                    <label className="mb-1 block text-sm font-medium text-text">Page title</label>
                    <input
                        value={form.data.title}
                        onChange={(e) => form.setData('title', e.target.value)}
                        className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-text-muted">
                        Only shown when more than one demo quiz is active (the category-card view). A single active quiz shows that quiz's own title instead.
                    </p>
                    {form.errors.title && <p className="mt-1 text-xs text-danger">{form.errors.title}</p>}
                </div>

                <div className="mb-2">
                    <label className="mb-1 block text-sm font-medium text-text">Subtitle / description</label>
                    <textarea
                        value={form.data.subtitle}
                        onChange={(e) => form.setData('subtitle', e.target.value)}
                        rows={3}
                        className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-text-muted">Shown below the title on the public page.</p>
                    {form.errors.subtitle && <p className="mt-1 text-xs text-danger">{form.errors.subtitle}</p>}
                </div>

                <div className="mt-6 flex justify-end border-t border-border pt-4">
                    <button type="submit" disabled={form.processing} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold uppercase text-on-primary hover:bg-primary-hover disabled:opacity-50">
                        {form.processing ? 'Saving…' : 'Save changes'}
                    </button>
                </div>
            </form>

            <div className="mt-6 rounded-3xl border border-border bg-surface-sunken p-6">
                <p className="mb-4 flex items-center gap-1.5 font-bold text-text">👁 Preview</p>
                <div className="rounded-2xl bg-gradient-to-br from-teal-700 via-teal-800 to-teal-950 p-10 text-center text-white">
                    <h3 className="font-display text-2xl uppercase tracking-wide">{form.data.title || 'Free Demo Quizzes'}</h3>
                    <p className="mx-auto mt-3 max-w-lg text-sm text-teal-200">{form.data.subtitle}</p>
                    <p className="mt-4 text-xs text-teal-300">{totalQuestions} questions across active demo quizzes</p>
                </div>
            </div>

            <p className="mt-4 text-xs text-text-muted">
                Manage the demo quizzes themselves (and their categories) from <Link href="/admin/demo-quiz" className="font-semibold text-primary hover:underline">Demo Quizzes</Link>.
            </p>
        </AdminLayout>
    );
}
