import { animate, stagger } from 'animejs';
import { PropsWithChildren, useEffect, useRef } from 'react';

interface Props {
    className?: string;
    /** ms delay before the group starts */
    delay?: number;
    /** stagger gap between direct children, ms */
    staggerMs?: number;
    y?: number;
}

/**
 * Fades + slides its direct children up on scroll-into-view, staggered.
 * Respects prefers-reduced-motion by skipping straight to the end state
 * (tokens.css already zeroes durations globally, but we also short-circuit
 * here so no IntersectionObserver work happens for those users at all).
 */
export default function RevealOnScroll({
    children,
    className = '',
    delay = 0,
    staggerMs = 90,
    y = 24,
}: PropsWithChildren<Props>) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const items = Array.from(el.children) as HTMLElement[];

        if (prefersReduced) {
            items.forEach((item) => {
                item.style.opacity = '1';
                item.style.transform = 'none';
            });
            return;
        }

        items.forEach((item) => {
            item.style.opacity = '0';
            item.style.transform = `translateY(${y}px)`;
        });

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        animate(items, {
                            opacity: [0, 1],
                            translateY: [y, 0],
                            duration: 650,
                            delay: stagger(staggerMs, { start: delay }),
                            ease: 'outExpo',
                        });
                        observer.unobserve(el);
                    }
                });
            },
            // Fires while the section is still 300px below the viewport, not
            // only once it's already visible -- at normal scroll speed this
            // gives the (up to ~650ms + stagger) animation time to finish
            // before a reader's eyes actually reach it. Without this, a
            // multi-item grid with a real stagger delay (e.g. 6 cards) could
            // still be mid-fade -- looking washed-out, not broken -- right as
            // it scrolls into view.
            { threshold: 0.01, rootMargin: '0px 0px 300px 0px' },
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [delay, staggerMs, y]);

    return (
        <div ref={ref} className={className}>
            {children}
        </div>
    );
}
