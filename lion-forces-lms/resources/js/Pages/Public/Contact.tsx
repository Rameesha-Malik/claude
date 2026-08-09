import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import { PageProps } from '@/types';

interface FaqItem { question: string; answer: string }

export default function Contact({ faqs }: { faqs: FaqItem[] }) {
    const { site } = usePage<PageProps>().props;
    const { data, setData, post, processing, errors, wasSuccessful, reset } = useForm({
        name: '', email: '', phone: '', subject: '', message: '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post('/contact', { onSuccess: () => reset() });
    }

    return (
        <PublicLayout>
            <Head title="Contact Us" />

            <section className="bg-surface-brand py-16 text-center">
                <h1 className="text-4xl font-bold text-secondary">Contact Us</h1>
                <p className="mx-auto mt-3 max-w-xl text-text-secondary">
                    Have a question or feedback? Send us a message and we'll get back to you as soon as possible.
                </p>
            </section>

            <section className="mx-auto grid max-w-container gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
                <div>
                    <h2 className="text-xl font-semibold text-text">Reach us directly</h2>
                    <div className="mt-4 space-y-4">
                        {site.supportEmail && (
                            <div>
                                <div className="text-sm font-medium text-text-muted">Email</div>
                                <a href={`mailto:${site.supportEmail}`} className="text-primary hover:underline">{site.supportEmail}</a>
                            </div>
                        )}
                        <div>
                            <div className="text-sm font-medium text-text-muted">Office</div>
                            <div className="text-text">{site.officeLocation}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-text-muted">Hours</div>
                            <div className="text-text">{site.officeHours}</div>
                        </div>
                    </div>

                    {faqs.length > 0 && (
                        <div className="mt-10">
                            <h2 className="text-xl font-semibold text-text">Common Questions</h2>
                            <div className="mt-4 space-y-4">
                                {faqs.map((faq, i) => (
                                    <div key={i}>
                                        <div className="font-medium text-text">{faq.question}</div>
                                        <div className="text-sm text-text-secondary">{faq.answer}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-text">Send a message</h2>
                    <p className="text-sm text-text-secondary">We typically reply within a day</p>

                    {wasSuccessful && (
                        <div className="mt-4 rounded-lg bg-success-bg px-4 py-3 text-sm text-success">
                            Your message has been sent. We'll be in touch soon.
                        </div>
                    )}

                    <form onSubmit={submit} className="mt-4 space-y-4">
                        <Field label="Name" error={errors.name}>
                            <input value={data.name} onChange={(e) => setData('name', e.target.value)} className="input" />
                        </Field>
                        <Field label="Email" error={errors.email}>
                            <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="input" />
                        </Field>
                        <Field label="Subject" error={errors.subject}>
                            <input value={data.subject} onChange={(e) => setData('subject', e.target.value)} className="input" />
                        </Field>
                        <Field label="Message" error={errors.message}>
                            <textarea rows={4} value={data.message} onChange={(e) => setData('message', e.target.value)} className="input" />
                        </Field>
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-lg bg-primary py-3 font-semibold text-on-primary transition-colors hover:bg-primary-hover disabled:opacity-60"
                        >
                            Send message
                        </button>
                    </form>
                </div>
            </section>

            <style>{`.input { width: 100%; border: 1px solid var(--color-border); border-radius: 0.5rem; padding: 0.625rem 0.875rem; font-size: 0.875rem; }
                .input:focus { outline: none; border-color: var(--color-primary); box-shadow: var(--shadow-glow); }`}</style>
        </PublicLayout>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-text">{label}</label>
            {children}
            {error && <div className="mt-1 text-xs text-danger">{error}</div>}
        </div>
    );
}
