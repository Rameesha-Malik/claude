import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';
import { MailIcon, PersonIcon } from '@/Components/AuthIcons';
import { PhoneIcon, TagIcon } from '@/Components/ContactFieldIcons';
import FaqAccordionItem from '@/Components/FaqAccordionItem';
import GradientMesh from '@/Components/GradientMesh';
import RevealOnScroll from '@/Components/RevealOnScroll';
import SectionKicker from '@/Components/SectionKicker';
import WaveRibbon from '@/Components/WaveRibbon';
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
// asset; this gives the same "quiet ambient motion" effect with two
// counter-rotating dashed rings around the mail icon instead, built from
// the sonar/orbit motif already established this session (GradientMesh's
// ping rings) rather than a one-off. Dark-glass variant: this now lives
// inside the immersive dark hero/content canvas, not a light card.
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
            <span className="orbit-ring-outer absolute inset-0 rounded-full border border-dashed border-white/20">
                <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-gold-400 shadow-md" />
            </span>
            <span className="orbit-ring-inner absolute inset-8 rounded-full border border-dashed border-teal-300/40">
                <span className="absolute -left-1.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-teal-300 shadow-md" />
            </span>
            <span className="absolute inset-16 rounded-full bg-white/10" />
            <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gold-400 text-secondary shadow-lg">
                <MailIcon className="h-6 w-6" />
            </span>
        </div>
    );
}

// Modern floating-label field: label sits inline with the value at rest and
// floats up small once focused or filled -- the `placeholder=" "` (a real
// space, not empty) is what makes the `:placeholder-shown` pseudo-class
// correctly track "is this empty", which the label position is driven off
// via the peer-* variants. Dark-glass styled for the hero canvas this now
// lives in; built locally rather than extended onto the shared IconTextInput
// (used in its plain light form everywhere else in the app) to avoid
// changing that component's look on every other page.
function FloatingField({
    id, label, type = 'text', value, onChange, error, optional = false,
}: {
    id: string; label: string; type?: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; error?: string; optional?: boolean;
}) {
    return (
        <div>
            <div className="relative">
                <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder=" "
                    className="peer w-full rounded-[0.75rem] border border-white/15 bg-white/5 px-4 pb-2.5 pt-5 text-sm text-white shadow-inner transition-colors duration-fast placeholder-shown:pt-3.5 placeholder:text-transparent focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <label
                    htmlFor={id}
                    className="pointer-events-none absolute left-4 top-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-teal-300 transition-all duration-fast peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-white/50 peer-focus:top-1.5 peer-focus:text-[0.7rem] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-wide peer-focus:text-primary-subtle"
                >
                    {label}{optional && ' (optional)'}
                </label>
            </div>
            {error && <div className="mt-1 text-xs text-red-300">{error}</div>}
        </div>
    );
}

function FloatingTextarea({
    id, label, value, onChange, error,
}: {
    id: string; label: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; error?: string;
}) {
    return (
        <div>
            <div className="relative">
                <textarea
                    id={id}
                    rows={4}
                    value={value}
                    onChange={onChange}
                    placeholder=" "
                    className="peer w-full resize-none rounded-[0.75rem] border border-white/15 bg-white/5 px-4 pb-3 pt-6 text-sm text-white shadow-inner transition-colors duration-fast placeholder-shown:pt-4 placeholder:text-transparent focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <label
                    htmlFor={id}
                    className="pointer-events-none absolute left-4 top-2 text-[0.7rem] font-semibold uppercase tracking-wide text-teal-300 transition-all duration-fast peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-white/50 peer-focus:top-2 peer-focus:text-[0.7rem] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-wide peer-focus:text-primary-subtle"
                >
                    {label}
                </label>
            </div>
            {error && <div className="mt-1 text-xs text-red-300">{error}</div>}
        </div>
    );
}

// Draws itself in on mount (stroke-dasharray trick) instead of just
// appearing -- replaces the flat success banner with something that
// actually feels like confirmation.
function SuccessCheck() {
    return (
        <div className="relative flex items-center gap-3 rounded-[0.75rem] border border-success/30 bg-success-bg px-4 py-3 text-sm text-success">
            <svg viewBox="0 0 24 24" className="h-5 w-5 flex-shrink-0" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path
                    d="M7.5 12.5l3 3 6-6.5"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ strokeDasharray: 20, strokeDashoffset: 20, animation: 'draw-check 0.5s 0.15s ease-out forwards' }}
                />
            </svg>
            <style>{`@keyframes draw-check { to { stroke-dashoffset: 0; } }`}</style>
            Your message has been sent. We'll be in touch soon.
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

            {/* Client: "change it into a best UI ever" -- rebuilt as one
                immersive dark canvas (hero copy + contact details + the form
                all living together over the same gradient-mesh/dot-grid
                background) instead of a dark hero band followed by a
                separate plain-white content section. Both panels are glass
                cards (white/5-10 + border-white/15, the same idiom this
                page's hero pills already used) floating on that canvas. */}
            <section className="relative overflow-hidden bg-secondary pb-14 pt-20 text-center sm:pb-20">
                <div
                    aria-hidden
                    className="absolute inset-0 opacity-[0.15]"
                    style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.7) 1.5px, transparent 1.5px)', backgroundSize: '20px 20px' }}
                />
                <GradientMesh className="opacity-70" />
                {/* Client: wide gutters either side of the centered headline read as
                    dead space on large screens -- this flowing line (the same motif
                    used on the Demo Quiz / Practice Tests heroes) fills that full-bleed
                    width, not just the max-w-container column the text sits in. */}
                <div aria-hidden className="absolute inset-x-0 top-0 h-[26rem] overflow-hidden sm:h-[30rem]">
                    <WaveRibbon className="opacity-60" />
                </div>

                <div className="relative mx-auto max-w-container px-4 sm:px-6 lg:px-8">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-teal-200">
                        We're here to help
                    </span>
                    <h1 className="mt-5 font-display text-5xl uppercase tracking-wide text-white">Get in Touch</h1>
                    <p className="mx-auto mt-3 max-w-xl text-teal-200">
                        Have a question or feedback? Send us a message and we'll get back to you as soon as possible.
                    </p>
                </div>

                <div className="relative mx-auto mt-14 grid max-w-container items-start gap-6 px-4 text-left sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
                    <RevealOnScroll className="min-w-0 rounded-[1.5rem] border border-white/15 bg-white/5 p-6 shadow-2xl backdrop-blur-sm sm:p-8">
                        <SectionKicker dark>Reach Us Directly</SectionKicker>
                        <h2 className="font-display text-2xl uppercase tracking-wide text-white">Contact Details</h2>

                        <RevealOnScroll staggerMs={60} className="mt-6 space-y-3">
                            {site.supportEmail && (
                                <a
                                    href={`mailto:${site.supportEmail}`}
                                    className="flex items-center gap-3 rounded-[1rem] border border-white/15 bg-white/5 p-4 transition-all duration-fast hover:-translate-y-0.5 hover:border-primary hover:bg-white/10 hover:shadow-lg"
                                >
                                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-teal-200">
                                        <MailIcon />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-teal-300">Email</p>
                                        <p className="truncate text-sm font-medium text-white">{site.supportEmail}</p>
                                    </div>
                                </a>
                            )}
                            {site.officeLocation && (
                                <div className="flex items-center gap-3 rounded-[1rem] border border-white/15 bg-white/5 p-4 transition-all duration-fast hover:-translate-y-0.5 hover:shadow-lg">
                                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-teal-200">
                                        <PinIcon />
                                    </span>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-teal-300">Office</p>
                                        <p className="text-sm font-medium text-white">{site.officeLocation}</p>
                                    </div>
                                </div>
                            )}
                            {site.officeHours && (
                                <div className="flex items-center gap-3 rounded-[1rem] border border-white/15 bg-white/5 p-4 transition-all duration-fast hover:-translate-y-0.5 hover:shadow-lg">
                                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-teal-200">
                                        <ClockIcon />
                                    </span>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-teal-300">Hours</p>
                                        <p className="text-sm font-medium text-white">{site.officeHours}</p>
                                    </div>
                                </div>
                            )}
                            {site.whatsappEnabled && site.whatsappNumber && (
                                <a
                                    href={`https://wa.me/${site.whatsappNumber.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 rounded-[1rem] border border-white/15 bg-white/5 p-4 transition-all duration-fast hover:-translate-y-0.5 hover:border-primary hover:bg-white/10 hover:shadow-lg"
                                >
                                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#25D366]/15 text-[#25D366]">
                                        <PhoneIcon />
                                    </span>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-teal-300">WhatsApp</p>
                                        <p className="text-sm font-medium text-white">{site.whatsappNumber}</p>
                                    </div>
                                </a>
                            )}
                        </RevealOnScroll>

                        <OrbitDecoration />
                    </RevealOnScroll>

                    <RevealOnScroll className="relative min-w-0 overflow-hidden rounded-[1.5rem] border border-white/15 bg-white/5 p-6 shadow-2xl backdrop-blur-sm sm:p-8">
                        <div
                            aria-hidden
                            className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rotate-12 rounded-[2rem] bg-gold-400 opacity-[0.08]"
                        />
                        <h2 className="relative font-display text-2xl uppercase tracking-wide text-white">Send a Message</h2>
                        <p className="relative text-sm text-teal-200">We typically reply within a day.</p>

                        {wasSuccessful && (
                            <div className="relative mt-4">
                                <SuccessCheck />
                            </div>
                        )}

                        <form onSubmit={submit} className="relative mt-6 space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FloatingField id="name" label="Full Name" value={data.name} onChange={(e) => setData('name', e.target.value)} error={errors.name} />
                                <FloatingField id="email" type="email" label="Email Address" value={data.email} onChange={(e) => setData('email', e.target.value)} error={errors.email} />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FloatingField id="phone" type="tel" label="Phone" optional value={data.phone} onChange={(e) => setData('phone', e.target.value)} error={errors.phone} />
                                <FloatingField id="subject" label="Subject" value={data.subject} onChange={(e) => setData('subject', e.target.value)} error={errors.subject} />
                            </div>
                            {/* Client: the Bold/Italic/Heading toolbar made sense for site
                                content an admin writes, not a one-off inquiry a visitor is
                                typing here -- plain textarea only for this field. */}
                            <FloatingTextarea id="message" label="Message" value={data.message} onChange={(e) => setData('message', e.target.value)} error={errors.message} />
                            <button
                                type="submit"
                                disabled={processing}
                                className="group flex w-full items-center justify-center gap-2 rounded-[1rem] bg-gradient-to-r from-gold-400 to-gold-300 py-3.5 text-sm font-bold uppercase tracking-wide text-secondary shadow-lg transition-all duration-normal ease-spring hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gold-300/50 disabled:opacity-50 disabled:hover:translate-y-0"
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
                <section className="bg-surface-sunken pb-20 pt-14">
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
