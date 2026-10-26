import { Head } from '@inertiajs/react';
import LiteMarkdown from '@/Components/LiteMarkdown';
import PublicLayout from '@/Layouts/PublicLayout';

interface Props { page: { title: string; content: string | null } }

export default function StaticPage({ page }: Props) {
    return (
        <PublicLayout>
            <Head title={page.title} />

            <section className="bg-gradient-to-br from-secondary to-teal-950 py-16 text-white">
                <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
                    <h1 className="font-display text-4xl uppercase tracking-wide sm:text-5xl">{page.title}</h1>
                </div>
            </section>

            <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
                {page.content ? (
                    <LiteMarkdown text={page.content} className="text-text-secondary" />
                ) : (
                    <p className="text-text-secondary">This page has no content yet.</p>
                )}
            </section>
        </PublicLayout>
    );
}
