import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import CloseButton from '@/Components/CloseButton';
import RichTextArea from '@/Components/RichTextArea';
import AdminLayout from '@/Layouts/AdminLayout';

interface PageRow { id: number; title: string; slug: string; content: string | null; is_published: boolean; show_in_header: boolean; show_in_footer: boolean }
interface Props { pages: PageRow[] }

function PageModal({ page, onClose }: { page: PageRow | null; onClose: () => void }) {
    const form = useForm({
        title: page?.title ?? '',
        content: page?.content ?? '',
        is_published: page?.is_published ?? true,
        show_in_header: page?.show_in_header ?? false,
        show_in_footer: page?.show_in_footer ?? false,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        if (page) form.put(`/admin/pages/${page.id}`, { onSuccess: onClose });
        else form.post('/admin/pages', { onSuccess: onClose });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-bold text-text">{page ? 'Edit Page' : 'Add Page'}</h2>
                    <CloseButton onClick={onClose} />
                </div>
                <form onSubmit={submit} className="space-y-3">
                    <input placeholder="Title (e.g. Privacy Policy)" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
                    {form.errors.title && <p className="text-xs text-danger">{form.errors.title}</p>}
                    <RichTextArea rows={8} className="w-full rounded-lg border border-border px-3 py-2 text-sm" value={form.data.content} onChange={(v) => form.setData('content', v)} />
                    <label className="flex items-center gap-2 text-sm text-text">
                        <input type="checkbox" checked={form.data.is_published} onChange={(e) => form.setData('is_published', e.target.checked)} />
                        Published
                    </label>
                    <div className="rounded-lg border border-dashed border-border p-3">
                        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">Show a link to this page in...</p>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-sm text-text">
                                <input type="checkbox" checked={form.data.show_in_header} onChange={(e) => form.setData('show_in_header', e.target.checked)} />
                                Header Menu
                            </label>
                            <label className="flex items-center gap-2 text-sm text-text">
                                <input type="checkbox" checked={form.data.show_in_footer} onChange={(e) => form.setData('show_in_footer', e.target.checked)} />
                                Footer Menu
                            </label>
                        </div>
                        {!form.data.is_published && (form.data.show_in_header || form.data.show_in_footer) && (
                            <p className="mt-2 text-xs text-warning">Won't actually appear until this page is Published.</p>
                        )}
                    </div>
                    <button type="submit" disabled={form.processing} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-bold uppercase text-on-primary hover:bg-primary-hover disabled:opacity-50">
                        {form.processing ? 'Saving…' : page ? 'Save Changes' : 'Add Page'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function PagesIndex({ pages }: Props) {
    const [modalPage, setModalPage] = useState<PageRow | null | undefined>(undefined);

    function destroy(p: PageRow) {
        if (confirm(`Delete "${p.title}"?`)) {
            router.delete(`/admin/pages/${p.id}`, { preserveScroll: true });
        }
    }

    return (
        <AdminLayout header="Pages">
            <Head title="Pages" />

            <p className="mb-4 text-sm text-text-secondary">
                Static content pages (Privacy Policy, Terms &amp; Conditions, etc.). Check "Header Menu" or "Footer
                Menu" on a page to add it to the site's navigation automatically.
            </p>

            <div className="mb-4">
                <button onClick={() => setModalPage(null)} className="rounded-xl bg-secondary px-5 py-2.5 text-sm font-bold uppercase text-on-secondary hover:bg-teal-800">
                    + Add Page
                </button>
            </div>

            <div className="space-y-2">
                {pages.map((p) => (
                    <div key={p.id} className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4">
                        <div>
                            <p className="font-semibold text-text">{p.title}</p>
                            <Link href={`/pages/${p.slug}`} target="_blank" className="text-xs text-primary hover:underline">/pages/{p.slug}</Link>
                        </div>
                        <div className="flex items-center gap-3">
                            {p.show_in_header && <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-xs font-bold text-primary">In Header</span>}
                            {p.show_in_footer && <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-xs font-bold text-primary">In Footer</span>}
                            <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${p.is_published ? 'bg-success-bg text-success' : 'bg-surface-sunken text-text-muted'}`}>
                                {p.is_published ? 'Published' : 'Draft'}
                            </span>
                            <button onClick={() => setModalPage(p)} className="text-xs font-bold uppercase text-primary hover:underline">Edit</button>
                            <button onClick={() => destroy(p)} className="text-xs font-bold uppercase text-danger hover:underline">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {pages.length === 0 && (
                <div className="mt-4 rounded-3xl border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                    No pages yet.
                </div>
            )}

            {modalPage !== undefined && <PageModal page={modalPage} onClose={() => setModalPage(undefined)} />}
        </AdminLayout>
    );
}
