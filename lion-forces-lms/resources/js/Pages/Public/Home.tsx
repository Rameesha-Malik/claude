import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import AnimatedCounter from '@/Components/AnimatedCounter';
import GradientMesh from '@/Components/GradientMesh';
import RevealOnScroll from '@/Components/RevealOnScroll';
import SectionKicker from '@/Components/SectionKicker';
import ShieldMark from '@/Components/ShieldMark';
import TiltCard from '@/Components/TiltCard';
import PublicLayout from '@/Layouts/PublicLayout';

function StarRow() {
    return (
        <span className="flex items-center gap-0.5 text-gold-500">
            {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3-5.4 3 1.3-6-4.6-4.1 6.1-.6L10 1.5Z" />
                </svg>
            ))}
        </span>
    );
}

function CheckBadge() {
    return (
        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-success-bg text-success">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4L8 11.6l6.8-6.8a1 1 0 0 1 1.4 0Z" />
            </svg>
        </span>
    );
}

// Positions a floating badge relative to the visual panel; kept as its
// own component so every badge shares the same z-index/animation timing
// rather than repeating both across five call sites.
function FloatingBadge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`absolute z-10 animate-float motion-reduce:animate-none ${className}`}>
            {children}
        </div>
    );
}

interface StatItem { icon: string; number: string; label: string }
interface ServiceItem { icon: string; title: string; description: string }
interface CourseItem {
    id: number; title: string; slug: string; short_description: string | null;
    thumbnail_path: string | null; base_price: string | null; hours: number | null;
    category: { name: string } | null;
}
interface FaqItem { question: string; answer: string }
interface TestimonialItem { student_name: string; photo_path: string | null; testimonial_text: string; rating: number | null }
interface NewsItem { title: string; description: string | null; organization: string | null; deadline_date: string | null }
interface SectionContent { title: string; content: Record<string, any> }

interface Props {
    sections: Record<string, SectionContent>;
    stats: StatItem[];
    services: ServiceItem[];
    featuredCourses: CourseItem[];
    faqs: FaqItem[];
    testimonials: TestimonialItem[];
    latestNews: NewsItem[];
}

function money(v: string | null) {
    if (!v) return null;
    return `Rs. ${Number(v).toLocaleString()}`;
}

export default function Home({ sections, stats, services, featuredCourses, faqs, testimonials, latestNews }: Props) {
    const hero = sections.hero?.content ?? {};
    const why = sections.why_choose_us?.content ?? {};
    const howItWorks = sections.how_it_works?.content ?? {};
    const demoTeaser = sections.demo_quiz_teaser?.content ?? {};
    const ctaFooter = sections.cta_footer?.content ?? {};

    return (
        <PublicLayout>
            <Head title="Home" />

            {/* ---------------- Hero — light, split two-column ---------------- */}
            <section className="relative overflow-hidden bg-surface pb-16 pt-28 sm:pb-20 sm:pt-32 lg:pb-28">
                {/* soft brand-color glow, not a full dark wash -- keeps this section light */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full opacity-40 blur-3xl"
                    style={{ backgroundColor: 'var(--color-primary-subtle)' }}
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute -left-32 bottom-0 h-96 w-96 rounded-full opacity-30 blur-3xl"
                    style={{ backgroundColor: 'var(--gold-300)' }}
                />

                <div className="relative mx-auto grid max-w-container gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-10 lg:px-8">
                    {/* Left: copy */}
                    <RevealOnScroll staggerMs={110}>
                        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-text shadow-sm">
                            <StarRow />
                            <span>4.8 Rated by 1,500+ Candidates</span>
                        </div>

                        <h1 className="mt-6 font-display text-5xl uppercase leading-[1.05] text-secondary sm:text-6xl lg:text-[4.5rem]">
                            Train Like You <span className="italic text-gold-600">Mean</span>
                            <br />
                            to Get{' '}
                            <span className="relative inline-block">
                                Selected
                                <svg
                                    aria-hidden
                                    className="absolute -bottom-2 left-0 w-full text-accent"
                                    viewBox="0 0 200 12"
                                    preserveAspectRatio="none"
                                >
                                    <path d="M2 9.5C40 3 140 1 198 7" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                                </svg>
                            </span>
                        </h1>

                        <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary">
                            {hero.subheading ?? "Pakistan's largest online forces preparation platform — structured courses, mock exams, and expert mentorship for ISSB, PMA, Navy and Air Force candidates."}
                        </p>

                        {/* selected-candidate avatar cluster -- initials standing in until real student photos are supplied */}
                        <div className="mt-6 flex items-center gap-3">
                            <div className="flex -space-x-3">
                                {['AH', 'MR', 'SK', 'ZB'].map((initials, i) => (
                                    <span
                                        key={initials}
                                        className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-surface text-xs font-bold text-on-primary shadow-sm"
                                        style={{ backgroundColor: i % 2 === 0 ? 'var(--color-primary)' : 'var(--color-secondary)', zIndex: 4 - i }}
                                    >
                                        {initials}
                                    </span>
                                ))}
                            </div>
                            <p className="text-sm text-text-secondary">
                                <span className="font-bold text-text">300+</span> candidates selected this year
                            </p>
                        </div>

                        <div className="mt-8 flex flex-wrap items-center gap-4">
                            <Link
                                href={hero.cta_primary_link ?? '/courses'}
                                className="rounded-full bg-secondary px-8 py-4 text-base font-bold uppercase tracking-wide text-on-secondary shadow-lg transition-all duration-normal ease-spring hover:-translate-y-0.5 hover:bg-teal-800 hover:shadow-xl"
                            >
                                {hero.cta_primary_text ?? 'Explore Courses'}
                            </Link>
                            <Link
                                href={hero.cta_secondary_link ?? '/demo-quiz'}
                                className="rounded-full border-2 border-border bg-surface px-8 py-4 text-base font-bold uppercase tracking-wide text-text transition-all duration-normal hover:-translate-y-0.5 hover:border-primary hover:text-primary"
                            >
                                {hero.cta_secondary_text ?? 'Try Free Demo Quiz'}
                            </Link>
                        </div>
                    </RevealOnScroll>

                    {/* Right: visual panel + floating stat badges */}
                    <RevealOnScroll staggerMs={110} className="relative mx-auto w-full max-w-md lg:max-w-none">
                        <div className="relative aspect-[4/5] w-full">
                            {/* dotted texture card sitting behind the photo, offset like the reference */}
                            <div
                                aria-hidden
                                className="absolute -right-4 -top-4 h-full w-full rounded-[2rem] sm:-right-6 sm:-top-6"
                                style={{
                                    backgroundColor: 'var(--color-surface-sunken)',
                                    backgroundImage: 'radial-gradient(var(--color-border-strong) 1.5px, transparent 1.5px)',
                                    backgroundSize: '14px 14px',
                                }}
                            />

                            {/* PLACEHOLDER — swap for the generated cadet/candidate photo (<img>) once available */}
                            <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-secondary via-teal-800 to-teal-950 shadow-2xl">
                                <ShieldMark className="h-28 w-28 text-white/15" />
                            </div>

                            <FloatingBadge className="left-0 top-8 -translate-x-1/3 sm:-translate-x-1/2">
                                <div className="flex items-center gap-2 rounded-full bg-surface px-4 py-2.5 text-sm font-bold text-text shadow-lg">
                                    <CheckBadge /> Practice Tests
                                </div>
                            </FloatingBadge>

                            <FloatingBadge className="right-0 top-1/3 translate-x-1/4 sm:translate-x-1/3">
                                <div className="flex items-center gap-2 rounded-full bg-surface px-4 py-2.5 text-sm font-bold text-text shadow-lg">
                                    <CheckBadge /> Mock Exams
                                </div>
                            </FloatingBadge>

                            <FloatingBadge className="bottom-16 left-0 -translate-x-1/4 sm:-translate-x-1/3">
                                <div className="rounded-2xl bg-secondary px-5 py-4 text-white shadow-xl">
                                    <div className="font-display text-2xl text-gold-400">20+</div>
                                    <div className="text-xs text-teal-200">Structured Courses</div>
                                </div>
                            </FloatingBadge>

                            <FloatingBadge className="-bottom-2 right-4 translate-x-1/4 sm:right-8">
                                <div className="rounded-2xl px-5 py-4 text-secondary shadow-xl" style={{ backgroundColor: 'var(--gold-400)' }}>
                                    <div className="font-display text-2xl">5,000+</div>
                                    <div className="text-xs">Assessments Taken</div>
                                </div>
                            </FloatingBadge>
                        </div>
                    </RevealOnScroll>
                </div>

                {/* stat strip -- light cards instead of dark glass, matching the new light hero */}
                {stats.length > 0 && (
                    <div className="relative mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-4 px-4 sm:gap-6 sm:px-6 md:grid-cols-4 lg:px-8">
                        {stats.map((stat, i) => (
                            <TiltCard key={i} max={8} className="rounded-2xl">
                                <div className="rounded-2xl border border-border bg-surface p-6 text-center shadow-lg">
                                    <div className="font-display text-3xl text-primary sm:text-4xl">
                                        <AnimatedCounter value={stat.number} />
                                    </div>
                                    <div className="mt-1 text-sm text-text-secondary">{stat.label}</div>
                                </div>
                            </TiltCard>
                        ))}
                    </div>
                )}
            </section>

            {/* ---------------- Services / Bento grid ---------------- */}
            {services.length > 0 && (
                <section className="mx-auto max-w-container px-4 py-24 sm:px-6 lg:px-8">
                    <RevealOnScroll className="mx-auto mb-14 max-w-2xl text-center">
                        <SectionKicker>What We Cover</SectionKicker>
                        <h2 className="font-display text-4xl uppercase tracking-wide text-secondary sm:text-5xl">
                            What We Prepare You For
                        </h2>
                        <p className="mt-3 text-text-secondary">Structured training across every major service entry test.</p>
                    </RevealOnScroll>
                    <RevealOnScroll className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {services.map((service, i) => (
                            <TiltCard key={i} className="h-full rounded-2xl">
                                <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-normal hover:-translate-y-1 hover:border-accent hover:shadow-xl">
                                    <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary-subtle transition-transform duration-slow group-hover:scale-150" />
                                    <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-on-primary shadow-md">
                                        <ServiceIcon name={service.icon} />
                                    </div>
                                    <h3 className="relative text-lg font-bold text-text">{service.title}</h3>
                                    <p className="relative mt-2 flex-1 text-sm text-text-secondary">{service.description}</p>
                                </div>
                            </TiltCard>
                        ))}
                    </RevealOnScroll>
                </section>
            )}

            {/* ---------------- Featured Courses ---------------- */}
            {featuredCourses.length > 0 && (
                <section className="bg-surface-sunken py-20">
                    <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
                        <RevealOnScroll className="mb-14 flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <SectionKicker>Popular Tracks</SectionKicker>
                                <h2 className="font-display text-4xl uppercase tracking-wide text-text sm:text-5xl">Featured Courses</h2>
                            </div>
                            <Link href="/courses" className="font-bold uppercase tracking-wide text-primary hover:text-primary-hover">
                                View all &rarr;
                            </Link>
                        </RevealOnScroll>
                        <RevealOnScroll className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {featuredCourses.map((course) => (
                                <Link key={course.id} href={`/courses/${course.slug}`} className="group">
                                    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-normal group-hover:-translate-y-1 group-hover:border-accent group-hover:shadow-xl">
                                        <div className="relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br from-teal-600 via-teal-800 to-teal-950">
                                            <span
                                                className="absolute -right-4 -top-4 h-16 w-16 rotate-12 rounded-lg"
                                                style={{ backgroundColor: 'rgba(232, 193, 95, 0.2)' }}
                                            />
                                            <span className="relative font-display text-2xl uppercase tracking-widest text-white">
                                                {course.category?.name ?? 'Course'}
                                            </span>
                                        </div>
                                        <div className="p-5">
                                            <h3 className="font-bold text-text group-hover:text-primary">{course.title}</h3>
                                            <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{course.short_description}</p>
                                            <div className="mt-4 flex items-center justify-between text-sm">
                                                <span className="font-bold text-primary">{money(course.base_price)}</span>
                                                {course.hours && <span className="text-text-muted">{course.hours}h</span>}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </RevealOnScroll>
                    </div>
                </section>
            )}

            {/* ---------------- Why Choose Us ---------------- */}
            {why.items && (
                <section className="mx-auto max-w-container px-4 py-24 sm:px-6 lg:px-8">
                    <RevealOnScroll className="mx-auto mb-4 max-w-2xl text-center">
                        <SectionKicker>The Difference</SectionKicker>
                        <h2 className="font-display text-4xl uppercase tracking-wide text-text sm:text-5xl">Why Choose Us</h2>
                        <p className="mt-3 text-text-secondary">{why.paragraph}</p>
                    </RevealOnScroll>
                    <RevealOnScroll className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {why.items.map((item: { title: string; description: string }, i: number) => (
                            <div key={i} className="rounded-2xl border border-border bg-surface p-6 shadow-xs transition-shadow duration-normal hover:shadow-md">
                                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-fg">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-text">{item.title}</h3>
                                <p className="mt-1 text-sm text-text-secondary">{item.description}</p>
                            </div>
                        ))}
                    </RevealOnScroll>
                </section>
            )}

            {/* ---------------- How It Works ---------------- */}
            {howItWorks.steps && (
                <section className="relative overflow-hidden bg-gradient-to-br from-secondary to-teal-950 py-24 text-text-inverse">
                    <GradientMesh className="opacity-60" />
                    <div className="relative mx-auto max-w-container px-4 sm:px-6 lg:px-8">
                        <RevealOnScroll className="mx-auto mb-16 max-w-2xl text-center">
                            <SectionKicker dark>The Process</SectionKicker>
                            <h2 className="font-display text-4xl uppercase tracking-wide sm:text-5xl">How It Works</h2>
                        </RevealOnScroll>
                        <RevealOnScroll className="grid gap-8 md:grid-cols-3">
                            {howItWorks.steps.map((step: { title: string; description: string }, i: number) => (
                                <div key={i} className="relative rounded-2xl border border-white/15 bg-white/[0.06] p-8 backdrop-blur-glass transition-transform duration-normal hover:-translate-y-1">
                                    <div className="mb-4 font-display text-5xl text-gold-400">0{i + 1}</div>
                                    <h3 className="text-lg font-bold">{step.title}</h3>
                                    <p className="mt-2 text-sm text-teal-200">{step.description}</p>
                                </div>
                            ))}
                        </RevealOnScroll>
                    </div>
                </section>
            )}

            {/* ---------------- Latest News ---------------- */}
            {latestNews.length > 0 && (
                <section className="mx-auto max-w-container px-4 py-24 sm:px-6 lg:px-8">
                    <RevealOnScroll className="mb-14 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <SectionKicker>Stay Updated</SectionKicker>
                            <h2 className="font-display text-4xl uppercase tracking-wide text-text sm:text-5xl">Latest News</h2>
                        </div>
                        <Link href="/news" className="font-bold uppercase tracking-wide text-primary hover:text-primary-hover">
                            View all &rarr;
                        </Link>
                    </RevealOnScroll>
                    <RevealOnScroll className="grid gap-6 sm:grid-cols-3">
                        {latestNews.map((item, i) => (
                            <div key={i} className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition-shadow duration-normal hover:shadow-md">
                                {item.organization && (
                                    <span className="mb-3 inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent-fg">
                                        {item.organization}
                                    </span>
                                )}
                                <h3 className="font-bold text-text">{item.title}</h3>
                                <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{item.description}</p>
                            </div>
                        ))}
                    </RevealOnScroll>
                </section>
            )}

            {/* ---------------- Demo Quiz Teaser ---------------- */}
            <section className="mx-auto max-w-container px-4 pb-8 sm:px-6 lg:px-8">
                <RevealOnScroll>
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-teal-800 to-teal-950 p-10 text-center text-white shadow-2xl sm:p-16">
                        <GradientMesh />
                        <div className="relative">
                            <SectionKicker dark>
                                <span className="mx-auto">No Login Required</span>
                            </SectionKicker>
                            <h2 className="font-display text-3xl uppercase tracking-wide sm:text-4xl">{demoTeaser.banner_text}</h2>
                            <Link
                                href={demoTeaser.button_link ?? '/demo-quiz'}
                                className="mt-8 inline-block rounded-xl bg-accent px-8 py-4 font-bold uppercase tracking-wide text-accent-fg shadow-lg transition-transform duration-normal ease-spring hover:-translate-y-0.5 hover:bg-accent-hover"
                            >
                                {demoTeaser.button_text ?? 'Start Demo Quiz'}
                            </Link>
                        </div>
                    </div>
                </RevealOnScroll>
            </section>

            {/* ---------------- FAQs ---------------- */}
            {faqs.length > 0 && (
                <section className="mx-auto max-w-container px-4 py-24 sm:px-6 lg:px-8">
                    <RevealOnScroll className="mx-auto mb-14 max-w-2xl text-center">
                        <SectionKicker>Got Questions?</SectionKicker>
                        <h2 className="font-display text-4xl uppercase tracking-wide text-text sm:text-5xl">Frequently Asked</h2>
                    </RevealOnScroll>
                    <div className="mx-auto max-w-2xl divide-y divide-border rounded-2xl border border-border bg-surface">
                        {faqs.map((faq, i) => (
                            <FaqAccordionItem key={i} question={faq.question} answer={faq.answer} />
                        ))}
                    </div>
                </section>
            )}

            {/* ---------------- Testimonials ---------------- */}
            {testimonials.length > 0 && (
                <section className="bg-surface-sunken py-24">
                    <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
                        <RevealOnScroll className="mx-auto mb-14 max-w-2xl text-center">
                            <SectionKicker>Real Results</SectionKicker>
                            <h2 className="font-display text-4xl uppercase tracking-wide text-text sm:text-5xl">Success Stories</h2>
                        </RevealOnScroll>
                        <RevealOnScroll className="grid gap-6 md:grid-cols-3">
                            {testimonials.map((t, i) => (
                                <div key={i} className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition-shadow duration-normal hover:shadow-md">
                                    {t.rating && (
                                        <div className="mb-3 flex gap-0.5 text-gold-500">
                                            {Array.from({ length: 5 }).map((_, s) => (
                                                <svg key={s} className="h-4 w-4" fill={s < t.rating! ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 20 20">
                                                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                                </svg>
                                            ))}
                                        </div>
                                    )}
                                    <p className="text-sm italic text-text-secondary">&ldquo;{t.testimonial_text}&rdquo;</p>
                                    <div className="mt-4 font-semibold text-text">{t.student_name}</div>
                                </div>
                            ))}
                        </RevealOnScroll>
                    </div>
                </section>
            )}

            {/* ---------------- CTA Footer Banner ---------------- */}
            <section className="mx-auto max-w-container px-4 pb-24 sm:px-6 lg:px-8">
                <RevealOnScroll>
                    <div className="relative overflow-hidden rounded-3xl border-2 border-accent bg-surface-brand p-10 text-center sm:p-16">
                        <div
                            aria-hidden
                            className="absolute -right-10 -top-10 h-40 w-40 rotate-12 rounded-3xl"
                            style={{ backgroundColor: 'rgba(212, 165, 55, 0.1)' }}
                        />
                        <h2 className="relative font-display text-4xl uppercase tracking-wide text-secondary sm:text-5xl">
                            {ctaFooter.heading}
                        </h2>
                        <p className="relative mt-3 text-text-secondary">{ctaFooter.subheading}</p>
                        <Link
                            href={ctaFooter.button_link ?? '/register'}
                            className="relative mt-8 inline-block rounded-xl bg-accent px-10 py-4 font-bold uppercase tracking-wide text-accent-fg shadow-lg transition-all duration-normal ease-spring hover:-translate-y-0.5 hover:bg-accent-hover"
                        >
                            {ctaFooter.button_text ?? 'Register Now'}
                        </Link>
                    </div>
                </RevealOnScroll>
            </section>
        </PublicLayout>
    );
}

function FaqAccordionItem({ question, answer }: { question: string; answer: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div>
            <button
                className="flex w-full items-center justify-between px-6 py-5 text-left font-medium text-text"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
            >
                {question}
                <svg
                    className={`h-5 w-5 flex-shrink-0 text-text-muted transition-transform duration-fast ${open ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {open && <div className="px-6 pb-5 text-sm text-text-secondary">{answer}</div>}
        </div>
    );
}

function ServiceIcon({ name }: { name: string }) {
    const paths: Record<string, string> = {
        shield: 'M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z',
        anchor: 'M12 2v20M8 6a4 4 0 108 0M4 15h16M6 15a6 6 0 0012 0',
        brain: 'M9.5 2a2.5 2.5 0 012.5 2.5V4a2.5 2.5 0 015 0v1a3 3 0 013 3v1a3 3 0 01-1.5 5.2V15a3 3 0 01-3 3h-1v1a2.5 2.5 0 01-5 0v-1H9a3 3 0 01-3-3v-.8A3 3 0 014.5 9V8a3 3 0 013-3V4A2.5 2.5 0 019.5 2z',
        star: 'M12 2l2.9 6.6 7.1.6-5.4 4.6 1.7 7-6.3-3.9-6.3 3.9 1.7-7-5.4-4.6 7.1-.6z',
    };
    return (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={paths[name] ?? paths.star} />
        </svg>
    );
}
