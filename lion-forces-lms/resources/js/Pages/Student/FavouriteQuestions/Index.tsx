import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import CustomQuizTabs from '@/Components/CustomQuizTabs';
import { LiteMarkdownInline } from '@/Components/LiteMarkdown';
import RevealOnScroll from '@/Components/RevealOnScroll';
import StudentLayout from '@/Layouts/StudentLayout';

interface Option { id: number; option_text: string; is_correct: boolean }
interface Question { id: number; question_text: string; explanation: string | null; options: Option[]; subject: { name: string } | null }
interface Favourite { id: number; question: Question }
interface Props { favourites: Favourite[] }

function FavouriteCard({ item }: { item: Favourite }) {
    const [revealed, setRevealed] = useState(false);
    const [removed, setRemoved] = useState(false);

    function remove() {
        router.post(`/questions/${item.question.id}/favourite`, {}, {
            preserveScroll: true,
            onSuccess: () => setRemoved(true),
        });
    }

    if (removed) return null;

    return (
        <div
            className="group relative overflow-hidden rounded-[2rem] p-6 text-white"
            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
        >
            {/* Shine sweep on hover -- a skewed light band that travels across
                the card once, clipped by the card's own overflow-hidden/rounded
                corners. z-0 so it stays behind the real content (z-10 below)
                and the ribbon button, not on top of either. */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 z-0 w-1/3 -translate-x-[150%] skew-x-[-20deg] bg-white/20 transition-transform duration-[1100ms] ease-out group-hover:translate-x-[420%]"
            />

            {/* Bookmark ribbon, not a plain star glyph -- same "remove from
                favourites" action, styled to hang off the card's top edge like
                a real paper bookmark tab. */}
            <button
                onClick={remove}
                title="Remove from favourites"
                className="absolute right-6 top-0 z-20 flex h-11 w-9 items-center justify-center bg-surface text-star transition-opacity hover:opacity-80"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 72%, 0 100%)' }}
            >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2.5l2.35 4.76 5.26.77-3.8 3.7.9 5.24L10 14.5l-4.71 2.47.9-5.24-3.8-3.7 5.26-.77L10 2.5z" />
                </svg>
            </button>

            <div className="relative z-10">
            {item.question.subject && (
                <span className="inline-block rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
                    {item.question.subject.name}
                </span>
            )}
            <p className="mt-2 max-w-[85%] text-lg font-bold leading-snug">
                <LiteMarkdownInline text={item.question.question_text} />
            </p>

            <div className="my-5 border-t border-dashed border-white/25" />

            {revealed ? (
                <div className="space-y-3">
                    <div className="space-y-2 rounded-[1.5rem] bg-surface p-4">
                        {item.question.options.map((opt) => (
                            <div
                                key={opt.id}
                                className={`rounded-[1.5rem] border p-3 text-sm ${opt.is_correct ? 'border-success bg-success-bg text-text' : 'border-border text-text-secondary'}`}
                            >
                                {opt.option_text}
                                {opt.is_correct && <span className="ml-2 text-xs font-bold uppercase text-success">Correct Answer</span>}
                            </div>
                        ))}
                    </div>
                    {item.question.explanation && (
                        <div className="rounded-[1.5rem] bg-surface p-4 text-sm text-text">
                            <span className="font-bold text-primary">Explanation: </span>
                            <LiteMarkdownInline text={item.question.explanation} />
                        </div>
                    )}
                    <button
                        onClick={() => setRevealed(false)}
                        className="rounded-full bg-white/15 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-white/25"
                    >
                        Hide Answer
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setRevealed(true)}
                    className="rounded-full bg-white/15 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-white/25"
                >
                    Reveal Answer
                </button>
            )}
            </div>
        </div>
    );
}

export default function FavouriteQuestionsIndex({ favourites }: Props) {
    return (
        <StudentLayout header="Favourite Questions">
            <Head title="Favourite Questions" />

            <CustomQuizTabs active="favorites" />

            <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
                <p className="max-w-2xl text-sm text-text-secondary">
                    Questions you've starred while attempting a quiz or test land here so you can find them again without
                    re-attempting the whole thing.
                </p>
                <p className="flex-shrink-0 text-sm font-bold uppercase tracking-wide text-text-muted">
                    {favourites.length} question{favourites.length === 1 ? '' : 's'}
                </p>
            </div>

            {favourites.length === 0 ? (
                <div className="rounded-[2rem] border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                    No favourites yet. Tap the star on any question while taking a quiz or test to save it here.
                </div>
            ) : (
                <RevealOnScroll staggerMs={40} className="space-y-5">
                    {favourites.map((item) => (
                        <FavouriteCard key={item.id} item={item} />
                    ))}
                </RevealOnScroll>
            )}
        </StudentLayout>
    );
}
