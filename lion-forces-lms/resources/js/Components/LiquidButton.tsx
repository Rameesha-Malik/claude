import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';

type Tone = 'dark' | 'light' | 'danger' | 'warning' | 'success';

interface Props {
    href?: string;
    onClick?: () => void;
    type?: 'button' | 'submit';
    tone?: Tone;
    /** 'pill' (default): the usual button/badge shape, row-laid-out
     *  children. 'tile': a rounded-rect block for stat tiles, whose
     *  children (label/value/sub stacked as separate lines) need to lay
     *  out as a block, not a centered row. */
    shape?: 'pill' | 'tile';
    disabled?: boolean;
    /** Padding/text-size/margin are each caller's own call (sizes differ
     *  across every place this is used) -- deliberately NOT given a
     *  default here, since a same-specificity utility clash (e.g. this
     *  component's own px-5 vs. a caller's px-4) is decided by CSS source
     *  order, not by className string order, so it can't be reliably
     *  overridden by appending to this prop. */
    className: string;
    children: ReactNode;
}

// Each tone's gradient fill, rim-light color, and text color -- the same
// three real semantic colors this app already uses for primary/danger/
// warning/success everywhere else, just rendered with the glossy "liquid
// metal" treatment instead of a flat fill. color-mix darkens a token
// in place rather than inventing a new raw hex for the gradient's dark
// stop.
const TONES: Record<Tone, { gradient: string; rim: string; text: string; glow: string }> = {
    dark: {
        gradient: 'linear-gradient(160deg, var(--teal-700) 0%, var(--teal-950) 55%, var(--teal-900) 100%)',
        rim: 'linear-gradient(135deg, rgba(255,255,255,.6), rgba(255,255,255,0) 30%, rgba(255,255,255,0) 65%, var(--gold-400))',
        text: 'text-white',
        glow: 'rgba(3,41,39,.35)',
    },
    light: {
        gradient: 'linear-gradient(160deg, var(--neutral-0) 0%, var(--neutral-200) 55%, var(--neutral-100) 100%)',
        rim: 'linear-gradient(135deg, rgba(255,255,255,.9), rgba(255,255,255,0) 30%, rgba(255,255,255,0) 65%, var(--teal-600))',
        text: 'text-secondary',
        glow: 'rgba(0,0,0,.12)',
    },
    danger: {
        gradient: 'linear-gradient(160deg, var(--red-600) 0%, color-mix(in srgb, var(--red-700) 60%, black) 55%, var(--red-700) 100%)',
        rim: 'linear-gradient(135deg, rgba(255,255,255,.55), rgba(255,255,255,0) 30%, rgba(255,255,255,0) 65%, var(--neutral-0))',
        text: 'text-white',
        glow: 'rgba(185,28,28,.35)',
    },
    warning: {
        gradient: 'linear-gradient(160deg, var(--amber-600) 0%, color-mix(in srgb, var(--amber-700) 55%, black) 55%, var(--amber-700) 100%)',
        rim: 'linear-gradient(135deg, rgba(255,255,255,.65), rgba(255,255,255,0) 30%, rgba(255,255,255,0) 65%, var(--neutral-0))',
        text: 'text-white',
        glow: 'rgba(180,83,9,.35)',
    },
    success: {
        gradient: 'linear-gradient(160deg, var(--green-600) 0%, color-mix(in srgb, var(--green-700) 60%, black) 55%, var(--green-700) 100%)',
        rim: 'linear-gradient(135deg, rgba(255,255,255,.6), rgba(255,255,255,0) 30%, rgba(255,255,255,0) 65%, var(--gold-400))',
        text: 'text-white',
        glow: 'rgba(5,100,45,.35)',
    },
};

// Dark, glossy pill -- a gradient fill, a thin diagonal rim-light border,
// and an inner top highlight for the "liquid metal" look the client
// asked for, now rolled out past just the "Browse Courses" CTAs: Save/
// Delete actions, Reveal/Hide Answer, badges, stat tiles, filter pills,
// Retake, Continue/Complete. Renders as a real <Link> when href is given,
// a <button> when onClick/type is, or a plain non-interactive <span> for
// pill-style badges/labels that aren't clickable (e.g. a subject tag).
export default function LiquidButton({ href, onClick, type, tone = 'dark', shape = 'pill', disabled, className, children }: Props) {
    const t = TONES[tone];
    const roundedClass = shape === 'tile' ? 'rounded-[1.5rem]' : 'rounded-full';
    const baseClassName = `group relative overflow-hidden font-bold transition-transform duration-normal ease-spring ${roundedClass} ${
        shape === 'tile' ? 'block text-left' : 'inline-flex items-center justify-center gap-1.5'
    } ${disabled ? 'opacity-50' : 'hover:-translate-y-0.5'} ${t.text} ${className}`;
    const style = {
        background: t.gradient,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,.25), inset 0 -1px 3px rgba(0,0,0,.45), 0 8px 20px ${t.glow}`,
    };
    const rim = (
        <span
            aria-hidden
            className={`pointer-events-none absolute inset-0 ${roundedClass} opacity-80 transition-opacity duration-normal group-hover:opacity-100`}
            style={{
                padding: 1,
                background: t.rim,
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
            }}
        />
    );
    const content = (
        <span className={`relative z-10 ${shape === 'tile' ? 'block' : 'flex items-center gap-1.5'}`}>{children}</span>
    );

    if (href) {
        return (
            <Link href={href} className={baseClassName} style={style}>
                {rim}
                {content}
            </Link>
        );
    }

    if (onClick || type) {
        return (
            <button type={type ?? 'button'} onClick={onClick} disabled={disabled} className={baseClassName} style={style}>
                {rim}
                {content}
            </button>
        );
    }

    return (
        <span className={baseClassName} style={style}>
            {rim}
            {content}
        </span>
    );
}
