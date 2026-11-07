import { useEffect, useState } from 'react';

interface Instructor {
    name: string;
    photo_path: string | null;
    qualification: string | null;
    experience: string | null;
    bio: string | null;
}

const STRAP_COLORS = ['var(--teal-600)', 'var(--gold-500)', 'var(--teal-800)', 'var(--gold-400)', 'var(--teal-400)'];

/** Deterministic pseudo-random bar widths so each badge's barcode looks distinct but never changes between renders. */
function Barcode({ seed }: { seed: number }) {
    const bars = Array.from({ length: 20 }, (_, i) => {
        const v = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
        return v - Math.floor(v) > 0.55 ? 2 : 1;
    });
    return (
        <div className="flex h-4 items-end justify-center gap-[1.5px]" aria-hidden>
            {bars.map((w, i) => (
                <span key={i} className="bg-text-muted" style={{ width: w, height: i % 4 === 0 ? '100%' : '65%', opacity: 0.45 }} />
            ))}
        </div>
    );
}

/**
 * ID badges hanging on lanyards from a rod, swaying gently, each flippable
 * on click to reveal the instructor's experience + bio on the back. Pure
 * CSS for the sway + flip (no animation library) so it stays cheap on a
 * list that can grow arbitrarily -- same idiom as GradientMesh/WaveRibbon's
 * scoped <style> + prefers-reduced-motion guard.
 */
export default function InstructorBadgeWall({ instructors }: { instructors: Instructor[] }) {
    const [flipped, setFlipped] = useState<number | null>(null);

    useEffect(() => {
        if (flipped === null) return;
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') setFlipped(null);
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [flipped]);

    const active = flipped !== null ? instructors[flipped] : null;

    return (
        <div className="relative">
            <style>{`
                @keyframes badge-sway {
                    0%, 100% { transform: rotate(-2.5deg); }
                    50% { transform: rotate(2.5deg); }
                }
                .badge-sway { animation: badge-sway 4.5s ease-in-out infinite; transform-origin: top center; }
                .badge-sway:hover, .badge-sway.is-flipped { animation-play-state: paused; }
                .badge-flipper { transition: transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1); transform-style: preserve-3d; }
                .badge-face { backface-visibility: hidden; }
                .badge-face-back { transform: rotateY(180deg); }
                @media (prefers-reduced-motion: reduce) {
                    .badge-sway { animation: none; }
                    .badge-flipper { transition: none; }
                }
            `}</style>

            <div aria-hidden className="relative mx-auto mb-7 hidden h-1.5 max-w-3xl rounded-full bg-border sm:block">
                <span className="absolute -left-2.5 -top-1.5 h-4 w-4 rounded-[0.25rem] bg-text-muted/50" />
                <span className="absolute -right-2.5 -top-1.5 h-4 w-4 rounded-[0.25rem] bg-text-muted/50" />
            </div>

            <div className="flex gap-6 overflow-x-auto px-2 pb-4 pt-1 sm:flex-wrap sm:justify-center sm:gap-8 sm:px-0" style={{ scrollSnapType: 'x proximity' }}>
                {instructors.map((instructor, i) => {
                    const color = STRAP_COLORS[i % STRAP_COLORS.length];
                    const isFlipped = flipped === i;
                    return (
                        <div key={i} className="flex flex-shrink-0 flex-col items-center" style={{ scrollSnapAlign: 'center' }}>
                            <div className="h-10 w-2.5 rounded-full sm:h-14" style={{ backgroundColor: color }} />
                            <span className="-mt-1 h-3 w-3 rounded-full border-2 border-surface bg-text-muted shadow" />

                            <button
                                type="button"
                                onClick={() => setFlipped(isFlipped ? null : i)}
                                aria-label={`${instructor.name}: badge, click to ${isFlipped ? 'flip back' : 'see experience and bio'}`}
                                className={`badge-sway group relative mt-1 block w-[168px] sm:w-[188px] ${isFlipped ? 'is-flipped' : ''}`}
                                style={{ animationDelay: `${(i % 5) * 0.35}s`, perspective: '1200px' }}
                            >
                                <div
                                    className="badge-flipper relative h-[224px] w-full sm:h-[246px]"
                                    style={{ transform: isFlipped ? 'rotateY(180deg)' : 'none' }}
                                >
                                    {/* Front */}
                                    <div className="badge-face absolute inset-0 overflow-hidden rounded-[1rem] border border-border bg-surface text-left shadow-lg transition-shadow duration-normal group-hover:shadow-xl">
                                        <div className="h-12 sm:h-14" style={{ backgroundColor: color }} />
                                        <div className="px-3 pb-2 text-center">
                                            <div className="mx-auto -mt-7 h-14 w-14 overflow-hidden rounded-full border-4 border-surface bg-primary-subtle shadow-md sm:-mt-8 sm:h-16 sm:w-16">
                                                {instructor.photo_path ? (
                                                    <img src={`/storage/${instructor.photo_path}`} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <span className="flex h-full w-full items-center justify-center font-display text-lg text-primary">
                                                        {instructor.name.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="mt-2 truncate text-sm font-bold text-text">{instructor.name}</h3>
                                            {instructor.qualification && (
                                                <p className="mt-0.5 truncate text-[0.7rem] font-semibold uppercase tracking-wide text-primary">
                                                    {instructor.qualification}
                                                </p>
                                            )}
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 border-t border-dashed border-border bg-surface-sunken/50 px-3 py-2.5">
                                            <Barcode seed={i + 1} />
                                        </div>
                                    </div>

                                    {/* Back */}
                                    <div className="badge-face badge-face-back absolute inset-0 flex flex-col overflow-hidden rounded-[1rem] border border-border bg-surface text-left shadow-lg">
                                        <div className="h-1.5 flex-shrink-0" style={{ backgroundColor: color }} />
                                        <div className="flex min-h-0 flex-1 flex-col p-3.5">
                                            <p className="flex-shrink-0 text-[0.65rem] font-bold uppercase tracking-wide text-text-muted">Instructor Profile</p>
                                            <h3 className="mt-1 flex-shrink-0 truncate text-sm font-bold text-text">{instructor.name}</h3>
                                            <div className="mt-1.5 min-h-0 flex-1 overflow-y-auto pr-0.5">
                                                {instructor.experience && (
                                                    <p className="text-xs font-semibold text-primary">{instructor.experience}</p>
                                                )}
                                                {instructor.bio && (
                                                    <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">{instructor.bio}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        </div>
                    );
                })}
            </div>

            <p className="mt-5 text-center text-sm text-text-muted">
                {active ? (
                    <>
                        <span className="font-semibold text-text">{active.name}</span>
                        {active.qualification && <span className="text-text-secondary"> — {active.qualification}</span>}
                        <span className="block sm:inline"> · Click again or press Esc to turn it back</span>
                    </>
                ) : (
                    'Click a badge to see experience and bio'
                )}
            </p>
        </div>
    );
}
