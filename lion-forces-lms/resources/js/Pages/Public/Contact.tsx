import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';
import { MailIcon, PersonIcon } from '@/Components/AuthIcons';
import { MessageIcon, PhoneIcon, TagIcon } from '@/Components/ContactFieldIcons';
import FaqAccordionItem from '@/Components/FaqAccordionItem';
import GradientMesh from '@/Components/GradientMesh';
import IconTextInput from '@/Components/IconTextInput';
import RevealOnScroll from '@/Components/RevealOnScroll';
import SectionKicker from '@/Components/SectionKicker';
import PublicLayout from '@/Layouts/PublicLayout';
import { PageProps } from '@/types';

interface FaqItem { question: string; answer: string }

function ClockIcon({ className = 'h-5 w-5' }: { className?: string }) {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className={className}>
            <circle cx="10" cy="10" r="7.5" />
            <path strokeLinecap="round" d="M10 5.5V10l3 2" />
        </svg>
    );
}

function PinIcon({ className = 'h-5 w-5' }: { className?: string }) {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 18s6-5.5 6-10a6 6 0 10-12 0c0 4.5 6 10 6 10z" />
            <circle cx="10" cy="8" r="2.2" />
        </svg>
    );
}

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

            <section className="relative overflow-hidden bg-gradient-to-br from-secondary to-teal-950 py-20 text-center">
                <div
                    aria-hidden
                    className="absolute inset-0 opacity-[0.15]"
                    style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.7) 1.5px, transparent 1.5px)', backgroundSize: '20px 20px' }}
                />
                <GradientMesh className="opacity-70" />

                <div className="relative mx-auto max-w-container px-4 sm:px-6 lg:px-8">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-teal-200 backdrop-blur-sm">
                        We're here to help
                    </span>
                    <h1 className="mt-5 font-display text-5xl uppercase tracking-wide text-white">Get in Touch</h1>
                    <p className="mx-auto mt-3 max-w-xl text-teal-200">
                        Have a question or feedback? Send us a message and we'll get back to you as soon as possible.
                    </p>

                    <div className="relative mx-auto mt-10 flex max-w-md flex-wrap items-center justify-center gap-4">
                        {site.supportEmail && (
                            <div className="flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2.5 text-left backdrop-blur-sm">
                                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
                                    <MailIcon className="h-4 w-4" />
                                </span>
                                <div>
                                    <p className="text-[0.65rem] uppercase tracking-wide text-teal-300">Email Us</p>
                                    <p className="max-w-[10rem] truncate text-xs font-semibold text-white">{site.supportEmail}</p>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2.5 text-left backdrop-blur-sm">
                            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent text-accent-fg">
                                <ClockIcon className="h-4 w-4" />
                            </span>
                            <div>
                                <p className="text-[0.65rem] uppercase tracking-wide text-teal-300">Response Time</p>
                                <p className="text-xs font-semibold text-white">Within a day</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-container px-4 py-20 sm:px-6 lg:px-8">
                <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
                    <RevealOnScroll className="min-w-0">
                        <SectionKicker>Reach Us Directly</SectionKicker>
                        <h2 className="font-display text-3xl uppercase tracking-wide text-text">Contact Details</h2>

                        <div className="mt-6 space-y-3">
                            {site.supportEmail && (
                                <a
                                    href={`mailto:${site.supportEmail}`}
                                    className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-colors duration-fast hover:border-primary hover:bg-primary-subtle"
                                >
                                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary">
                                        <MailIcon />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Email</p>
                                        <p className="truncate text-sm font-medium text-text">{site.supportEmail}</p>
                                    </div>
                                </a>
                            )}
                            {site.officeLocation && (
                                <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
                                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary">
                                        <PinIcon />
                                    </span>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Office</p>
                                        <p className="text-sm font-medium text-text">{site.officeLocation}</p>
                                    </div>
                                </div>
                            )}
                            {site.officeHours && (
                                <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
                                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary">
                                        <ClockIcon />
                                    </span>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Hours</p>
                                        <p className="text-sm font-medium text-text">{site.officeHours}</p>
                                    </div>
                                </div>
                            )}
                            {site.whatsappEnabled && site.whatsappNumber && (
                                <a
                                    href={`https://wa.me/${site.whatsappNumber.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-colors duration-fast hover:border-primary hover:bg-primary-subtle"
                                >
                                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366]">
                                        <PhoneIcon />
                                    </span>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">WhatsApp</p>
                                        <p className="text-sm font-medium text-text">{site.whatsappNumber}</p>
                                    </div>
                                </a>
                            )}
                        </div>

                        {faqs.length > 0 && (
                            <div className="mt-10">
                                <SectionKicker>Common Questions</SectionKicker>
                                <h2 className="font-display text-3xl uppercase tracking-wide text-text">FAQs</h2>
                                <div className="mt-4 divide-y divide-border rounded-2xl border border-border bg-surface">
                                    {faqs.map((faq, i) => (
                                        <FaqAccordionItem key={i} question={faq.question} answer={faq.answer} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </RevealOnScroll>

                    <RevealOnScroll className="min-w-0 rounded-3xl border border-border bg-surface p-6 shadow-xl sm:p-8">
                        <h2 className="font-display text-2xl uppercase tracking-wide text-text">Send a Message</h2>
                        <p className="text-sm text-text-secondary">We typically reply within a day.</p>

                        {wasSuccessful && (
                            <div className="mt-4 rounded-lg bg-success-bg px-4 py-3 text-sm text-success">
                                Your message has been sent. We'll be in touch soon.
                            </div>
                        )}

                        <form onSubmit={submit} className="mt-6 space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field label="Name" error={errors.name}>
                                    <IconTextInput icon={<PersonIcon />} value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                </Field>
                                <Field label="Email" error={errors.email}>
                                    <IconTextInput type="email" icon={<MailIcon />} value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                </Field>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field label="Phone (optional)" error={errors.phone}>
                                    <IconTextInput type="tel" icon={<PhoneIcon />} value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                                </Field>
                                <Field label="Subject" error={errors.subject}>
                                    <IconTextInput icon={<TagIcon />} value={data.subject} onChange={(e) => setData('subject', e.target.value)} />
                                </Field>
                            </div>
                            <Field label="Message" error={errors.message}>
                                <div className="relative">
                                    <span className="pointer-events-none absolute left-0 top-3 flex items-center pl-3.5 text-text-muted">
                                        <MessageIcon />
                                    </span>
                                    <textarea
                                        rows={4}
                                        value={data.message}
                                        onChange={(e) => setData('message', e.target.value)}
                                        className="w-full rounded-lg border-border bg-surface py-3 pl-11 pr-4 text-sm text-text shadow-xs transition-shadow duration-fast focus:border-primary focus:shadow-glow focus:outline-none"
                                    />
                                </div>
                            </Field>
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-lg bg-gradient-to-r from-secondary to-primary py-3.5 text-sm font-bold uppercase tracking-wide text-on-primary shadow-lg transition-all duration-normal hover:shadow-xl focus:outline-none focus:shadow-glow disabled:opacity-50"
                            >
                                {processing ? 'Sending…' : 'Send Message'}
                            </button>
                        </form>
                    </RevealOnScroll>
                </div>
            </section>
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
