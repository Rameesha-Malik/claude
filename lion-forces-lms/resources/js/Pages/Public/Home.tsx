import { Head, Link } from '@inertiajs/react';
import AnimatedCounter from '@/Components/AnimatedCounter';
import BranchHeroSlider from '@/Components/BranchHeroSlider';
import FaqAccordionItem from '@/Components/FaqAccordionItem';
import GradientMesh from '@/Components/GradientMesh';
import LiteMarkdown from '@/Components/LiteMarkdown';
import RevealOnScroll from '@/Components/RevealOnScroll';
import SectionKicker from '@/Components/SectionKicker';
import ShieldMark from '@/Components/ShieldMark';
import TiltCard from '@/Components/TiltCard';
import WaveRibbon from '@/Components/WaveRibbon';
import WhyChooseIcon from '@/Components/WhyChooseIcon';
import PublicLayout from '@/Layouts/PublicLayout';

// Small illustrative mockup per "How It Works" step -- built from plain
// divs/SVG rather than screenshots, so it never depends on external image
// assets and stays theme-consistent (teal/gold, our actual token classes).
function StepMockup({ index }: { index: number }) {
    if (index === 0) {
        return (
            <div className="rounded-xl bg-surface p-4 text-left shadow-lg">
                <p className="text-xs font-bold text-text">Create Your Account</p>
                <div className="mt-2 space-y-1.5">
                    <div className="h-2 w-3/4 rounded-full bg-surface-sunken" />
                    <div className="h-2 w-full rounded-full bg-surface-sunken" />
                </div>
                <div className="mt-3 flex items-center justify-between">
                    <div className="flex -space-x-2">
                        {['AH', 'MR', 'SK'].map((n, i) => (
                            <span key={n} className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface text-[0.5rem] font-bold text-on-primary" style={{ backgroundColor: i % 2 ? 'var(--color-secondary)' : 'var(--color-primary)' }}>
                                {n}
                            </span>
                        ))}
                    </div>
                    <span className="rounded-full bg-primary px-3 py-1 text-[0.6rem] font-bold uppercase text-on-primary">Sign Up</span>
                </div>
            </div>
        );
    }
    if (index === 1) {
        return (
            <div className="rounded-xl bg-surface p-4 text-left shadow-lg">
                <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-bold text-text">Q3. Verbal Intelligence</p>
                    <span className="rounded-full bg-danger-bg px-2 py-0.5 text-[0.6rem] font-bold text-danger">08:42</span>
                </div>
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2 rounded-lg border border-primary bg-primary-subtle px-2 py-1.5">
                        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-on-primary">
                            <svg viewBox="0 0 20 20" fill="currentColor" className="h-2.5 w-2.5"><path d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 111.4-1.4L8 11.6l6.8-6.8a1 1 0 011.4 0z" /></svg>
                        </span>
                        <div className="h-1.5 w-20 rounded-full" style={{ backgroundColor: 'rgba(4, 167, 157, 0.4)' }} />
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-border px-2 py-1.5">
                        <span className="h-3.5 w-3.5 rounded-full border border-border" />
                        <div className="h-1.5 w-16 rounded-full bg-surface-sunken" />
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="rounded-xl bg-surface p-4 text-left shadow-lg">
            <div className="flex items-center gap-3">
                <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full" style={{ background: 'conic-gradient(var(--color-primary) 87%, var(--color-border) 0)' }}>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-[0.65rem] font-bold text-primary">87%</span>
                </div>
                <div>
                    <p className="text-xs font-bold text-text">Mock Exam Complete</p>
                    <p className="text-[0.65rem] text-success">Certificate unlocked</p>
                </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-success-bg px-2.5 py-1.5 text-[0.65rem] font-bold text-success">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3"><path d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 111.4-1.4L8 11.6l6.8-6.8a1 1 0 011.4 0z" /></svg>
                Ready for selection
            </div>
        </div>
    );
}

function ClockIcon() {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-3.5 w-3.5">
            <circle cx="10" cy="10" r="7.5" />
            <path strokeLinecap="round" d="M10 5.5V10l3 2" />
        </svg>
    );
}

function TopicIcon() {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-3.5 w-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 4.5h5l8 8-5 5-8-8v-5z" />
            <circle cx="7" cy="8" r="1" fill="currentColor" stroke="none" />
        </svg>
    );
}

function UsersIcon() {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-3.5 w-3.5">
            <circle cx="7" cy="6.5" r="2.5" />
            <path strokeLinecap="round" d="M2.5 16c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5" />
            <path strokeLinecap="round" d="M12.5 4.6a2.5 2.5 0 010 4.8M15 16c0-2-1.3-3.7-3-4.3" />
        </svg>
    );
}

interface StatItem { icon: string; number: string; label: string }
interface ServiceItem { icon: string; title: string; description: string }
interface CourseItem {
    id: number; title: string; slug: string; short_description: string | null;
    thumbnail_path: string | null; base_price: string | null; hours: number | null; level: string | null;
    enrollments_count: number; topics_count: number; category: { name: string } | null;
}
interface FaqItem { question: string; answer: string }
interface TestimonialItem { student_name: string; photo_path: string | null; testimonial_text: string; rating: number | null }
interface NewsItem {
    id: number; title: string; description: string | null; organization: string | null; image_path: string | null;
    deadline_date: string | null; created_at: string;
}
interface SectionContent { title: string; content: Record<string, any> }

interface HeroSlideItem {
    branch_key: string;
    branch: string;
    title: string;
    motto: string | null;
    motto_translation: string | null;
    description: string;
    cta_href: string;
    image_path: string | null;
}

interface Props {
    sections: Record<string, SectionContent>;
    stats: StatItem[];
    services: ServiceItem[];
    featuredCourses: CourseItem[];
    faqs: FaqItem[];
    testimonials: TestimonialItem[];
    latestNews: NewsItem[];
    heroSlides: HeroSlideItem[];
}

function money(v: string | null) {
    if (!v) return null;
    return `Rs. ${Number(v).toLocaleString()}`;
}

function formatDate(v: string) {
    return new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Fallback for a post with no uploaded photo -- cycles through the brand's
// two "poster" gradients so it still reads as intentional per-card
// variation rather than 3 identical blocks in a row. A post WITH a photo
// (Admin > News > Image) shows that instead, same as the dedicated /news
// page already does.
const NEWS_BANNER_GRADIENTS = ['from-teal-600 via-teal-800 to-teal-950', 'from-secondary via-teal-900 to-teal-950'];

// Real exam/service names the platform prepares candidates for (same set
// named in the hero subheading and used as course category badges) --
// surfaced here as a decorative "trust bar" tag ribbon, not invented copy.
const TRUST_TAGS = ['Pak Army', 'Pak Navy', 'Pak Air Force', 'ISSB', 'PMA', 'Lady Cadet Course', 'AFNS', 'Rangers'];

export default function Home({ sections, stats, services, featuredCourses, faqs, testimonials, latestNews, heroSlides }: Props) {
    const why = sections.why_choose_us?.content ?? {};
    const whyTitle = sections.why_choose_us?.title ?? 'Why Choose Our Platform?';
    const howItWorks = sections.how_it_works?.content ?? {};
    const howItWorksTitle = sections.how_it_works?.title ?? '3 Easy Steps to Your Selection';
    const demoTeaser = sections.demo_quiz_teaser?.content ?? {};
    const ctaFooter = sections.cta_footer?.content ?? {};

    return (
        <PublicLayout>
            <Head title="Home" />

            <BranchHeroSlider slides={heroSlides} />

            {/* ---------------- Trust Bar — wavy ribbon of the exams we prepare for, arched over the real stats ---------------- */}
            {stats.length > 0 && (
                <section className="relative overflow-hidden bg-secondary pb-14 pt-16 sm:pt-20">
                    <GradientMesh className="opacity-50" />

                    {/* decorative -- real exam/service names already named in the hero copy above,
                        just surfaced as a wavy tag ribbon instead of plain prose */}
                    <div aria-hidden className="relative mx-auto flex max-w-4xl flex-wrap justify-center gap-x-3 gap-y-6 px-6">
                        {TRUST_TAGS.map((tag, i) => (
                            <span
                                key={tag}
                                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide shadow-lg sm:text-sm ${i % 2 === 0 ? 'text-white' : 'text-on-accent'}`}
                                style={{
                                    background: i % 2 === 0
                                        ? 'linear-gradient(135deg, var(--teal-700), var(--teal-500))'
                                        : 'linear-gradient(135deg, var(--gold-500), var(--gold-300))',
                                    transform: `translateY(${Math.sin(i * 1.1) * 10}px) rotate(${Math.sin(i * 0.7) * 5}deg)`,
                                }}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>

                    <RevealOnScroll className="relative mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-8 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
                        {stats.map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="font-display text-4xl text-white sm:text-5xl">
                                    <AnimatedCounter value={stat.number} />
                                </div>
                                <div className="mt-1 text-sm text-teal-200">{stat.label}</div>
                            </div>
                        ))}
                    </RevealOnScroll>
                </section>
            )}

            {/* ---------------- What We Offer — fanned card stack + scattered praise ---------------- */}
            {services.length > 0 && (
                <section className="relative overflow-hidden bg-surface py-24">
                    <GradientMesh variant="light" />

                    {/* Large faint shield watermarks in the wide side margins either side of
                        the fan stack -- those margins sit outside the max-w-3xl content
                        column below and were empty on anything wider than ~1024px. */}
                    {/* opacity-* (not a `text-primary/[0.05]` slash modifier) -- `primary`
                        is a plain CSS color value, not an alpha-ready channel triplet, so
                        that modifier silently resolves to fully opaque (see the Home hero
                        and About panel gradient fixes for the same underlying issue). */}
                    <ShieldMark aria-hidden className="pointer-events-none absolute -left-16 top-1/2 hidden h-72 w-72 -translate-y-1/2 text-primary opacity-[0.06] xl:block" />
                    <ShieldMark aria-hidden className="pointer-events-none absolute -right-16 top-1/2 hidden h-72 w-72 -translate-y-1/2 rotate-12 text-primary opacity-[0.06] xl:block" />

                    <RevealOnScroll className="relative mx-auto mb-4 max-w-2xl px-4 text-center sm:px-6">
                        <SectionKicker>What We Cover</SectionKicker>
                        <h2 className="font-display text-4xl uppercase tracking-wide text-secondary sm:text-5xl">
                            What We Prepare You For
                        </h2>
                        <p className="mt-3 text-text-secondary">Structured training across every major service entry test.</p>
                    </RevealOnScroll>

                    {/* Fan stack -- own overflow-hidden box so rotated/offset cards never
                        widen the page, regardless of viewport size. */}
                    <div className="relative mx-auto mt-16 h-[22rem] max-w-3xl overflow-hidden px-4 sm:h-[26rem] sm:px-6">
                        <div
                            aria-hidden
                            className="absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
                            style={{ background: 'radial-gradient(circle, var(--color-primary-subtle), var(--oxblood-300) 70%, transparent 100%)' }}
                        />

                        <div className="relative flex h-full items-center justify-center">
                            {services.slice(0, 5).map((service, i) => {
                                const mid = (services.slice(0, 5).length - 1) / 2;
                                const offset = i - mid;
                                const rotate = offset * 9;
                                return (
                                    // Outer div owns the static fan position (translateX + rotate)
                                    // and z-index; TiltCard's own hover tilt writes `transform`
                                    // directly via anime.js, so it can't share an element with a
                                    // Tailwind hover-transform utility or an inline static transform
                                    // without one clobbering the other.
                                    <div
                                        key={i}
                                        className="absolute w-40 sm:w-48"
                                        style={{ transform: `translateX(${offset * 60}px) rotate(${rotate}deg)`, zIndex: 10 - Math.abs(offset) }}
                                    >
                                        <TiltCard max={6} className="rounded-2xl">
                                            <div className="flex h-48 flex-col rounded-2xl border border-border bg-surface p-5 text-left shadow-xl sm:h-56">
                                                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-on-primary shadow-md">
                                                    <ServiceIcon name={service.icon} />
                                                </div>
                                                <h3 className="text-sm font-bold text-text">{service.title}</h3>
                                                <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-text-secondary">{service.description}</p>
                                            </div>
                                        </TiltCard>
                                    </div>
                                );
                            })}
                        </div>

                        {/* scattered praise chips -- real testimonial excerpts, not invented quotes */}
                        {testimonials.slice(0, 4).map((t, i) => {
                            const positions = [
                                'left-2 top-4 sm:left-8 sm:top-6',
                                'right-2 top-16 sm:right-10 sm:top-20',
                                'bottom-8 left-4 sm:left-12',
                                'bottom-2 right-2 sm:right-14 sm:bottom-10',
                            ];
                            return (
                                <div key={i} className={`absolute z-20 hidden max-w-[10rem] rounded-xl border border-border bg-surface px-3 py-2 shadow-lg sm:block ${positions[i]}`}>
                                    <div className="flex items-center gap-1 text-star">
                                        {Array.from({ length: t.rating ?? 5 }).map((_, s) => (
                                            <svg key={s} viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                                                <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3-5.4 3 1.3-6-4.6-4.1 6.1-.6L10 1.5Z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <p className="mt-1 line-clamp-2 text-[0.7rem] leading-snug text-text-secondary">
                                        &ldquo;{t.testimonial_text}&rdquo;
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* ---------------- Featured Courses ---------------- */}
            {featuredCourses.length > 0 && (
                <section className="relative overflow-hidden bg-surface-sunken py-20">
                    <GradientMesh variant="light" />
                    <div className="relative mx-auto max-w-container px-4 sm:px-6 lg:px-8">
                        <RevealOnScroll className="mb-14 flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <SectionKicker>Popular Tracks</SectionKicker>
                                <h2 className="font-display text-4xl uppercase tracking-wide text-text sm:text-5xl">Featured Courses</h2>
                            </div>
                            <Link href="/courses" className="font-bold uppercase tracking-wide text-primary hover:text-primary-hover">
                                View all &rarr;
                            </Link>
                        </RevealOnScroll>
                        <RevealOnScroll className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
                            {featuredCourses.map((course) => (
                                <TiltCard key={course.id} max={5} className="group h-full rounded-2xl">
                                    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-normal group-hover:-translate-y-1.5 group-hover:border-primary group-hover:shadow-2xl">
                                        <div className="relative h-40 overflow-hidden bg-secondary">
                                            {course.thumbnail_path ? (
                                                <img
                                                    src={`/storage/${course.thumbnail_path}`}
                                                    alt=""
                                                    className="h-full w-full object-cover transition-transform duration-slow group-hover:scale-110"
                                                />
                                            ) : (
                                                <>
                                                    <span
                                                        aria-hidden
                                                        className="absolute -right-4 -top-4 h-16 w-16 rotate-12 rounded-lg bg-white/10 transition-transform duration-slow group-hover:rotate-45"
                                                    />
                                                    <div className="flex h-full items-center justify-center">
                                                        <span className="relative font-display text-2xl uppercase tracking-widest text-white">
                                                            {course.category?.name ?? 'Course'}
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-normal group-hover:opacity-100" />
                                        </div>

                                        <div className="flex flex-1 flex-col p-5">
                                            <h3 className="font-bold text-text group-hover:text-primary">{course.title}</h3>
                                            <p className="mt-1 line-clamp-2 flex-1 text-sm text-text-secondary">{course.short_description}</p>

                                            <div className="mt-4 flex items-center gap-3 text-xs text-text-muted">
                                                {course.hours && (
                                                    <span className="inline-flex items-center gap-1">
                                                        <ClockIcon /> {course.hours}h
                                                    </span>
                                                )}
                                                {course.topics_count > 0 && (
                                                    <span className="inline-flex items-center gap-1">
                                                        <TopicIcon /> {course.topics_count} topic{course.topics_count === 1 ? '' : 's'}
                                                    </span>
                                                )}
                                                {course.enrollments_count > 0 && (
                                                    <span className="inline-flex items-center gap-1">
                                                        <UsersIcon /> {course.enrollments_count}+ enrolled
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                                                <span className="font-display text-lg text-primary">{money(course.base_price) ?? 'Free'}</span>
                                                <Link
                                                    href={`/courses/${course.slug}`}
                                                    className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wide text-on-primary shadow-sm transition-all duration-fast hover:bg-primary-hover hover:shadow-md"
                                                >
                                                    View Course
                                                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 transition-transform duration-fast group-hover:translate-x-0.5">
                                                        <path d="M11.3 3.3a1 1 0 011.4 0l5 5a1 1 0 010 1.4l-5 5a1 1 0 11-1.4-1.4L14.6 10H4a1 1 0 010-2h10.6l-3.3-3.3a1 1 0 010-1.4z" />
                                                    </svg>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </TiltCard>
                            ))}
                        </RevealOnScroll>
                    </div>
                </section>
            )}

            {/* ---------------- Why Choose Us — bento grid: one bold featured tile + a plain CSS grid for the rest (no absolute positioning, so nothing can misalign) ---------------- */}
            {why.items && (
                <section className="relative overflow-hidden bg-surface-sunken py-24">
                    <GradientMesh variant="light" />
                    <div className="relative mx-auto max-w-container px-4 sm:px-6 lg:px-8">
                        <RevealOnScroll className="mx-auto mb-14 max-w-2xl text-center">
                            <SectionKicker>The Difference</SectionKicker>
                            <h2 className="font-display text-4xl uppercase tracking-wide text-text sm:text-5xl">
                                {whyTitle.split(' ').slice(0, -1).join(' ')}{' '}
                                <span className="relative inline-block rounded-lg bg-primary-subtle px-2 text-primary">
                                    {whyTitle.split(' ').slice(-1)}
                                </span>
                            </h2>
                            <p className="mt-3 text-text-secondary">{why.paragraph}</p>
                        </RevealOnScroll>

                        <RevealOnScroll className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {/* Featured tile: first item, bold solid fill, spans 2 columns on larger screens */}
                            {why.items[0] && (
                                <div className="flex flex-col justify-between rounded-2xl bg-primary p-7 text-on-primary shadow-lg sm:col-span-2">
                                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                                        <WhyChooseIcon name={why.items[0].icon ?? 'shield-check'} />
                                    </span>
                                    <div className="mt-6">
                                        <h3 className="font-display text-2xl uppercase tracking-wide">{why.items[0].title}</h3>
                                        <p className="mt-1.5 max-w-md text-sm leading-relaxed text-white/85">{why.items[0].description}</p>
                                    </div>
                                </div>
                            )}

                            {why.items.slice(1).map((item: { icon?: string; title: string; description: string }, i: number) => (
                                <div
                                    key={i}
                                    className="group rounded-2xl border border-border bg-surface p-6 transition-all duration-normal hover:-translate-y-1 hover:border-primary hover:shadow-lg"
                                >
                                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-subtle text-primary transition-transform duration-normal group-hover:scale-110">
                                        <WhyChooseIcon name={item.icon ?? 'shield-check'} />
                                    </span>
                                    <h3 className="mt-4 font-bold text-text">{item.title}</h3>
                                    <p className="mt-1 text-sm leading-relaxed text-text-secondary">{item.description}</p>
                                </div>
                            ))}
                        </RevealOnScroll>
                    </div>
                </section>
            )}

            {/* ---------------- How It Works ---------------- */}
            {howItWorks.steps && (
                <section className="relative overflow-hidden bg-secondary py-24 text-text-inverse">
                    <GradientMesh className="opacity-60" />
                    <div className="relative mx-auto max-w-container px-4 sm:px-6 lg:px-8">
                        <RevealOnScroll className="mx-auto mb-16 max-w-2xl text-center">
                            <span className="inline-flex items-center rounded-full bg-surface px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-secondary shadow-sm">
                                The Process
                            </span>
                            <h2 className="mt-5 font-display text-4xl uppercase tracking-wide sm:text-5xl">{howItWorksTitle}</h2>
                            {howItWorks.paragraph && <p className="mx-auto mt-4 max-w-xl text-teal-200">{howItWorks.paragraph}</p>}
                        </RevealOnScroll>
                        <RevealOnScroll className="grid gap-8 md:grid-cols-3">
                            {howItWorks.steps.map((step: { title: string; description: string }, i: number) => (
                                <div key={i} className="relative rounded-2xl border border-white/15 bg-white/10 p-6 transition-transform duration-normal hover:-translate-y-1">
                                    <div className="mb-4 flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold">{step.title}</h3>
                                            <p className="mt-1 text-sm text-teal-200">{step.description}</p>
                                        </div>
                                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-surface text-sm font-bold text-secondary">
                                            {i + 1}
                                        </span>
                                    </div>
                                    <StepMockup index={i} />
                                </div>
                            ))}
                        </RevealOnScroll>
                    </div>
                </section>
            )}

            {/* ---------------- Latest News — article-style cards ---------------- */}
            {latestNews.length > 0 && (
                <section className="relative overflow-hidden py-24">
                    <GradientMesh variant="light" />
                    <div className="relative mx-auto max-w-container px-4 sm:px-6 lg:px-8">
                    <RevealOnScroll className="mx-auto mb-14 max-w-2xl text-center">
                        <SectionKicker>Stay Updated</SectionKicker>
                        <h2 className="font-display text-4xl uppercase tracking-wide text-text sm:text-5xl">Discover Our Latest News</h2>
                        <p className="mt-3 text-text-secondary">
                            Application windows, batch announcements, and exam updates across every service you're preparing for.
                        </p>
                    </RevealOnScroll>

                    <RevealOnScroll className="grid gap-6 sm:grid-cols-3">
                        {latestNews.map((item, i) => (
                            <div key={item.id} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-normal hover:-translate-y-1.5 hover:border-primary hover:shadow-2xl">
                                {item.image_path ? (
                                    <img src={`/storage/${item.image_path}`} alt={item.title} className="h-36 w-full object-cover" />
                                ) : (
                                    <div className={`relative flex h-36 items-center justify-center bg-gradient-to-br px-4 text-center ${NEWS_BANNER_GRADIENTS[i % NEWS_BANNER_GRADIENTS.length]}`}>
                                        <span
                                            aria-hidden
                                            className="absolute -right-4 -top-4 h-16 w-16 rotate-12 rounded-lg bg-white/10 transition-transform duration-slow group-hover:rotate-45"
                                        />
                                        <span className="relative font-display text-xl uppercase leading-tight tracking-wide text-white">
                                            {item.organization ?? 'Announcement'}
                                        </span>
                                    </div>
                                )}

                                <div className="flex flex-1 flex-col p-5">
                                    {item.organization && (
                                        <span className="mb-2 inline-block w-fit rounded-full bg-primary-subtle px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-primary">
                                            {item.organization}
                                        </span>
                                    )}
                                    <h3 className="font-bold text-text group-hover:text-primary">{item.title}</h3>
                                    <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-text-secondary">{item.description}</p>

                                    <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs text-text-muted">
                                        <span>Posted {formatDate(item.created_at)}</span>
                                        {item.deadline_date && (
                                            <span className="font-bold text-danger">Apply by {formatDate(item.deadline_date)}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </RevealOnScroll>

                    <RevealOnScroll className="mt-10 text-center">
                        <Link href="/news" className="font-bold uppercase tracking-wide text-primary hover:text-primary-hover">
                            View all news &rarr;
                        </Link>
                    </RevealOnScroll>
                    </div>
                </section>
            )}

            {/* ---------------- Demo Quiz Teaser ---------------- */}
            <section className="mx-auto max-w-container px-4 pb-8 sm:px-6 lg:px-8">
                <RevealOnScroll>
                    <div className="relative overflow-hidden rounded-3xl bg-secondary p-10 text-center text-white shadow-2xl sm:p-16">
                        <GradientMesh />
                        <WaveRibbon />
                        <div className="relative">
                            <SectionKicker dark>
                                <span className="mx-auto">No Login Required</span>
                            </SectionKicker>
                            <h2 className="font-display text-3xl uppercase tracking-wide sm:text-4xl">{demoTeaser.banner_text}</h2>
                            {/* Explicit gold/dark-text, not bg-accent/text-accent-fg -- this
                                card is a dark teal gradient, and accent now means oxblood with
                                light text, which would go nearly invisible here. */}
                            <Link
                                href={demoTeaser.button_link ?? '/demo-quiz'}
                                className="mt-8 inline-block rounded-xl bg-gold-400 px-8 py-4 font-bold uppercase tracking-wide text-secondary shadow-lg transition-transform duration-normal ease-spring hover:-translate-y-0.5 hover:bg-gold-300"
                            >
                                {demoTeaser.button_text ?? 'Start Demo Quiz'}
                            </Link>
                        </div>
                    </div>
                </RevealOnScroll>
            </section>

            {/* ---------------- FAQs — gradient "ask us" panel + accordion ---------------- */}
            {faqs.length > 0 && (
                <section className="relative overflow-hidden py-24">
                    <GradientMesh variant="light" />
                    <div className="relative mx-auto max-w-container px-4 sm:px-6 lg:px-8">
                        <RevealOnScroll className="mx-auto mb-14 max-w-2xl text-center">
                            <SectionKicker>Got Questions?</SectionKicker>
                            <h2 className="font-display text-4xl uppercase tracking-wide text-text sm:text-5xl">Frequently Asked</h2>
                        </RevealOnScroll>

                        <RevealOnScroll className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
                            <div className="relative overflow-hidden rounded-2xl bg-secondary p-8 text-white shadow-lg">
                                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-7 w-7">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h13a2 2 0 012 2v7a2 2 0 01-2 2H10l-4 3v-3H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
                                        <path strokeLinecap="round" d="M8.5 10h7M8.5 13h4.5" />
                                    </svg>
                                </span>
                                <h3 className="mt-6 font-display text-2xl uppercase tracking-wide">Still Have Questions?</h3>
                                <p className="mt-2 text-sm leading-relaxed text-teal-100">
                                    Can't find the answer you're looking for? Our team is happy to help with anything about courses,
                                    payments, or your target exam.
                                </p>
                                <Link
                                    href="/contact"
                                    className="mt-6 inline-block rounded-full bg-white px-6 py-3 text-sm font-bold uppercase tracking-wide text-secondary shadow-sm transition-transform duration-fast hover:-translate-y-0.5"
                                >
                                    Contact Us
                                </Link>
                            </div>

                            <div className="divide-y divide-border rounded-2xl border border-border bg-surface">
                                {faqs.map((faq, i) => (
                                    <FaqAccordionItem key={i} question={faq.question} answer={faq.answer} />
                                ))}
                            </div>
                        </RevealOnScroll>
                    </div>
                </section>
            )}

            {/* ---------------- Testimonials — mixed photo/quote cards ("What Our Customers Say" reference) ---------------- */}
            {testimonials.length > 0 && (
                <section className="relative overflow-hidden bg-surface-sunken py-24">
                    <GradientMesh variant="light" />
                    <div className="relative mx-auto max-w-container px-4 sm:px-6 lg:px-8">
                        <RevealOnScroll className="mx-auto mb-14 max-w-2xl text-center">
                            <SectionKicker>Real Results</SectionKicker>
                            <h2 className="font-display text-4xl uppercase tracking-wide text-text sm:text-5xl">Success Stories</h2>
                        </RevealOnScroll>
                        <RevealOnScroll className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {testimonials.map((t, i) => {
                                // A real student photo earns the wider two-column "feature" card
                                // treatment; text-only testimonials stay compact -- the mixed
                                // layout follows what data actually exists, nothing is staged.
                                const hasPhoto = !!t.photo_path;
                                return (
                                    <div
                                        key={i}
                                        className={`rounded-2xl border border-border bg-surface p-6 shadow-sm transition-shadow duration-normal hover:shadow-md ${hasPhoto ? 'flex items-center gap-5 sm:col-span-2' : ''}`}
                                    >
                                        {hasPhoto && (
                                            <img
                                                src={`/storage/${t.photo_path}`}
                                                alt=""
                                                className="hidden h-24 w-24 flex-shrink-0 rounded-2xl object-cover sm:block"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <LiteMarkdown text={t.testimonial_text} className="text-sm italic leading-relaxed text-text-secondary" />
                                            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                                                <div className="font-semibold text-text">{t.student_name}</div>
                                                {t.rating && (
                                                    <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-subtle px-2.5 py-1 text-xs font-bold text-primary">
                                                        {t.rating.toFixed(1)}
                                                        <span className="flex gap-0.5 text-star">
                                                            {Array.from({ length: 5 }).map((_, s) => (
                                                                <svg key={s} className="h-3 w-3" fill={s < t.rating! ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                                                </svg>
                                                            ))}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </RevealOnScroll>
                    </div>
                </section>
            )}

            {/* ---------------- CTA Footer Banner — text + illustrative "your progress" dashboard preview ---------------- */}
            <section className="mx-auto max-w-container px-4 pb-24 sm:px-6 lg:px-8">
                <RevealOnScroll>
                    <div className="relative overflow-hidden rounded-3xl border-2 border-accent bg-surface-brand p-10 sm:p-16">
                        <div
                            aria-hidden
                            className="absolute -right-10 -top-10 h-40 w-40 rotate-12 rounded-3xl"
                            style={{ backgroundColor: 'rgba(143, 53, 64, 0.1)' }}
                        />

                        <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
                            <div className="text-center lg:text-left">
                                <h2 className="font-display text-4xl uppercase tracking-wide text-secondary sm:text-5xl">
                                    {ctaFooter.heading}
                                </h2>
                                <p className="mt-3 text-text-secondary">{ctaFooter.subheading}</p>
                                <Link
                                    href={ctaFooter.button_link ?? '/register'}
                                    className="mt-8 inline-block rounded-xl bg-accent px-10 py-4 font-bold uppercase tracking-wide text-accent-fg shadow-lg transition-all duration-normal ease-spring hover:-translate-y-0.5 hover:bg-accent-hover"
                                >
                                    {ctaFooter.button_text ?? 'Register Now'}
                                </Link>
                            </div>

                            {/* illustrative preview of the real "Performance Graph" feature
                                (already promised in Why Choose Us) -- mock UI, not a specific
                                user's real data, same convention as the How It Works mockups */}
                            <div className="hidden grid-cols-2 gap-4 lg:grid">
                                <div className="rounded-2xl border border-border bg-surface p-4 shadow-xl">
                                    <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Practice Areas</p>
                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                        {TRUST_TAGS.slice(0, 6).map((tag, i) => (
                                            <span
                                                key={tag}
                                                className="rounded-full bg-primary-subtle px-2.5 py-1 text-[0.65rem] font-bold text-primary"
                                                style={{ transform: `rotate(${Math.sin(i * 1.3) * 8}deg)` }}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-border bg-surface p-4 shadow-xl">
                                    <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Your Progress</p>
                                    <div className="mt-3 flex gap-2">
                                        <div className="rounded-xl bg-primary px-3 py-2 text-on-primary">
                                            <p className="text-[0.6rem] uppercase tracking-wide opacity-80">Accuracy</p>
                                            <p className="font-display text-lg">+35%</p>
                                        </div>
                                        <div className="rounded-xl bg-secondary px-3 py-2 text-white">
                                            <p className="text-[0.6rem] uppercase tracking-wide text-teal-200">Tests Taken</p>
                                            <p className="font-display text-lg">120+</p>
                                        </div>
                                    </div>
                                    <svg viewBox="0 0 200 70" className="mt-3 h-16 w-full" preserveAspectRatio="none">
                                        <polyline
                                            points="0,55 30,45 60,50 90,30 120,38 150,15 180,20 200,5"
                                            fill="none"
                                            stroke="var(--color-primary)"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <circle cx="150" cy="15" r="4" fill="var(--oxblood-500)" />
                                        <circle cx="200" cy="5" r="4" fill="var(--color-primary)" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </RevealOnScroll>
            </section>
        </PublicLayout>
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
