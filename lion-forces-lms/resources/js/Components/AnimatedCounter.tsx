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

        // parseInt + stripping every non-digit used to also strip the
        // decimal point itself -- "66.50%" became the digit string
        // "6650", so the counter animated up to (and landed on) "6,650%"
        // instead of "66.5%". Keeping "." in the strip-allowlist and
        // using parseFloat preserves it; the earlier 0.00%-only testing
        // never caught this because stripping "0.00" still parses as 0,
        // which falls into the !numeric early-return below either way.
        const numeric = parseFloat(value.replace(/[^0-9.]/g, ''));
        const suffix = value.replace(/[0-9,.]/g, '');
        const decimals = value.match(/\.(\d+)/)?.[1]?.length ?? 0;
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
                el.textContent = (decimals > 0 ? counter.val.toFixed(decimals) : Math.round(counter.val).toLocaleString()) + suffix;
            },
        });
    }, [value]);

    return (
        <span ref={ref} className={className}>
            {value}
        </span>
    );
}
