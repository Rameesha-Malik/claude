import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';
import { MailIcon, PersonIcon } from '@/Components/AuthIcons';
import { PhoneIcon, TagIcon } from '@/Components/ContactFieldIcons';
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

// Client: "many things are animated here" (21st.dev Contact reference) --
// that reference's hand-drawn globe graphic would need a new illustration
// asset; this gives the same "quiet ambient motion anchoring the contact
// info column" effect with two counter-rotating dashed rings around the
// mail icon instead, built from the same sonar/orbit motif already used
// elsewhere this session (GradientMesh's ping rings) rather than a one-off.
function OrbitDecoration() {
    return (
        <div aria-hidden className="relative mx-auto mt-10 hidden h-48 w-48 items-center justify-center lg:flex">
            <style>{`
                @keyframes orbit-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes orbit-spin-reverse { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
                .orbit-ring-outer { animation: orbit-spin 50s linear infinite; }
                .orbit-ring-inner { animation: orbit-spin-reverse 36s linear infinite; }
                @media (prefers-reduced-motion: reduce) {
                    .orbit-ring-outer, .orbit-ring-inner { animation: none; }
                }
            `}</style>
            <span className="orbit-ring-outer absolute inset-0 rounded-full border border-dashed border-border">
                <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-gold-400 shadow-md" />
            </span>
            <span className="orbit-ring-inner absolute inset-8 rounded-full border border-dashed border-primary/40">
                <span className="absolute -left-1.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-primary shadow-md" />
            </span>
            <span className="absolute inset-16 rounded-full bg-primary-subtle" />
            <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg">
                <MailIcon className="h-6 w-6" />
            </span>
        </div>
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

            <section className="relative overflow-hidden bg-secondary py-20 text-center">
                <div
                    aria-hidden
                    className="absolute inset-0 opacity-[0.15]"
                    style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.7) 1.5px, transparent 1.5px)', backgroundSize: '20px 20px' }}
                />
                <GradientMesh className="opacity-70" />

                <div className="relative mx-auto max-w-container px-4 sm:px-6 lg:px-8">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-teal-200">
                        We're here to help
                    </span>
                    <h1 className="mt-5 font-display text-5xl uppercase tracking-wide text-white">Get in Touch</h1>
                    <p className="mx-auto mt-3 max-w-xl text-teal-200">
                        Have a question or feedback? Send us a message and we'll get back to you as soon as possible.
                    </p>

                    <div className="relative mx-auto mt-10 flex max-w-md flex-wrap items-center justify-center gap-4">
                        {site.supportEmail && (
                            <div className="flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-left">
                                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
                                    <MailIcon className="h-4 w-4" />
                                </span>
                                <div>
                                    <p className="text-[0.65rem] uppercase tracking-wide text-teal-300">Email Us</p>
                                    <p className="text-xs font-semibold text-white">{site.supportEmail}</p>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-left">
                            {/* Explicit gold, not bg-accent/text-accent-fg -- this icon sits in a
                                card on the dark hero, and accent now means oxblood (light-surface),
                                which would barely show here. */}
                            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gold-400 text-secondary">
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
                {/* Client: a large dead gap was opening up below "Send Message"
                    -- the two columns sat in a CSS grid, which stretches both
                    items to match the taller one by default, and the left
                    column was artificially tall because the whole FAQ list
                    was stuffed inside its narrow 0.85fr width. Moved FAQs out
                    to their own full-width section below (also just reads
                    better wider than squeezed into a sidebar), and items-start
                    stops any remaining height mismatch from stretching either
                    card. */}
                <div className="grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr]">
                    <RevealOnScroll className="min-w-0">
                        <SectionKicker>Reach Us Directly</SectionKicker>
                        <h2 className="font-display text-3xl uppercase tracking-wide text-text">Contact Details</h2>

                        <RevealOnScroll staggerMs={60} className="mt-6 space-y-3">
                            {site.supportEmail && (
                                <a
                                    href={`mailto:${site.supportEmail}`}
                                    className="flex items-center gap-3 rounded-[1rem] border border-border bg-surface p-4 transition-all duration-fast hover:-translate-y-0.5 hover:border-primary hover:bg-primary-subtle hover:shadow-md"
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
                                <div className="flex items-center gap-3 rounded-[1rem] border border-border bg-surface p-4 transition-all duration-fast hover:-translate-y-0.5 hover:shadow-md">
                                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                                        <PinIcon />
                                    </span>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Office</p>
                                        <p className="text-sm font-medium text-text">{site.officeLocation}</p>
                                    </div>
                                </div>
                            )}
                            {site.officeHours && (
                                <div className="flex items-center gap-3 rounded-[1rem] border border-border bg-surface p-4 transition-all duration-fast hover:-translate-y-0.5 hover:shadow-md">
                                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-surface-sunken text-text-secondary">
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
                                    className="flex items-center gap-3 rounded-[1rem] border border-border bg-surface p-4 transition-all duration-fast hover:-translate-y-0.5 hover:border-primary hover:bg-primary-subtle hover:shadow-md"
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
                        </RevealOnScroll>

                        <OrbitDecoration />
                    </RevealOnScroll>

                    <RevealOnScroll className="relative min-w-0 overflow-hidden rounded-[1.5rem] border border-border bg-surface p-6 shadow-xl sm:p-8">
                        {/* Same decorative corner blob already used on other feature
                            cards sitewide (CTA footer banner, etc), just in primary
                            teal instead of oxblood since this card sits on a plain
                            light section, not a branded-accent one. */}
                        <div
                            aria-hidden
                            className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rotate-12 rounded-[2rem] opacity-[0.06]"
                            style={{ backgroundColor: 'var(--color-primary)' }}
                        />
                        <h2 className="relative font-display text-2xl uppercase tracking-wide text-text">Send a Message</h2>
                        <p className="relative text-sm text-text-secondary">We typically reply within a day.</p>

                        {wasSuccessful && (
                            <div className="relative mt-4 rounded-[0.75rem] bg-success-bg px-4 py-3 text-sm text-success">
                                Your message has been sent. We'll be in touch soon.
                            </div>
                        )}

                        <form onSubmit={submit} className="relative mt-6 space-y-4">
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
                                {/* Client: the Bold/Italic/Heading toolbar made sense for site
                                    content an admin writes, not a one-off inquiry a visitor is
                                    typing here -- plain textarea only for this field. */}
                                <textarea
                                    rows={4}
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    className="w-full rounded-[0.75rem] border-border bg-surface py-3 px-4 text-sm text-text shadow-xs transition-shadow duration-fast focus:border-primary focus:shadow-glow focus:outline-none"
                                />
                            </Field>
                            <button
                                type="submit"
                                disabled={processing}
                                className="group flex w-full items-center justify-center gap-2 rounded-[1rem] bg-gradient-to-r from-secondary to-primary py-3.5 text-sm font-bold uppercase tracking-wide text-on-primary shadow-lg transition-all duration-normal ease-spring hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:shadow-glow disabled:opacity-50 disabled:hover:translate-y-0"
                            >
                                {processing ? 'Sending…' : 'Send Message'}
                                {!processing && (
                                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 transition-transform duration-fast group-hover:translate-x-0.5">
                                        <path d="M11.3 3.3a1 1 0 011.4 0l5 5a1 1 0 010 1.4l-5 5a1 1 0 11-1.4-1.4L14.6 10H4a1 1 0 010-2h10.6l-3.3-3.3a1 1 0 010-1.4z" />
                                    </svg>
                                )}
                            </button>
                        </form>
                    </RevealOnScroll>
                </div>
            </section>

            {faqs.length > 0 && (
                <section className="bg-surface-sunken py-20">
                    <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
                        <RevealOnScroll className="mx-auto mb-10 max-w-2xl text-center">
                            <SectionKicker>Common Questions</SectionKicker>
                            <h2 className="font-display text-4xl uppercase tracking-wide text-text sm:text-5xl">FAQs</h2>
                        </RevealOnScroll>
                        <RevealOnScroll className="mx-auto max-w-3xl divide-y divide-border overflow-hidden rounded-[1.5rem] border border-border bg-surface">
                            {faqs.map((faq, i) => (
                                <FaqAccordionItem key={i} question={faq.question} answer={faq.answer} />
                            ))}
                        </RevealOnScroll>
                    </div>
                </section>
            )}
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
