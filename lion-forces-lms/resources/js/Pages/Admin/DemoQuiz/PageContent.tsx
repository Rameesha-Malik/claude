import { Head, Link, useForm } from '@inertiajs/react';
import Icon from '@/Components/Icon';
import LiteMarkdown from '@/Components/LiteMarkdown';
import RichTextArea from '@/Components/RichTextArea';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';

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

            <AdminPageHeader
                title="Demo Page Content"
                description="Edit the hero text shown on the public Demo Quiz page (/demo-quiz)."
                right={
                    <a href="/demo-quiz" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-bold text-text hover:border-primary hover:text-primary">
                        View demo page ↗
                    </a>
                }
            />

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
                    <RichTextArea
                        value={form.data.subtitle}
                        onChange={(v) => form.setData('subtitle', v)}
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
                <p className="mb-4 flex items-center gap-1.5 font-bold text-text">
                    <Icon d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" className="h-4 w-4" /> Preview
                </p>
                <div className="rounded-2xl bg-secondary p-10 text-center text-white">
                    <h3 className="font-display text-2xl uppercase tracking-wide">{form.data.title || 'Free Demo Quizzes'}</h3>
                    <LiteMarkdown text={form.data.subtitle} className="mx-auto mt-3 max-w-lg text-sm text-teal-200" />
                    <p className="mt-4 text-xs text-teal-300">{totalQuestions} questions across active demo quizzes</p>
                </div>
            </div>

            <p className="mt-4 text-xs text-text-muted">
                Manage the demo quizzes themselves (and their categories) from <Link href="/admin/demo-quiz" className="font-semibold text-primary hover:underline">Demo Quizzes</Link>.
            </p>
        </AdminLayout>
    );
}
