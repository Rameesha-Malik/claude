import { Head, router } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';

interface ResourceItem { id: number; title: string; category: string | null; description: string | null; file_path: string | null; external_link: string | null }
interface Props {
    resources: { data: ResourceItem[]; links: { url: string | null; label: string; active: boolean }[] };
}

export default function Resources({ resources }: Props) {
    return (
        <PublicLayout>
            <Head title="Resources" />

            <section className="bg-gradient-to-br from-secondary to-teal-950 py-20 text-center">
                <h1 className="font-display text-5xl uppercase tracking-wide text-white">Resources</h1>
                <p className="mx-auto mt-3 max-w-xl text-teal-200">
                    Free study material: syllabi, past papers, and preparation guides.
                </p>
            </section>

            <section className="mx-auto max-w-container px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {resources.data.map((r) => (
                        <div key={r.id} className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                            {r.category && (
                                <span className="mb-3 inline-block rounded-full bg-primary-subtle px-3 py-1 text-xs font-semibold text-primary">
                                    {r.category}
                                </span>
                            )}
                            <h3 className="font-semibold text-text">{r.title}</h3>
                            <p className="mt-1 text-sm text-text-secondary">{r.description}</p>
                            {(r.file_path || r.external_link) && (
                                <a
                                    href={r.file_path ?? r.external_link ?? '#'}
                                    className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
                                >
                                    Download &rarr;
                                </a>
                            )}
                        </div>
                    ))}
                </div>

                {resources.data.length === 0 && (
                    <p className="py-16 text-center text-text-secondary">No resources published yet.</p>
                )}

                <div className="mt-10 flex flex-wrap justify-center gap-2">
                    {resources.links.map((link, i) => (
                        <button
                            key={i}
                            disabled={!link.url}
                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                            className={`rounded-lg px-4 py-2 text-sm ${link.active ? 'bg-primary text-on-primary' : 'bg-surface text-text-secondary hover:bg-primary-subtle'} disabled:opacity-40`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </section>
        </PublicLayout>
    );
}
