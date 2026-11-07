import { useCallback, useEffect, useRef, useState } from 'react';

// Adapted from the 21st.dev "3D Coverflow Carousel" (dg.singh252525) -- rebuilt
// against this site's own data (NewsAnnouncement) and theme tokens (teal/gold)
// instead of the original's hardcoded restaurant content and near-black palette.

export interface NewsCarouselItem {
    id: number;
    title: string;
    description: string | null;
    organization: string | null;
    image_path: string | null;
    deadline_date: string | null;
}

interface Props {
    items: NewsCarouselItem[];
    viewAllHref?: string;
}

function formatDate(v: string) {
    return new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Same two-gradient cycle Home.tsx uses for photo-less news cards elsewhere,
// just expressed as CSS var strings since this component owns its own inline
// transforms rather than Tailwind's bg-gradient-to-br utilities.
const FALLBACK_GRADIENTS = [
    'linear-gradient(160deg, var(--color-primary), var(--teal-900))',
    'linear-gradient(160deg, var(--teal-900), var(--color-primary))',
];

function ChevronLeftIcon() {
    return (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
    );
}

function ChevronRightIcon() {
    return (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
    );
}

function ArrowRightIcon() {
    return (
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
    );
}

export default function NewsCoverflowCarousel({ items, viewAllHref = '/news' }: Props) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
    const touchStartX = useRef(0);
    const total = items.length;

    const nextSlide = useCallback(() => setCurrentIndex((p) => (p + 1) % total), [total]);
    const prevSlide = useCallback(() => setCurrentIndex((p) => (p - 1 + total) % total), [total]);
    const goToSlide = (idx: number) => setCurrentIndex(idx % total);

    useEffect(() => {
        if (isHovered || lightboxSrc || total <= 1) return;
        const interval = setInterval(nextSlide, 5500);
        return () => clearInterval(interval);
    }, [isHovered, lightboxSrc, nextSlide, total]);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (lightboxSrc) {
                if (e.key === 'Escape') setLightboxSrc(null);
                return;
            }
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'ArrowRight') nextSlide();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [nextSlide, prevSlide, lightboxSrc]);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };
    const handleTouchEnd = (e: React.TouchEvent) => {
        const diff = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(diff) > 45) (diff < 0 ? nextSlide() : prevSlide());
    };

    if (!items.length) return null;

    const centerImage = items[currentIndex].image_path ? `/storage/${items[currentIndex].image_path}` : null;

    return (
        <div
            className="relative flex min-h-[480px] w-full select-none items-center justify-center overflow-hidden py-8 sm:min-h-[560px]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Ambient background -- blurred center slide, swaps as it changes */}
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                {centerImage ? (
                    <img
                        key={centerImage}
                        src={centerImage}
                        alt=""
                        className="h-full w-full scale-110 object-cover"
                        style={{ filter: 'brightness(0.35) blur(40px)' }}
                    />
                ) : (
                    <div className="h-full w-full" style={{ background: FALLBACK_GRADIENTS[currentIndex % 2] }} />
                )}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            'radial-gradient(ellipse at center, rgba(4,167,157,0.3) 0%, rgba(5,79,76,0.55) 45%, var(--color-secondary) 85%)',
                    }}
                />
            </div>

            <div
                className="relative z-10 flex h-[380px] w-full items-center justify-center sm:h-[460px]"
                style={{ perspective: '1400px' }}
            >
                {items.map((item, idx) => {
                    const offset = (idx - currentIndex + total) % total;

                    let transform = 'translateX(0px) scale(0.4) rotateY(0deg)';
                    let opacity = 0;
                    let zIndex = 0;
                    let filterCss = 'brightness(0.4) blur(2px)';
                    let isCenter = false;

                    if (offset === 0) {
                        isCenter = true;
                        transform = 'translateX(0px) scale(1) rotateY(0deg)';
                        opacity = 1;
                        zIndex = 30;
                        filterCss = 'brightness(1)';
                    } else if (offset === 1) {
                        transform = 'translateX(210px) scale(0.82) rotateY(-24deg)';
                        opacity = 0.65;
                        zIndex = 20;
                        filterCss = 'brightness(0.75)';
                    } else if (offset === 2) {
                        transform = 'translateX(380px) scale(0.66) rotateY(-38deg)';
                        opacity = 0.35;
                        zIndex = 10;
                        filterCss = 'brightness(0.55) blur(1px)';
                    } else if (offset === total - 1) {
                        transform = 'translateX(-210px) scale(0.82) rotateY(24deg)';
                        opacity = 0.65;
                        zIndex = 20;
                        filterCss = 'brightness(0.75)';
                    } else if (offset === total - 2) {
                        transform = 'translateX(-380px) scale(0.66) rotateY(38deg)';
                        opacity = 0.35;
                        zIndex = 10;
                        filterCss = 'brightness(0.55) blur(1px)';
                    }

                    const imgSrc = item.image_path ? `/storage/${item.image_path}` : null;

                    return (
                        <div
                            key={item.id}
                            onClick={() => !isCenter && goToSlide(idx)}
                            className="absolute h-[340px] w-[240px] overflow-hidden rounded-[1.25rem] border border-white/10 shadow-2xl transition-all duration-700 ease-out sm:h-[420px] sm:w-[290px]"
                            style={{
                                transform,
                                opacity,
                                zIndex,
                                filter: filterCss,
                                transformOrigin: 'center center',
                                cursor: isCenter ? 'default' : 'pointer',
                                background: FALLBACK_GRADIENTS[idx % 2],
                            }}
                        >
                            {imgSrc && (
                                <img src={imgSrc} alt={item.title} className="absolute inset-0 h-full w-full object-cover" />
                            )}
                            {!imgSrc && (
                                <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
                                    <span className="font-display text-xl uppercase tracking-wide text-white/90">
                                        {item.organization ?? 'Announcement'}
                                    </span>
                                </div>
                            )}

                            <div
                                aria-hidden
                                className="pointer-events-none absolute inset-0"
                                style={{
                                    background:
                                        'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.65) 58%, rgba(0,0,0,0.95) 100%)',
                                }}
                            />

                            <div
                                className="relative flex h-full flex-col justify-end p-5 text-center transition-[opacity,transform] duration-500"
                                style={{
                                    opacity: isCenter ? 1 : 0,
                                    transform: isCenter ? 'translateY(0px)' : 'translateY(14px)',
                                    pointerEvents: isCenter ? 'auto' : 'none',
                                }}
                            >
                                {item.organization && (
                                    <span className="absolute right-4 top-4 inline-block rounded-full bg-white/15 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-white">
                                        {item.organization}
                                    </span>
                                )}
                                <h3 className="line-clamp-2 font-display text-xl uppercase leading-tight tracking-wide text-white">{item.title}</h3>
                                <div
                                    className="mx-auto my-2 h-0.5 w-8 rounded-full"
                                    style={{ background: 'var(--gold-400)', boxShadow: '0 0 8px rgba(232,193,95,0.7)' }}
                                />
                                {item.description && (
                                    <p className="mx-auto mb-2 line-clamp-2 max-w-[15rem] text-xs italic leading-snug text-white/85">
                                        {item.description}
                                    </p>
                                )}
                                {item.deadline_date && (
                                    <span
                                        className="mx-auto mb-3 inline-block w-fit rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-white"
                                        style={{ background: 'var(--color-danger)' }}
                                    >
                                        Apply by {formatDate(item.deadline_date)}
                                    </span>
                                )}
                                <div className="flex items-center justify-center gap-2">
                                    {imgSrc && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setLightboxSrc(imgSrc);
                                            }}
                                            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[0.7rem] font-bold uppercase tracking-wide text-secondary shadow-lg transition-transform duration-fast hover:-translate-y-0.5"
                                            style={{ background: 'linear-gradient(135deg, var(--gold-400), var(--gold-300))' }}
                                        >
                                            View Poster
                                        </button>
                                    )}
                                    <a
                                        href={viewAllHref}
                                        onClick={(e) => e.stopPropagation()}
                                        className="inline-flex items-center gap-1.5 rounded-full border border-white/30 px-4 py-2 text-[0.7rem] font-bold uppercase tracking-wide text-white transition-colors duration-fast hover:bg-white/10"
                                    >
                                        All News <ArrowRightIcon />
                                    </a>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {total > 1 && (
                <>
                    <button
                        type="button"
                        onClick={prevSlide}
                        aria-label="Previous announcement"
                        className="absolute left-2 top-1/2 z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition-colors duration-fast hover:bg-black/60 sm:left-6"
                    >
                        <ChevronLeftIcon />
                    </button>
                    <button
                        type="button"
                        onClick={nextSlide}
                        aria-label="Next announcement"
                        className="absolute right-2 top-1/2 z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition-colors duration-fast hover:bg-black/60 sm:right-6"
                    >
                        <ChevronRightIcon />
                    </button>
                </>
            )}

            {total > 1 && (
                <div className="absolute bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2">
                    {items.map((_, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => goToSlide(idx)}
                            aria-label={`Go to announcement ${idx + 1}`}
                            className="h-2 rounded-full transition-all duration-normal"
                            style={{
                                width: idx === currentIndex ? '28px' : '8px',
                                background: idx === currentIndex ? 'var(--gold-400)' : 'rgba(255,255,255,0.25)',
                            }}
                        />
                    ))}
                </div>
            )}

            {lightboxSrc && (
                <div
                    role="dialog"
                    aria-modal="true"
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-6"
                    onClick={() => setLightboxSrc(null)}
                >
                    <img src={lightboxSrc} alt="" className="max-h-full max-w-full rounded-xl object-contain shadow-2xl" />
                    <button
                        type="button"
                        onClick={() => setLightboxSrc(null)}
                        aria-label="Close poster"
                        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl text-white transition-colors duration-fast hover:bg-white/20"
                    >
                        &times;
                    </button>
                </div>
            )}
        </div>
    );
}
