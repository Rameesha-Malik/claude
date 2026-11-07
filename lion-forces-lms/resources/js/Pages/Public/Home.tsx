import { Head, Link } from '@inertiajs/react';
import AnimatedCounter from '@/Components/AnimatedCounter';
import BranchHeroSlider from '@/Components/BranchHeroSlider';
import FaqAccordionItem from '@/Components/FaqAccordionItem';
import FeaturedCoursesCarousel from '@/Components/FeaturedCoursesCarousel';
import GradientMesh from '@/Components/GradientMesh';
import NewsCoverflowCarousel from '@/Components/NewsCoverflowCarousel';
import RevealOnScroll from '@/Components/RevealOnScroll';
import SectionKicker from '@/Components/SectionKicker';
import TestimonialsMarquee from '@/Components/TestimonialsMarquee';
import TiltCard from '@/Components/TiltCard';
import WaveRibbon from '@/Components/WaveRibbon';
import WhyChooseIcon from '@/Components/WhyChooseIcon';
import armyCrest from '@/assets/crests/army-crest.png';
import navyCrest from '@/assets/crests/navy-crest.png';
import airforceCrest from '@/assets/crests/airforce-crest.png';
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
    crest_path: string | null;
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
                <section className="relative overflow-hidden bg-secondary pb-8 pt-10">
                    <GradientMesh className="opacity-50" />

                    {/* decorative -- real exam/service names already named in the hero copy above,
                        just surfaced as a tag ribbon instead of plain prose. Tilt is back (just
                        rotate, no translateY) -- the vertical offset was what created the uneven
                        row gaps, rotation alone doesn't. Wider cap (5xl, not 3xl) so the row
                        doesn't leave such large flat margins at wide viewports. Colors reference
                        --color-primary directly (not raw teal-700/teal-500 stops) so this tracks
                        the live theme; gold stays a primitive pair since that's the deliberate
                        "second brand voice" choice for dark surfaces (see SectionKicker's own
                        comment on gold-vs-oxblood-by-surface). */}
                    <div aria-hidden className="relative mx-auto flex max-w-5xl flex-wrap justify-center gap-3 px-6">
                        {TRUST_TAGS.map((tag, i) => (
                            <span
                                key={tag}
                                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide shadow-lg sm:text-sm ${i % 2 === 0 ? 'text-white' : 'text-on-accent'}`}
                                style={{
                                    background: i % 2 === 0
                                        ? 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))'
                                        : 'linear-gradient(135deg, var(--gold-400), var(--gold-300))',
                                    transform: `rotate(${Math.sin(i * 0.7) * 5}deg)`,
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
                <section className="relative overflow-hidden bg-surface pb-8 pt-8">
                    <GradientMesh variant="light" />

                    {/* Real branch crests (not the generic academy ShieldMark) in the wide
                        side margins either side of the fan stack -- those margins sit
                        outside the max-w-3xl content column below and were empty on
                        anything wider than ~1024px. Navy on the left, Army on the right. */}
                    {/* opacity-* (not a `text-primary/[0.05]` slash modifier) -- `primary`
                        is a plain CSS color value, not an alpha-ready channel triplet, so
                        that modifier silently resolves to fully opaque (see the Home hero
                        and About panel gradient fixes for the same underlying issue). */}
                    <img src={navyCrest} aria-hidden alt="" className="pointer-events-none absolute -left-16 top-1/2 hidden h-72 w-72 -translate-y-1/2 opacity-[0.1] xl:block" />
                    <img src={armyCrest} aria-hidden alt="" className="pointer-events-none absolute -right-16 top-1/2 hidden h-72 w-72 -translate-y-1/2 rotate-12 opacity-[0.1] xl:block" />

                    <RevealOnScroll className="relative mx-auto mb-4 max-w-2xl px-4 text-center sm:px-6">
                        <SectionKicker>What We Cover</SectionKicker>
                        <h2 className="font-display text-4xl uppercase tracking-wide text-secondary sm:text-5xl">
                            What We Prepare You For
                        </h2>
                        <p className="mt-3 text-text-secondary">Structured training across every major service entry test.</p>
                    </RevealOnScroll>

                    {/* Fan stack -- own overflow-hidden box so rotated/offset cards never
                        widen the page, regardless of viewport size. */}
                    <div className="relative mx-auto mt-10 h-[22rem] max-w-3xl overflow-hidden px-4 sm:h-[26rem] sm:px-6">
                        {/* Was a fixed h-[26rem] inside a parent that's only h-[22rem] below sm --
                            bigger than its own clipping box, so overflow-hidden cut it off at a
                            hard straight edge instead of letting it fade out. Now smaller than the
                            parent at every breakpoint, with the gradient's own transparent stop
                            pulled earlier (85%, not 100%) so it visually reaches zero well before
                            any edge, backed by a heavier blur for a soft rather than sharp fade. */}
                        <div
                            aria-hidden
                            className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-[60px] sm:h-80 sm:w-80"
                            style={{ background: 'radial-gradient(circle, var(--color-primary-subtle), var(--teal-300) 60%, transparent 85%)' }}
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
                                                    {service.icon === 'shield' ? (
                                                        <img src={armyCrest} alt="" className="h-7 w-7 object-contain" />
                                                    ) : service.icon === 'anchor' ? (
                                                        <div className="flex items-center -space-x-1.5">
                                                            <img src={navyCrest} alt="" className="h-5 w-5 object-contain" />
                                                            <img src={airforceCrest} alt="" className="h-5 w-5 object-contain" />
                                                        </div>
                                                    ) : (
                                                        <ServiceIcon name={service.icon} />
                                                    )}
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
                                <div key={i} className={`absolute z-20 hidden max-w-[10rem] rounded-[1.25rem] border border-border bg-surface px-3 py-2 shadow-lg sm:block ${positions[i]}`}>
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

            {/* ---------------- Featured Courses — horizontal scroll-snap deck ---------------- */}
            {featuredCourses.length > 0 && (
                <section className="relative overflow-hidden bg-surface-sunken pb-8 pt-8">
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
                        <RevealOnScroll>
                            <FeaturedCoursesCarousel courses={featuredCourses} />
                        </RevealOnScroll>
                    </div>
                </section>
            )}

            {/* ---------------- Why Choose Us — bento grid: one bold featured tile + a plain CSS grid for the rest (no absolute positioning, so nothing can misalign) ---------------- */}
            {why.items && (
                <section className="relative overflow-hidden bg-surface-sunken pb-8 pt-8">
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
                                <div className="flex flex-col rounded-[1.5rem] bg-primary p-7 text-on-primary shadow-lg sm:col-span-2">
                                    <div className="flex items-center gap-4">
                                        <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/15">
                                            <WhyChooseIcon name={why.items[0].icon ?? 'shield-check'} />
                                        </span>
                                        <h3 className="font-display text-2xl uppercase tracking-wide">{why.items[0].title}</h3>
                                    </div>
                                    <p className="mt-3 max-w-md text-sm leading-relaxed text-white/85">{why.items[0].description}</p>
                                </div>
                            )}

                            {why.items.slice(1).map((item: { icon?: string; title: string; description: string }, i: number) => (
                                <div
                                    key={i}
                                    className="group rounded-[1.5rem] border border-border bg-surface p-6 transition-all duration-normal hover:-translate-y-1 hover:border-primary hover:shadow-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary transition-transform duration-normal group-hover:scale-110">
                                            <WhyChooseIcon name={item.icon ?? 'shield-check'} />
                                        </span>
                                        <h3 className="font-bold text-text">{item.title}</h3>
                                    </div>
                                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">{item.description}</p>
                                </div>
                            ))}
                        </RevealOnScroll>
                    </div>
                </section>
            )}

            {/* ---------------- How It Works ---------------- */}
            {howItWorks.steps && (
                <section className="relative overflow-hidden bg-secondary pb-8 pt-8 text-text-inverse">
                    <GradientMesh className="opacity-60" />
                    <div className="relative mx-auto max-w-container px-4 sm:px-6 lg:px-8">
                        <RevealOnScroll className="mx-auto mb-16 max-w-2xl text-center lg:max-w-6xl">
                            <span className="inline-flex items-center rounded-full bg-surface px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-secondary shadow-sm">
                                The Process
                            </span>
                            <h2 className="mt-5 font-display text-4xl uppercase tracking-wide sm:text-5xl">{howItWorksTitle}</h2>
                            {howItWorks.paragraph && <p className="mx-auto mt-4 max-w-xl text-teal-200 lg:max-w-none">{howItWorks.paragraph}</p>}
                        </RevealOnScroll>
                        <RevealOnScroll className="grid gap-8 md:grid-cols-3">
                            {howItWorks.steps.map((step: { title: string; description: string }, i: number) => (
                                <div key={i} className="relative rounded-2xl border border-white/25 bg-white/10 p-6 transition-transform duration-normal hover:-translate-y-1">
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

            {/* ---------------- Latest News — 3D coverflow poster carousel ---------------- */}
            {latestNews.length > 0 && (
                // bg-teal-950, not bg-secondary -- How It Works right above this is
                // already bg-secondary, and two identical dark-teal sections back to
                // back with no divider read as one merged block.
                <section className="relative overflow-hidden bg-teal-950 pb-8 pt-8 text-text-inverse">
                    {/* opacity-20, not the usual opacity-60 -- How It Works right
                        above uses that same bright GradientMesh treatment, and at
                        matching brightness the two sections' blobs washed out the
                        darker teal-950 base, undoing the contrast that color change
                        was for. Dialed down so the darker base actually reads. */}
                    <GradientMesh className="opacity-20" />
                    <div className="relative mx-auto max-w-container px-4 sm:px-6 lg:px-8">
                        <RevealOnScroll className="mx-auto mb-10 max-w-2xl text-center">
                            <SectionKicker dark>Stay Updated</SectionKicker>
                            <h2 className="font-display text-4xl uppercase tracking-wide sm:text-5xl">Discover Our Latest News</h2>
                            <p className="mt-3 text-teal-200">
                                Application windows, batch announcements, and exam updates across every service you're preparing for.
                            </p>
                        </RevealOnScroll>
                    </div>

                    {/* Full-bleed, outside the max-w-container padding -- the coverflow
                        needs real room either side of the centered card for the dimmed
                        neighbors and nav arrows, same as the reference design (edge to
                        edge, not boxed in). */}
                    <RevealOnScroll>
                        <NewsCoverflowCarousel items={latestNews} viewAllHref="/news" />
                    </RevealOnScroll>
                </section>
            )}

            {/* ---------------- Demo Quiz Teaser ---------------- */}
            {/* bg-white, not the page's minty --color-canvas -- right after
                the very dark News section, a clean white band reads much
                better than canvas's slight mint tint. */}
            <section className="bg-white px-4 pb-8 pt-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-container">
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
                </div>
            </section>

            {/* ---------------- FAQs — gradient "ask us" panel + accordion ---------------- */}
            {faqs.length > 0 && (
                <section className="relative overflow-hidden pb-8 pt-8">
                    <GradientMesh variant="light" />
                    <div className="relative mx-auto max-w-container px-4 sm:px-6 lg:px-8">
                        <RevealOnScroll className="mx-auto mb-14 max-w-2xl text-center">
                            <SectionKicker>Got Questions?</SectionKicker>
                            <h2 className="font-display text-4xl uppercase tracking-wide text-text sm:text-5xl">Frequently Asked</h2>
                        </RevealOnScroll>

                        <RevealOnScroll className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
                            <div className="relative overflow-hidden rounded-[1.5rem] bg-secondary p-8 text-white shadow-lg">
                                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
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

                            <div className="divide-y divide-border overflow-hidden rounded-[1.5rem] border border-border bg-surface">
                                {faqs.map((faq, i) => (
                                    <FaqAccordionItem key={i} question={faq.question} answer={faq.answer} />
                                ))}
                            </div>
                        </RevealOnScroll>
                    </div>
                </section>
            )}

            {/* ---------------- Testimonials — two-row infinite marquee ---------------- */}
            {testimonials.length > 0 && (
                <section className="relative overflow-hidden bg-surface-sunken pb-8 pt-8">
                    <GradientMesh variant="light" />
                    <div className="relative mx-auto mb-10 max-w-2xl px-4 text-center sm:px-6">
                        <RevealOnScroll>
                            <SectionKicker>Real Results</SectionKicker>
                            <h2 className="font-display text-4xl uppercase tracking-wide text-text sm:text-5xl">Success Stories</h2>
                        </RevealOnScroll>
                    </div>

                    <RevealOnScroll>
                        <TestimonialsMarquee items={testimonials} />
                    </RevealOnScroll>
                </section>
            )}

            {/* ---------------- CTA Footer Banner — text + illustrative "your progress" dashboard preview ---------------- */}
            <section className="mx-auto max-w-container px-4 pb-8 sm:px-6 lg:px-8">
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
