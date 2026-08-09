import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import AnimatedCounter from '@/Components/AnimatedCounter';
import GradientMesh from '@/Components/GradientMesh';
import RevealOnScroll from '@/Components/RevealOnScroll';
import TiltCard from '@/Components/TiltCard';
import PublicLayout from '@/Layouts/PublicLayout';

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

            {/* ---------------- Hero ---------------- */}
            <section className="relative overflow-hidden bg-surface-brand">
                <GradientMesh />
                <div className="relative mx-auto max-w-container px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
                    <div className="mx-auto max-w-3xl text-center">
                        <RevealOnScroll staggerMs={110}>
                            <h1 className="text-4xl font-bold leading-tight tracking-tight text-secondary sm:text-5xl lg:text-6xl">
                                {hero.headline}
                            </h1>
                            <p className="mt-6 text-lg leading-relaxed text-text-secondary sm:text-xl">
                                {hero.subheading}
                            </p>
                            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                                <Link
                                    href={hero.cta_primary_link ?? '/courses'}
                                    className="rounded-xl bg-primary px-8 py-4 text-base font-semibold text-on-primary shadow-lg transition-all duration-normal ease-spring hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-xl"
                                >
                                    {hero.cta_primary_text ?? 'Explore Courses'}
                                </Link>
                                <Link
                                    href={hero.cta_secondary_link ?? '/demo-quiz'}
                                    className="rounded-xl border-2 border-border-brand bg-surface px-8 py-4 text-base font-semibold text-secondary shadow-sm transition-all duration-normal hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
                                >
                                    {hero.cta_secondary_text ?? 'Try Free Demo Quiz'}
                                </Link>
                            </div>
                        </RevealOnScroll>
                    </div>

                    {/* floating stat cards */}
                    {stats.length > 0 && (
                        <div className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
                            {stats.map((stat, i) => (
                                <TiltCard key={i} max={8} className="rounded-2xl">
                                    <div className="rounded-2xl border border-border-brand bg-surface/90 p-6 text-center shadow-lg backdrop-blur-glass">
                                        <div className="text-2xl font-bold text-primary sm:text-3xl">
                                            <AnimatedCounter value={stat.number} />
                                        </div>
                                        <div className="mt-1 text-sm text-text-secondary">{stat.label}</div>
                                    </div>
                                </TiltCard>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ---------------- Services / Bento grid ---------------- */}
            {services.length > 0 && (
                <section className="mx-auto max-w-container px-4 py-20 sm:px-6 lg:px-8">
                    <RevealOnScroll className="mx-auto mb-12 max-w-2xl text-center">
                        <h2 className="text-3xl font-bold text-text sm:text-4xl">What We Prepare You For</h2>
                        <p className="mt-3 text-text-secondary">Structured training across every major service entry test.</p>
                    </RevealOnScroll>
                    <RevealOnScroll className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {services.map((service, i) => (
                            <TiltCard key={i} className="h-full rounded-2xl">
                                <div className="flex h-full flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm transition-shadow duration-normal hover:shadow-lg">
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-subtle text-primary">
                                        <ServiceIcon name={service.icon} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-text">{service.title}</h3>
                                    <p className="mt-2 flex-1 text-sm text-text-secondary">{service.description}</p>
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
                        <RevealOnScroll className="mb-12 flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <h2 className="text-3xl font-bold text-text sm:text-4xl">Featured Courses</h2>
                                <p className="mt-2 text-text-secondary">Popular preparation tracks, updated regularly.</p>
                            </div>
                            <Link href="/courses" className="font-semibold text-primary hover:text-primary-hover">
                                View all courses &rarr;
                            </Link>
                        </RevealOnScroll>
                        <RevealOnScroll className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {featuredCourses.map((course) => (
                                <Link key={course.id} href={`/courses/${course.slug}`} className="group">
                                    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-normal group-hover:-translate-y-1 group-hover:shadow-xl">
                                        <div className="flex h-36 items-center justify-center bg-gradient-to-br from-teal-600 to-teal-900 text-sm font-semibold text-white">
                                            {course.category?.name ?? 'Course'}
                                        </div>
                                        <div className="p-5">
                                            <h3 className="font-semibold text-text group-hover:text-primary">{course.title}</h3>
                                            <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{course.short_description}</p>
                                            <div className="mt-4 flex items-center justify-between text-sm">
                                                <span className="font-semibold text-primary">{money(course.base_price)}</span>
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
                <section className="mx-auto max-w-container px-4 py-20 sm:px-6 lg:px-8">
                    <RevealOnScroll className="mx-auto mb-4 max-w-2xl text-center">
                        <h2 className="text-3xl font-bold text-text sm:text-4xl">Why Choose Us</h2>
                        <p className="mt-3 text-text-secondary">{why.paragraph}</p>
                    </RevealOnScroll>
                    <RevealOnScroll className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {why.items.map((item: { title: string; description: string }, i: number) => (
                            <div key={i} className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
                                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-success-bg text-success">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-text">{item.title}</h3>
                                <p className="mt-1 text-sm text-text-secondary">{item.description}</p>
                            </div>
                        ))}
                    </RevealOnScroll>
                </section>
            )}

            {/* ---------------- How It Works ---------------- */}
            {howItWorks.steps && (
                <section className="bg-secondary py-20 text-text-inverse">
                    <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
                        <RevealOnScroll className="mx-auto mb-14 max-w-2xl text-center">
                            <h2 className="text-3xl font-bold sm:text-4xl">How It Works</h2>
                        </RevealOnScroll>
                        <RevealOnScroll className="grid gap-8 md:grid-cols-3">
                            {howItWorks.steps.map((step: { title: string; description: string }, i: number) => (
                                <div key={i} className="relative rounded-2xl border border-teal-800 bg-teal-800/40 p-8 backdrop-blur-glass">
                                    <div className="mb-4 text-4xl font-bold text-teal-400">0{i + 1}</div>
                                    <h3 className="text-lg font-semibold">{step.title}</h3>
                                    <p className="mt-2 text-sm text-teal-200">{step.description}</p>
                                </div>
                            ))}
                        </RevealOnScroll>
                    </div>
                </section>
            )}

            {/* ---------------- Latest News ---------------- */}
            {latestNews.length > 0 && (
                <section className="mx-auto max-w-container px-4 py-20 sm:px-6 lg:px-8">
                    <RevealOnScroll className="mb-12 flex flex-wrap items-end justify-between gap-4">
                        <h2 className="text-3xl font-bold text-text sm:text-4xl">Latest News</h2>
                        <Link href="/news" className="font-semibold text-primary hover:text-primary-hover">
                            View all news &rarr;
                        </Link>
                    </RevealOnScroll>
                    <RevealOnScroll className="grid gap-6 sm:grid-cols-3">
                        {latestNews.map((item, i) => (
                            <div key={i} className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                                {item.organization && (
                                    <span className="mb-3 inline-block rounded-full bg-primary-subtle px-3 py-1 text-xs font-semibold text-primary">
                                        {item.organization}
                                    </span>
                                )}
                                <h3 className="font-semibold text-text">{item.title}</h3>
                                <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{item.description}</p>
                            </div>
                        ))}
                    </RevealOnScroll>
                </section>
            )}

            {/* ---------------- Demo Quiz Teaser ---------------- */}
            <section className="mx-auto max-w-container px-4 pb-8 sm:px-6 lg:px-8">
                <RevealOnScroll>
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 to-teal-900 p-10 text-center text-white shadow-xl sm:p-16">
                        <GradientMesh />
                        <div className="relative">
                            <h2 className="text-2xl font-bold sm:text-3xl">{demoTeaser.banner_text}</h2>
                            <Link
                                href={demoTeaser.button_link ?? '/demo-quiz'}
                                className="mt-6 inline-block rounded-xl bg-white px-8 py-4 font-semibold text-secondary shadow-lg transition-transform duration-normal ease-spring hover:-translate-y-0.5"
                            >
                                {demoTeaser.button_text ?? 'Start Demo Quiz'}
                            </Link>
                        </div>
                    </div>
                </RevealOnScroll>
            </section>

            {/* ---------------- FAQs ---------------- */}
            {faqs.length > 0 && (
                <section className="mx-auto max-w-container px-4 py-20 sm:px-6 lg:px-8">
                    <RevealOnScroll className="mx-auto mb-12 max-w-2xl text-center">
                        <h2 className="text-3xl font-bold text-text sm:text-4xl">Frequently Asked Questions</h2>
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
                <section className="bg-surface-sunken py-20">
                    <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
                        <RevealOnScroll className="mx-auto mb-12 max-w-2xl text-center">
                            <h2 className="text-3xl font-bold text-text sm:text-4xl">Success Stories</h2>
                        </RevealOnScroll>
                        <RevealOnScroll className="grid gap-6 md:grid-cols-3">
                            {testimonials.map((t, i) => (
                                <div key={i} className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                                    {t.rating && (
                                        <div className="mb-3 flex gap-0.5 text-warning">
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
                    <div className="rounded-3xl border border-border-brand bg-surface-brand p-10 text-center sm:p-16">
                        <h2 className="text-3xl font-bold text-secondary sm:text-4xl">{ctaFooter.heading}</h2>
                        <p className="mt-3 text-text-secondary">{ctaFooter.subheading}</p>
                        <Link
                            href={ctaFooter.button_link ?? '/register'}
                            className="mt-8 inline-block rounded-xl bg-primary px-10 py-4 font-semibold text-on-primary shadow-lg transition-all duration-normal ease-spring hover:-translate-y-0.5 hover:bg-primary-hover"
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
