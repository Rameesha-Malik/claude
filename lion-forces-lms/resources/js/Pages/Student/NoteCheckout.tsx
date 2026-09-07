import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import StudentLayout from '@/Layouts/StudentLayout';

interface Props {
    note: { id: number; title: string; price: string };
    alreadyRequested?: 'pending' | 'verified';
    payment?: { bankDetails: string | null; easypaisaNumber: string | null; jazzcashNumber: string | null };
}

const METHODS = [
    { key: 'bank_transfer' as const, label: 'Bank Transfer', detailsKey: 'bankDetails' as const },
    { key: 'easypaisa' as const, label: 'Easypaisa', detailsKey: 'easypaisaNumber' as const },
    { key: 'jazzcash' as const, label: 'JazzCash', detailsKey: 'jazzcashNumber' as const },
];

export default function NoteCheckout({ note, alreadyRequested, payment }: Props) {
    if (alreadyRequested) {
        return (
            <StudentLayout header="Note Checkout">
                <Head title="Note Checkout" />
                <div className="mx-auto max-w-lg rounded-2xl border border-border bg-surface p-8 text-center">
                    <h2 className="font-bold text-text">
                        {alreadyRequested === 'verified' ? "You've already unlocked this note" : 'Purchase pending verification'}
                    </h2>
                    <p className="mt-2 text-sm text-text-secondary">
                        {alreadyRequested === 'verified'
                            ? `You already have access to "${note.title}".`
                            : `We've received your payment for "${note.title}" and it's awaiting verification, usually within a day.`}
                    </p>
                    <Link href="/notes" className="mt-6 inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover">
                        Back to Notes
                    </Link>
                </div>
            </StudentLayout>
        );
    }

    const availableMethods = METHODS.filter((m) => payment?.[m.detailsKey]);

    const { data, setData, post, processing, errors } = useForm<{
        method: string; reference_number: string; proof_file: File | null;
    }>({
        method: availableMethods[0]?.key ?? '',
        reference_number: '',
        proof_file: null,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post(`/portal/notes/${note.id}/purchase`, { forceFormData: true });
    }

    return (
        <StudentLayout header="Note Checkout">
            <Head title="Note Checkout" />

            <div className="mx-auto grid max-w-3xl gap-6 lg:grid-cols-[1fr_1.1fr]">
                <div className="rounded-2xl border border-border bg-surface p-6">
                    <h2 className="font-bold text-text">{note.title}</h2>
                    <p className="text-sm text-text-secondary">A one-time purchase unlocks this note permanently.</p>
                    <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                        <span className="text-sm font-semibold text-text">Total</span>
                        <span className="font-display text-2xl text-primary">Rs. {Number(note.price).toLocaleString()}</span>
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
