import { animate } from 'animejs';
import { PropsWithChildren, useRef } from 'react';

interface Props {
    className?: string;
    /** max tilt in degrees */
    max?: number;
}

/**
 * CSS 3D perspective tilt on pointer move, spring-back on leave. Skipped
 * entirely on touch (no hover) and reduced-motion, both correctly signaled
 * by pointer:coarse / prefers-reduced-motion rather than guessed from UA.
 */
export default function TiltCard({ children, className = '', max = 10 }: PropsWithChildren<Props>) {
    const ref = useRef<HTMLDivElement>(null);
    const enabled =
        typeof window !== 'undefined' &&
        window.matchMedia('(hover: hover)').matches &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function handleMove(e: React.PointerEvent<HTMLDivElement>) {
        if (!enabled || !ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;

        animate(ref.current, {
            rotateY: px * max * 2,
            rotateX: -py * max * 2,
            duration: 200,
            ease: 'outQuad',
        });
    }

    function handleLeave() {
        if (!enabled || !ref.current) return;
        animate(ref.current, { rotateX: 0, rotateY: 0, duration: 500, ease: 'outElastic(1, 0.6)' });
    }

    return (
        <div
            ref={ref}
            onPointerMove={handleMove}
            onPointerLeave={handleLeave}
            className={className}
            style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
        >
            {children}
        </div>
    );
}
