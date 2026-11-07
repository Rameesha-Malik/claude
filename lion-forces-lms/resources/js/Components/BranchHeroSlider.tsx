import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionKicker from '@/Components/SectionKicker';
import branchArmy from '@/assets/hero/branch-army.jpg';
import branchNavy from '@/assets/hero/branch-navy.jpg';
import branchAirforce from '@/assets/hero/branch-airforce.jpg';
import armyCrest from '@/assets/crests/army-crest.png';
import navyCrest from '@/assets/crests/navy-crest.png';
import airforceCrest from '@/assets/crests/airforce-crest.png';

export interface HeroSlideData {
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

// Per-branch bits that aren't admin content: the official crest (a fixed
// real symbol, not site copy) and the bundled fallback photo shown until
// an admin uploads their own -- same fallback-until-replaced pattern as
// every other image upload in Admin > Website.
const BRANCH_ASSETS: Record<string, { crest: string; crestAlt: string; fallbackImage: string; imageAlt: string }> = {
    army: { crest: armyCrest, crestAlt: 'Pakistan Army crest', fallbackImage: branchArmy, imageAlt: 'Pakistan Army officers on parade' },
    navy: { crest: navyCrest, crestAlt: 'Pakistan Navy crest', fallbackImage: branchNavy, imageAlt: 'Pakistan Navy officer on parade' },
    airforce: { crest: airforceCrest, crestAlt: 'Pakistan Air Force crest', fallbackImage: branchAirforce, imageAlt: 'Pakistan Air Force officers on parade' },
};

function ArrowIcon({ className = 'h-4 w-4' }: { className?: string }) {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 10h12M11 5l5 5-5 5" />
        </svg>
    );
}

function ChevronDownIcon({ className = 'h-4 w-4' }: { className?: string }) {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 7.5 10 13l5-5.5" />
        </svg>
    );
}

/**
 * Homepage hero: a scroll-pinned slider cycling Army / Navy / Air Force.
 * Content (title, motto, description, CTA link, photo) comes from the
 * admin-editable `slides` prop (Admin > Website > Hero Slides); only the
 * crest and fallback photo per branch are fixed in code.
 *
 * The scroll-pin + scrub mechanic only runs at lg and up, matching this
 * site's other lg-only scroll/hover flourishes -- a pinned section is a
 * poor fit for mobile scrolling, so under lg the slides render as a plain
 * stacked list instead (see the `lg:hidden` block below).
 */
export default function BranchHeroSlider({ slides }: { slides: HeroSlideData[] }) {
    const total = slides.length;

    const sectionRef = useRef<HTMLDivElement>(null);
    const pinRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<ScrollTrigger | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const headerHeightRef = useRef(80);
    const [panelHeight, setPanelHeight] = useState('calc(100vh - 80px)');

    // Measured, not a fixed 80px/5rem guess -- the public header's real
    // height varies (its nav row can grow/scroll with more nav items), so a
    // hardcoded offset undershoots and lets this panel pin out from under
    // the header, or leave a gap, instead of sitting flush below it.
    useEffect(() => {
        function measure() {
            const h = document.querySelector('header')?.getBoundingClientRect().height;
            if (!h) return;
            headerHeightRef.current = h;
            setPanelHeight(`calc(100vh - ${h}px)`);
        }
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, []);

    useEffect(() => {
        if (total < 2) return;

        gsap.registerPlugin(ScrollTrigger);
        const mm = gsap.matchMedia();

        mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
            const st = ScrollTrigger.create({
                trigger: sectionRef.current,
                // A function (not a plain string) so ScrollTrigger re-reads
                // the live measured height on every refresh/resize.
                start: () => `top ${headerHeightRef.current}px`,
                end: () => `+=${(total - 1) * window.innerHeight * 0.9}`,
                pin: pinRef.current,
                scrub: 0.6,
                snap: { snapTo: 1 / (total - 1), duration: 0.4, ease: 'power1.inOut' },
                onUpdate(self) {
                    const idx = Math.min(total - 1, Math.round(self.progress * (total - 1)));
                    setActiveIndex((prev) => (prev === idx ? prev : idx));
                },
            });
            triggerRef.current = st;

            return () => {
                triggerRef.current = null;
                st.kill();
            };
        });

        return () => mm.revert();
    }, [total]);

    function goTo(idx: number) {
        const st = triggerRef.current;
        if (!st || total < 2) return;
        const target = st.start + (idx / (total - 1)) * (st.end - st.start);
        window.scrollTo({ top: target, behavior: 'smooth' });
    }

    if (total === 0) return null;

    return (
        <section className="relative bg-secondary">
            {/* Mobile/tablet: plain stacked slides, no scroll-pin */}
            <div className="lg:hidden">
                {slides.map((slide) => (
                    <BranchSlideContent key={slide.branch_key} slide={slide} />
                ))}
            </div>

            {/* Desktop: scroll-pinned slider */}
            <div ref={sectionRef} className="relative hidden lg:block">
                <div ref={pinRef} className="relative overflow-hidden" style={{ height: panelHeight }}>
                    {slides.map((slide, i) => (
                        <div
                            key={slide.branch_key}
                            className="absolute inset-0 transition-opacity duration-slower ease-in-out"
                            style={{ opacity: i === activeIndex ? 1 : 0, pointerEvents: i === activeIndex ? 'auto' : 'none' }}
                        >
                            <BranchSlideContent slide={slide} reversed={i % 2 === 1} active={i === activeIndex} />
                        </div>
                    ))}

                    {/* Branch crest nav: all three crests always visible, stacked in the
                        gutter between the two columns -- replaces both the old single
                        per-slide "seam badge" (which only ever showed the active branch)
                        and the plain dot row, since this does the same job (jump to a
                        slide) while actually showing what each slide is. */}
                    {total > 1 && (
                        <div className="absolute left-1/2 top-1/2 z-20 hidden -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4 lg:flex">
                            {slides.map((slide, i) => {
                                const assets = BRANCH_ASSETS[slide.branch_key] ?? BRANCH_ASSETS.army;
                                const crest = slide.crest_path ? `/storage/${slide.crest_path}` : assets.crest;
                                const isActive = i === activeIndex;
                                return (
                                    <button
                                        key={slide.branch_key}
                                        type="button"
                                        onClick={() => goTo(i)}
                                        aria-label={`Show ${slide.branch} slide`}
                                        aria-current={isActive}
                                        className={`flex flex-shrink-0 items-center justify-center rounded-full border-4 shadow-xl transition-all duration-normal ${
                                            isActive
                                                ? 'h-16 w-16 border-secondary bg-primary p-2.5'
                                                : 'h-11 w-11 border-secondary/70 bg-black/30 p-2 opacity-70 hover:opacity-100'
                                        }`}
                                    >
                                        <img src={crest} alt={assets.crestAlt} className="h-full w-full object-contain" />
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {activeIndex < total - 1 && (
                        <div className="absolute bottom-8 right-8 z-10 hidden items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-teal-200 sm:flex">
                            Scroll
                            <ChevronDownIcon className="h-3.5 w-3.5 animate-float motion-reduce:animate-none" />
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

function BranchSlideContent({ slide, reversed = false, active = true }: { slide: HeroSlideData; reversed?: boolean; active?: boolean }) {
    const assets = BRANCH_ASSETS[slide.branch_key] ?? BRANCH_ASSETS.army;
    const image = slide.image_path ? `/storage/${slide.image_path}` : assets.fallbackImage;
    const crest = slide.crest_path ? `/storage/${slide.crest_path}` : assets.crest;

    return (
        <div className="relative mx-auto flex h-full max-w-container flex-col items-center gap-10 px-4 py-16 sm:px-6 lg:h-full lg:flex-row lg:gap-28 lg:px-8 lg:py-0">
            <div className={`relative w-full lg:w-1/2 lg:min-w-0 ${reversed ? 'lg:order-2' : ''}`}>
                <div
                    className="relative aspect-[4/5] w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl transition-transform duration-slower ease-out"
                    style={{
                        // Hugs the OUTER edge of its column (away from the gutter)
                        // instead of centering -- centering left equal dead space on
                        // both sides, including outside the photo where nothing
                        // else fills it. The inner (gutter-facing) side keeps
                        // whatever space is left over for the crest nav below.
                        marginLeft: reversed ? 'auto' : 0,
                        marginRight: reversed ? 0 : 'auto',
                        transform: active ? 'scale(1)' : 'scale(1.04)',
                    }}
                >
                    <img src={image} alt={assets.imageAlt} className="h-full w-full object-cover" />
                    <div
                        aria-hidden
                        className="absolute inset-0"
                        style={{ background: 'linear-gradient(to top, rgba(4, 39, 38, 0.75), rgba(4, 39, 38, 0.1) 55%, transparent 80%)' }}
                    />
                    <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-black/30 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                        <img src={crest} alt={assets.crestAlt} className="h-6 w-6 object-contain" />
                        {slide.branch}
                    </div>
                </div>
            </div>

            <div className={`w-full text-center lg:w-1/2 lg:min-w-0 lg:text-left ${reversed ? 'lg:order-1' : ''}`}>
                <SectionKicker dark>{slide.branch}</SectionKicker>
                <h1 className="font-display text-5xl uppercase leading-[1.05] text-white sm:text-6xl">{slide.title}</h1>
                {slide.motto && (
                    <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-gold-300">
                        {slide.motto}
                        {slide.motto_translation && <span className="block text-xs font-medium normal-case tracking-normal text-teal-300">{slide.motto_translation}</span>}
                    </p>
                )}
                <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-teal-200 lg:mx-0">{slide.description}</p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                    <Link
                        href={slide.cta_href}
                        className="inline-flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-primary px-5 py-3 text-xs font-bold uppercase tracking-wide text-on-primary shadow-lg transition-all duration-normal ease-spring hover:-translate-y-0.5 hover:shadow-xl sm:px-6 sm:text-sm"
                    >
                        Browse Courses
                        <ArrowIcon className="h-3.5 w-3.5" />
                    </Link>
                    <Link
                        href="/demo-quiz"
                        className="inline-flex flex-shrink-0 items-center whitespace-nowrap rounded-full border-2 border-white/30 px-5 py-3 text-xs font-bold uppercase tracking-wide text-white transition-all duration-normal hover:-translate-y-0.5 hover:border-white/60 sm:px-6 sm:text-sm"
                    >
                        Demo Quiz
                    </Link>
                </div>
            </div>
        </div>
    );
}
