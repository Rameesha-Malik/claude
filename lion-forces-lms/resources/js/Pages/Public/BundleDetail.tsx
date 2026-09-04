import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';

interface Course { id: number; title: string; slug: string; base_price: string | null; short_description: string | null }
interface Bundle {
    id: number; title: string; slug: string; description: string | null; price: string; thumbnail_path: string | null;
    courses: Course[];
}

export default function BundleDetail({ bundle }: { bundle: Bundle }) {
    const individualTotal = bundle.courses.reduce((sum, c) => sum + Number(c.base_price ?? 0), 0);
    const savings = individualTotal - Number(bundle.price);

    return (
        <PublicLayout>
            <Head title={bundle.title} />

            <section className="bg-gradient-to-br from-secondary to-teal-950 py-20 text-text-inverse">
                <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wide text-on-primary">
                        {bundle.courses.length}-Course Bundle
                    </span>
                    <h1 className="mt-4 font-display text-5xl uppercase tracking-wide">{bundle.title}</h1>
                    {bundle.description && <p className="mt-3 max-w-2xl text-teal-200">{bundle.description}</p>}
                </div>
            </section>

            <section className="mx-auto grid max-w-container gap-10 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8">
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-semibold text-text">Included Courses</h2>
                    <div className="mt-4 space-y-3">
                        {bundle.courses.map((c) => (
                            <Link
                                key={c.id}
                                href={`/courses/${c.slug}`}
                                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-5 transition-all duration-normal hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
                            >
                                <div>
                                    <h3 className="font-semibold text-text">{c.title}</h3>
                                    {c.short_description && <p className="mt-1 text-sm text-text-secondary">{c.short_description}</p>}
                                </div>
                                <span className="flex-shrink-0 text-sm text-text-muted">
                                    {c.base_price ? `Rs. ${Number(c.base_price).toLocaleString()}` : ''}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="h-fit rounded-2xl border border-border bg-surface p-6">
                    <p className="text-xs uppercase tracking-wide text-text-muted">Bundle Price</p>
                    <p className="mt-1 font-display text-4xl text-primary">Rs. {Number(bundle.price).toLocaleString()}</p>
                    {savings > 0 && (
                        <p className="mt-1 text-sm font-semibold text-success">
                            Rs. {savings.toLocaleString()} cheaper than buying each course separately.
                        </p>
                    )}
                    <Link
                        href="/how-to-buy"
                        className="mt-5 block w-full rounded-full bg-primary py-3 text-center text-sm font-bold uppercase tracking-wide text-on-primary shadow-sm transition-all duration-fast hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-md"
                    >
                        Enroll Now
                    </Link>
                </div>
            </section>
        </PublicLayout>
    );
}
