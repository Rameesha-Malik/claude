import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import LiteMarkdown from '@/Components/LiteMarkdown';

// Two-row infinite marquee, inspired by the 21st.dev "Testimonials Marquee"
// reference -- rebuilt with GSAP (the one animation lib this project already
// depends on, used by BranchHeroSlider) instead of pulling in a new one just
// for this, and driven by real student testimonials rather than placeholder
// quotes.

export interface TestimonialMarqueeItem {
    student_name: string;
    photo_path: string | null;
    testimonial_text: string;
    rating: number | null;
}

function initials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
}

function Card({ t }: { t: TestimonialMarqueeItem }) {
    return (
        <div className="w-[21rem] flex-shrink-0 rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-center gap-3">
                {t.photo_path ? (
                    <img src={`/storage/${t.photo_path}`} alt="" className="h-10 w-10 flex-shrink-0 rounded-full object-cover" />
                ) : (
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-subtle text-sm font-bold text-primary">
                        {initials(t.student_name)}
                    </span>
                )}
                <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-text">{t.student_name}</div>
                    {t.rating && (
                        <div className="flex gap-0.5 text-star">
                            {Array.from({ length: 5 }).map((_, s) => (
                                <svg key={s} className="h-3 w-3" fill={s < t.rating! ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                </svg>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <LiteMarkdown text={t.testimonial_text} className="mt-3 line-clamp-4 text-sm italic leading-relaxed text-text-secondary" />
        </div>
    );
}

function MarqueeRow({ items, direction, speed }: { items: TestimonialMarqueeItem[]; direction: 'left' | 'right'; speed: number }) {
    const trackRef = useRef<HTMLDivElement>(null);
    const tweenRef = useRef<gsap.core.Tween | null>(null);
    const doubled = [...items, ...items];

    useEffect(() => {
        const el = trackRef.current;
        if (!el) return;
        const halfWidth = el.scrollWidth / 2;
        const duration = halfWidth / speed;

        tweenRef.current = direction === 'left'
            ? gsap.fromTo(el, { x: 0 }, { x: -halfWidth, duration, ease: 'none', repeat: -1 })
            : gsap.fromTo(el, { x: -halfWidth }, { x: 0, duration, ease: 'none', repeat: -1 });

        return () => {
            tweenRef.current?.kill();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items.length, direction]);

    return (
        <div
            className="overflow-hidden"
            onMouseEnter={() => tweenRef.current?.pause()}
            onMouseLeave={() => tweenRef.current?.play()}
        >
            <div ref={trackRef} className="flex w-max gap-4">
                {doubled.map((t, i) => (
                    <Card key={i} t={t} />
                ))}
            </div>
        </div>
    );
}

export default function TestimonialsMarquee({ items }: { items: TestimonialMarqueeItem[] }) {
    if (!items.length) return null;

    // A single row still reads fine duplicated; splitting into two visually
    // distinct rows only helps once there's enough content to not feel like
    // the exact same strip twice.
    const useTwoRows = items.length >= 4;
    const mid = Math.ceil(items.length / 2);
    const rowA = useTwoRows ? items.slice(0, mid) : items;
    const rowB = useTwoRows ? items.slice(mid) : items.slice().reverse();

    return (
        <div className="relative space-y-4">
            <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-surface-sunken to-transparent sm:w-24" />
            <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-surface-sunken to-transparent sm:w-24" />

            <MarqueeRow items={rowA} direction="left" speed={32} />
            <MarqueeRow items={rowB} direction="right" speed={28} />
        </div>
    );
}
