import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import StudentLayout from '@/Layouts/StudentLayout';

interface CourseItem { id: number; title: string }
interface Props {
    alreadyEnrolled?: 'active' | 'pending';
    bundle: { id?: number; title: string; slug: string; price?: string; description?: string | null };
    courses?: CourseItem[];
    payment?: { bankDetails: string | null; easypaisaNumber: string | null; jazzcashNumber: string | null };
}

const METHODS = [
    { key: 'bank_transfer' as const, label: 'Bank Transfer', detailsKey: 'bankDetails' as const },
    { key: 'easypaisa' as const, label: 'Easypaisa', detailsKey: 'easypaisaNumber' as const },
    { key: 'jazzcash' as const, label: 'JazzCash', detailsKey: 'jazzcashNumber' as const },
];

export default function BundleCheckout({ alreadyEnrolled, bundle, courses = [], payment }: Props) {
    if (alreadyEnrolled) {
        return (
            <StudentLayout header="Checkout">
                <Head title="Checkout" />
                <div className="mx-auto max-w-lg rounded-2xl border border-border bg-surface p-8 text-center">
                    <h2 className="font-bold text-text">
                        {alreadyEnrolled === 'active' ? "You're already enrolled" : 'Purchase pending verification'}
                    </h2>
                    <p className="mt-2 text-sm text-text-secondary">
                        {alreadyEnrolled === 'active'
                            ? `You already have active access to every course in ${bundle.title}.`
                            : `We've received your payment for ${bundle.title} and it's awaiting verification, usually within a day.`}
                    </p>
                    <Link href="/portal/my-courses" className="mt-6 inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover">
                        View My Courses
                    </Link>
                </div>
            </StudentLayout>
        );
    }

    const availableMethods = METHODS.filter((m) => payment?.[m.detailsKey]);

    const { data, setData, post, processing, errors } = useForm<{
        method: string;
        reference_number: string;
        proof_file: File | null;
    }>({
        method: availableMethods[0]?.key ?? '',
        reference_number: '',
        proof_file: null,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post(`/portal/bundles/${bundle.slug}/checkout`, { forceFormData: true });
    }

    return (
        <StudentLayout header="Checkout">
            <Head title="Checkout" />

            <div className="mx-auto grid max-w-3xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-2xl border border-border bg-surface p-6">
                    <h2 className="font-bold text-text">{bundle.title}</h2>
                    {bundle.description && <p className="mt-1 text-sm text-text-secondary">{bundle.description}</p>}

                    <p className="mt-5 text-sm font-semibold text-text">Includes {courses.length} courses</p>
                    <ul className="mt-2 space-y-1.5">
                        {courses.map((c) => (
                            <li key={c.id} className="flex items-center gap-2 text-sm text-text-secondary">
                                <span className="text-success">✓</span> {c.title}
                            </li>
                        ))}
                    </ul>

                    <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                        <span className="text-sm font-semibold text-text">Total</span>
                        <span className="font-display text-2xl text-primary">{bundle.price ? `Rs. ${Number(bundle.price).toLocaleString()}` : '—'}</span>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-surface p-6">
                    <h2 className="font-bold text-text">Pay &amp; Submit Proof</h2>

                    {availableMethods.length === 0 ? (
                        <p className="mt-3 text-sm text-text-secondary">
                            Payment methods haven't been configured yet — please contact us directly to arrange payment.
                        </p>
                    ) : (
                        <form onSubmit={submit} className="mt-4 space-y-4">
                            <div>
                                <p className="text-sm font-semibold text-text">Payment method</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {availableMethods.map((m) => (
                                        <button
                                            type="button"
                                            key={m.key}
                                            onClick={() => setData('method', m.key)}
                                            className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${
                                                data.method === m.key ? 'bg-primary text-on-primary' : 'bg-surface-sunken text-text-secondary hover:bg-primary-subtle'
                                            }`}
                                        >
                                            {m.label}
                                        </button>
                                    ))}
                                </div>
                                {availableMethods.map((m) => data.method === m.key && payment?.[m.detailsKey] && (
                                    <div key={m.key} className="mt-3 whitespace-pre-line rounded-lg bg-surface-sunken p-3 text-sm text-text">
                                        {payment[m.detailsKey]}
                                    </div>
                                ))}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-text">Transaction / Reference number (optional)</label>
                                <input
                                    type="text"
                                    value={data.reference_number}
                                    onChange={(e) => setData('reference_number', e.target.value)}
                                    className="w-full rounded-lg border-border bg-surface px-3.5 py-2.5 text-sm text-text shadow-xs focus:border-primary focus:shadow-glow focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-text">Payment screenshot / receipt</label>
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,application/pdf"
                                    onChange={(e) => setData('proof_file', e.target.files?.[0] ?? null)}
                                    className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text file:mr-3 file:rounded-md file:border-0 file:bg-primary-subtle file:px-3 file:py-1.5 file:text-xs file:font-bold file:uppercase file:text-primary"
                                />
                                {errors.proof_file && <div className="mt-1 text-xs text-danger">{errors.proof_file}</div>}
                            </div>

                            <button
                                type="submit"
                                disabled={processing || !data.proof_file}
                                className="w-full rounded-lg bg-gradient-to-r from-secondary to-primary py-3 text-sm font-bold uppercase tracking-wide text-on-primary shadow-lg transition-all duration-normal hover:shadow-xl disabled:opacity-50"
                            >
                                {processing ? 'Submitting…' : 'Submit Payment'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </StudentLayout>
    );
}
