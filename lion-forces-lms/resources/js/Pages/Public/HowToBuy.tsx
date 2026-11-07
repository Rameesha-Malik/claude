import { Head, Link, usePage } from '@inertiajs/react';
import { CheckCircleIcon, PersonIcon } from '@/Components/AuthIcons';
import { PhoneIcon, TagIcon } from '@/Components/ContactFieldIcons';
import LiteMarkdown from '@/Components/LiteMarkdown';
import RevealOnScroll from '@/Components/RevealOnScroll';
import SectionKicker from '@/Components/SectionKicker';
import PublicLayout from '@/Layouts/PublicLayout';
import { PageProps } from '@/types';

interface PackageItem {
    id: number; name: string; description: string | null; price: string;
    validity_days: number | null; course: { id: number; title: string; slug: string } | null;
}
interface FaqItem { question: string; answer: string }

// Bilingual (English + Urdu) so a visitor reading in either language sees
// the real process -- client feedback specifically: notes reach students
// via the mobile app, lectures via the website, and the WhatsApp-screenshot
// step (not a generic "we'll verify it") is what actually happens. Shown
// directly on the page rather than as a popup, per that same feedback.
const STEPS = [
    {
        title: 'Register',
        en: 'Create your free account in under a minute.',
        ur: 'ایک منٹ سے بھی کم وقت میں اپنا مفت اکاؤنٹ بنائیں۔',
    },
    {
        title: 'Choose a Package',
        en: 'Pick the course and package that fits your target exam.',
        ur: 'اپنے ٹارگٹ امتحان کے مطابق کورس اور پیکج منتخب کریں۔',
    },
    {
        title: 'Pay',
        en: 'Pay via Bank Transfer, Easypaisa, or JazzCash. Details shown at checkout.',
        ur: 'بینک ٹرانسفر، ایزی پیسہ یا جاز کیش کے ذریعے ادائیگی کریں۔ تفصیلات چیک آؤٹ پر دکھائی جائیں گی۔',
    },
    {
        title: 'Send Screenshot on WhatsApp',
        en: 'Send us a screenshot of your payment receipt on WhatsApp.',
        ur: 'اپنی ادائیگی کی رسید کا اسکرین شاٹ ہمیں واٹس ایپ پر بھیجیں۔',
    },
    {
        title: 'Verified in 1 Hour',
        en: 'We confirm your payment and activate your access, usually within 1 hour.',
        ur: 'ہم آپ کی ادائیگی کی تصدیق کر کے 1 گھنٹے میں آپ کی رسائی فعال کر دیتے ہیں۔',
    },
    {
        title: 'Start Preparing',
        en: 'Notes are available on our mobile app, and lectures on the website.',
        ur: 'نوٹس ہماری موبائل ایپ پر اور لیکچرز ویب سائٹ پر دستیاب ہوتے ہیں۔',
    },
];

function CardIcon({ className = 'h-5 w-5' }: { className?: string }) {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className={className}>
            <rect x="2.5" y="5" width="15" height="10" rx="1.75" />
            <path strokeLinecap="round" d="M2.5 8.5h15" />
            <path strokeLinecap="round" d="M5 12h3" />
        </svg>
    );
}

function BookIcon({ className = 'h-5 w-5' }: { className?: string }) {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 4.5c1.8-.9 3.9-.9 5.5 0v11c-1.6-.9-3.7-.9-5.5 0v-11z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 4.5c-1.8-.9-3.9-.9-5.5 0v11c1.6-.9 3.7-.9 5.5 0v-11z" />
        </svg>
    );
}

// One icon per STEPS entry, same order -- paired here rather than inline in
// the STEPS array so that array can stay plain data.
const STEP_ICONS = [PersonIcon, TagIcon, CardIcon, PhoneIcon, CheckCircleIcon, BookIcon];

interface PaymentMethodItem { name: string; description: string | null }
interface HeroContent { headline: string; subheading: string }

function CheckIcon() {
    return (
        <svg className="h-4 w-4 flex-shrink-0 text-success" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    );
}

export default function HowToBuy({ hero, packages, paymentMethods, faqs }: { hero: HeroContent; packages: PackageItem[]; paymentMethods: PaymentMethodItem[]; faqs: FaqItem[] }) {
    const { site } = usePage<PageProps>().props;

    return (
        <PublicLayout>
            <Head title="How to Buy" />

            <section className="relative overflow-hidden bg-secondary py-20 text-center text-white">
                <div className="relative mx-auto max-w-container px-4 sm:px-6 lg:px-8">
                    <SectionKicker dark><span className="mx-auto">Get Started</span></SectionKicker>
                    <h1 className="font-display text-5xl uppercase tracking-wide sm:text-6xl">{hero.headline}</h1>
                    <p className="mx-auto mt-4 max-w-xl text-teal-200">
                        {hero.subheading}
                    </p>
                    {/* Explicit gold/dark-text, not bg-accent/text-accent-fg -- this hero is
                        a dark teal gradient, and accent now means oxblood with light text,
                        which would go nearly invisible here. */}
                    <Link
                        href="/register"
                        className="mt-8 inline-block rounded-full bg-gold-400 px-8 py-4 text-sm font-bold uppercase tracking-wide text-secondary shadow-lg transition-all duration-normal ease-spring hover:-translate-y-0.5 hover:bg-gold-300"
                    >
                        Register Now
                    </Link>
                </div>
            </section>

            <section className="mx-auto max-w-container px-4 py-20 sm:px-6 lg:px-8">
                <RevealOnScroll className="mx-auto mb-12 max-w-2xl text-center">
                    <SectionKicker>How It Works</SectionKicker>
                    <h2 className="font-display text-4xl uppercase tracking-wide text-text sm:text-5xl">Get Started in 6 Steps</h2>
                </RevealOnScroll>
                <RevealOnScroll staggerMs={60} className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                    {STEPS.map((step, i) => {
                        const Icon = STEP_ICONS[i];
                        return (
                            <div key={i} className="group">
                                {/* This inner wrapper (not the outer card div) is the positioning
                                    context for the floating badge below, so the badge anchors to the
                                    image's own bottom edge -- not the bottom of the whole card, which
                                    would shift whenever the Urdu line wraps to two lines. */}
                                <div className="relative">
                                    <div
                                        className="relative h-36 overflow-hidden rounded-[1.5rem] transition-transform duration-normal group-hover:-translate-y-1"
                                        style={{ background: 'linear-gradient(135deg, var(--teal-800), var(--teal-500))' }}
                                    >
                                        <div className="flex h-full items-center justify-center">
                                            <Icon className="h-12 w-12 text-white/80" />
                                        </div>
                                        <div aria-hidden className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/35 to-transparent" />
                                        <span className="absolute bottom-3 left-4 right-16 truncate text-left text-sm font-bold uppercase tracking-wide text-white">
                                            {step.title}
                                        </span>
                                    </div>
                                    {/* Floating step-number badge straddling the image's bottom edge --
                                        a sibling of the (overflow-hidden) image, not a child of it, so it
                                        isn't clipped by the image's own rounded-corner mask. */}
                                    <span className="absolute -bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface font-display text-sm text-primary shadow-lg">
                                        0{i + 1}
                                    </span>
                                </div>
                                <div className="px-1 pb-1 pt-8">
                                    <p className="text-sm text-text-secondary">
                                        {step.title === 'Send Screenshot on WhatsApp' && site.whatsappNumber
                                            ? `Send us a screenshot of your payment receipt on WhatsApp (${site.whatsappNumber}).`
                                            : step.en}
                                    </p>
                                    <p dir="rtl" className="mt-2 font-urdu text-sm leading-relaxed text-text-secondary">
                                        {step.ur}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </RevealOnScroll>
            </section>

            {packages.length > 0 && (
                <section className="bg-surface-sunken py-20">
                    <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
                        <RevealOnScroll className="mx-auto mb-12 max-w-2xl text-center">
                            <SectionKicker>Pricing</SectionKicker>
                            <h2 className="font-display text-4xl uppercase tracking-wide text-text sm:text-5xl">Packages</h2>
                        </RevealOnScroll>
                        <RevealOnScroll staggerMs={60} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {packages.map((pkg) => {
                                // Each line of the admin-entered description becomes one
                                // checkmarked feature -- a plan-comparison-card look (à la
                                // Hostinger's pricing tiers) instead of a plain table row.
                                const features = (pkg.description ?? '')
                                    .split('\n')
                                    .map((line) => line.replace(/^[-•*]\s*/, '').trim())
                                    .filter(Boolean);
                                return (
                                    <div
                                        key={pkg.id}
                                        className="flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-normal hover:-translate-y-1 hover:border-primary hover:shadow-lg"
                                    >
                                        <p className="text-xs font-bold uppercase tracking-wide text-primary">{pkg.course?.title}</p>
                                        <h3 className="mt-1 font-display text-xl uppercase tracking-wide text-text">{pkg.name}</h3>
                                        <p className="mt-3 font-display text-3xl text-text">
                                            Rs. {Number(pkg.price).toLocaleString()}
                                        </p>
                                        <p className="text-xs text-text-muted">
                                            {pkg.validity_days ? `${pkg.validity_days} days access` : 'Lifetime access'}
                                        </p>

                                        {features.length > 0 && (
                                            <ul className="mt-5 flex-1 space-y-2.5 border-t border-border pt-5">
                                                {features.map((f, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                                                        <CheckIcon />
                                                        {f}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        {pkg.course && (
                                            <Link
                                                href={`/courses/${pkg.course.slug}`}
                                                className="mt-6 block rounded-full bg-primary py-2.5 text-center text-sm font-bold uppercase tracking-wide text-on-primary shadow-sm transition-all duration-fast hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-md"
                                            >
                                                View Package
                                            </Link>
                                        )}
                                    </div>
                                );
                            })}
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
                    {paymentMethods.map((method, i) => (
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
                                    <LiteMarkdown text={faq.answer} className="mt-1 text-sm text-text-secondary" />
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
