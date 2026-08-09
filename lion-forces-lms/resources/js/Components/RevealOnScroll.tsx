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
            { threshold: 0.15 },
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
