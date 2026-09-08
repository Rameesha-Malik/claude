import { Head, Link } from '@inertiajs/react';
import RevealOnScroll from '@/Components/RevealOnScroll';
import SectionKicker from '@/Components/SectionKicker';
import PublicLayout from '@/Layouts/PublicLayout';

interface BundleItem {
    id: number; title: string; slug: string; description: string | null; price: string; thumbnail_path: string | null;
    courses: { id: number; title: string; base_price: string | null }[];
}

export default function Bundles({ bundles }: { bundles: BundleItem[] }) {
    return (
        <PublicLayout>
            <Head title="Bundles" />

            <section className="relative overflow-hidden bg-gradient-to-br from-secondary to-teal-950 py-20 text-center text-white">
                <div className="relative mx-auto max-w-container px-4 sm:px-6 lg:px-8">
                    <SectionKicker dark><span className="mx-auto">Prep for More Than One</span></SectionKicker>
                    <h1 className="font-display text-5xl uppercase tracking-wide sm:text-6xl">Bundles</h1>
                    <p className="mx-auto mt-4 max-w-xl text-teal-200">
                        Preparing for more than one service test? Save by getting access to several courses in one purchase.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-container px-4 py-20 sm:px-6 lg:px-8">
                {bundles.length === 0 ? (
                    <p className="text-center text-text-secondary">No bundles available right now — check back soon.</p>
                ) : (
                    <RevealOnScroll staggerMs={60} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {bundles.map((b) => {
                            const individualTotal = b.courses.reduce((sum, c) => sum + Number(c.base_price ?? 0), 0);
                            const savings = individualTotal - Number(b.price);
                            return (
                                <div
                                    key={b.id}
                                    className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-sm transition-all duration-normal hover:-translate-y-1 hover:border-primary hover:shadow-xl"
                                >
                                    <div className="relative h-32 bg-gradient-to-br from-teal-600 via-teal-800 to-teal-950">
                                        {b.thumbnail_path ? (
                                            <img src={`/storage/${b.thumbnail_path}`} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full items-center justify-center font-display text-xl uppercase tracking-widest text-white">
                                                {b.courses.length} Courses
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-1 flex-col p-6">
                                        <h3 className="font-display text-lg uppercase tracking-wide text-text group-hover:text-primary">{b.title}</h3>
                                        {b.description && <p className="mt-2 line-clamp-2 flex-1 text-sm text-text-secondary">{b.description}</p>}
                                        <ul className="mt-3 space-y-1">
                                            {b.courses.map((c) => (
                                                <li key={c.id} className="text-xs text-text-secondary">• {c.title}</li>
                                            ))}
                                        </ul>
                                        <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
                                            <div>
                                                <p className="text-xs uppercase tracking-wide text-text-muted">Bundle Price</p>
                                                <p className="font-display text-2xl text-primary">Rs. {Number(b.price).toLocaleString()}</p>
                                                {savings > 0 && <p className="text-xs font-semibold text-success">Save Rs. {savings.toLocaleString()}</p>}
                                            </div>
                                            <Link
                                                href={`/bundles/${b.slug}`}
                                                className="rounded-full bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wide text-on-primary shadow-sm transition-all duration-fast hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-md"
                                            >
                                                View Bundle
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </RevealOnScroll>
                )}
            </section>
        </PublicLayout>
    );
}
