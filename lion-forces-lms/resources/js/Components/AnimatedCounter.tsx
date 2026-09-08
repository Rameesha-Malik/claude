import { animate, onScroll } from 'animejs';
import { useEffect, useRef } from 'react';

interface Props {
    /** e.g. "1,500+", "95%", "20+" — digits are animated, suffix is kept */
    value: string;
    className?: string;
}

export default function AnimatedCounter({ value, className = '' }: Props) {
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const numeric = parseInt(value.replace(/[^0-9]/g, ''), 10);
        const suffix = value.replace(/[0-9,]/g, '');
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (!numeric || prefersReduced) {
            el.textContent = value;
            return;
        }

        const counter = { val: 0 };
        el.textContent = '0' + suffix;

        animate(counter, {
            val: numeric,
            duration: 1400,
            ease: 'outExpo',
            autoplay: onScroll({ enter: 'bottom top' }),
            onUpdate: () => {
                el.textContent = Math.round(counter.val).toLocaleString() + suffix;
            },
        });
    }, [value]);

    return (
        <span ref={ref} className={className}>
            {value}
        </span>
    );
}
