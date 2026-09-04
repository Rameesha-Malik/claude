import { Head, Link } from '@inertiajs/react';
import RevealOnScroll from '@/Components/RevealOnScroll';
import SectionKicker from '@/Components/SectionKicker';
import PublicLayout from '@/Layouts/PublicLayout';

interface PackageItem {
    id: number; name: string; description: string | null; price: string;
    validity_days: number | null; course: { id: number; title: string } | null;
}
interface FaqItem { question: string; answer: string }

const STEPS = [
    { title: 'Register', description: 'Create your free account in under a minute.' },
    { title: 'Choose a Package', description: 'Pick the course and package that fits your target exam.' },
    { title: 'Pay', description: 'Bank Transfer, Easypaisa, or JazzCash — details shown at checkout.' },
    { title: 'Admin Activates', description: 'We verify your payment and activate access, usually within a day.' },
    { title: 'Start Learning', description: 'Full access to lectures, notes, and practice tests unlocks instantly.' },
];

const PAYMENT_METHODS = [
    { name: 'Bank Transfer', description: 'Transfer to our academy account and share the receipt.' },
    { name: 'Easypaisa', description: 'Send payment directly via the Easypaisa app.' },
    { name: 'JazzCash', description: 'Send payment directly via the JazzCash app.' },
];

export default function HowToBuy({ packages, faqs }: { packages: PackageItem[]; faqs: FaqItem[] }) {
    return (
        <PublicLayout>
            <Head title="How to Buy" />

            <section className="relative overflow-hidden bg-gradient-to-br from-secondary to-teal-950 py-20 text-center text-white">
                <div className="relative mx-auto max-w-container px-4 sm:px-6 lg:px-8">
                    <SectionKicker dark><span className="mx-auto">Get Started</span></SectionKicker>
                    <h1 className="font-display text-5xl uppercase tracking-wide sm:text-6xl">How to Buy</h1>
                    <p className="mx-auto mt-4 max-w-xl text-teal-200">
                        Five simple steps from registration to your first lesson.
                    </p>
                    <Link
                        href="/register"
                        className="mt-8 inline-block rounded-full bg-accent px-8 py-4 text-sm font-bold uppercase tracking-wide text-accent-fg shadow-lg transition-all duration-normal ease-spring hover:-translate-y-0.5 hover:bg-accent-hover"
                    >
                        Register Now
                    </Link>
                </div>
            </section>

            <section className="mx-auto max-w-container px-4 py-20 sm:px-6 lg:px-8">
                <RevealOnScroll className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
                    {STEPS.map((step, i) => (
                        <div key={i} className="relative rounded-2xl border border-border bg-surface p-6">
                            <div className="mb-3 font-display text-4xl text-gold-700">0{i + 1}</div>
                            <h3 className="font-bold text-text">{step.title}</h3>
                            <p className="mt-1 text-sm text-text-secondary">{step.description}</p>
                        </div>
                    ))}
                </RevealOnScroll>
            </section>

            {packages.length > 0 && (
                <section className="bg-surface-sunken py-20">
                    <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
                        <RevealOnScroll className="mx-auto mb-12 max-w-2xl text-center">
                            <SectionKicker>Pricing</SectionKicker>
                            <h2 className="font-display text-4xl uppercase tracking-wide text-text sm:text-5xl">Packages</h2>
                        </RevealOnScroll>
                        <RevealOnScroll className="overflow-x-auto rounded-2xl border border-border bg-surface">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-border bg-surface-sunken">
                                    <tr>
                                        <th className="px-6 py-4 font-bold uppercase tracking-wide text-text-secondary">Package</th>
                                        <th className="px-6 py-4 font-bold uppercase tracking-wide text-text-secondary">Course</th>
                                        <th className="px-6 py-4 font-bold uppercase tracking-wide text-text-secondary">Validity</th>
                                        <th className="px-6 py-4 text-right font-bold uppercase tracking-wide text-text-secondary">Price</th>
                                        <th className="px-6 py-4" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {packages.map((pkg) => (
                                        <tr key={pkg.id}>
                                            <td className="px-6 py-4 font-semibold text-text">{pkg.name}</td>
                                            <td className="px-6 py-4 text-text-secondary">{pkg.course?.title}</td>
                                            <td className="px-6 py-4 text-text-secondary">
                                                {pkg.validity_days ? `${pkg.validity_days} days` : 'Lifetime'}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-primary">
                                                Rs. {Number(pkg.price).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {pkg.course && (
                                                    <Link href={`/courses/${pkg.course.id}`} className="font-semibold text-primary hover:underline">
                                                        View &rarr;
                                                    </Link>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </RevealOnScroll>
                    </div>
                </section>
            )}

            <section className="mx-auto max-w-container px-4 py-20 sm:px-6 lg:px-8">
                <RevealOnScroll className="mx-auto mb-12 max-w-2xl text-center">
                    <SectionKicker>Payment</SectionKicker>
                    <h2 className="font-display text-4xl uppercase tracking-wide text-text sm:text-5xl">Payment Methods</h2>
                </RevealOnScroll>
                <RevealOnScroll className="grid gap-6 sm:grid-cols-3">
                    {PAYMENT_METHODS.map((method, i) => (
                        <div key={i} className="rounded-2xl border border-border bg-surface p-6 text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-subtle text-primary">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 6h18v12H3V6zm4 8h4" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-text">{method.name}</h3>
                            <p className="mt-1 text-sm text-text-secondary">{method.description}</p>
                        </div>
                    ))}
                </RevealOnScroll>
            </section>

            {faqs.length > 0 && (
                <section className="bg-surface-sunken py-20">
                    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                        <RevealOnScroll className="mb-10 text-center">
                            <h2 className="font-display text-3xl uppercase tracking-wide text-text">Refunds & Access</h2>
                        </RevealOnScroll>
                        <div className="divide-y divide-border rounded-2xl border border-border bg-surface">
                            {faqs.map((faq, i) => (
                                <div key={i} className="px-6 py-5">
                                    <div className="font-semibold text-text">{faq.question}</div>
                                    <div className="mt-1 text-sm text-text-secondary">{faq.answer}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <section className="mx-auto max-w-container px-4 pb-24 pt-20 sm:px-6 lg:px-8">
                <RevealOnScroll className="rounded-3xl bg-surface-brand p-10 text-center sm:p-16">
                    <h2 className="font-display text-4xl uppercase tracking-wide text-secondary sm:text-5xl">
                        Ready to Get Started?
                    </h2>
                    <p className="mx-auto mt-3 max-w-md text-text-secondary">
                        Register in under a minute and pick your package from the pricing above.
                    </p>
                    <Link
                        href="/register"
                        className="mt-8 inline-block rounded-full bg-secondary px-10 py-4 text-sm font-bold uppercase tracking-wide text-on-secondary shadow-lg transition-all duration-normal ease-spring hover:-translate-y-0.5 hover:bg-teal-800"
                    >
                        Register Now
                    </Link>
                </RevealOnScroll>
            </section>
        </PublicLayout>
    );
}
