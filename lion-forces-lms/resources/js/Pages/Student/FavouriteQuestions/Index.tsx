import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
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
        <div className="rounded-3xl border border-border bg-surface p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                    {item.question.subject && (
                        <span className="mb-1 inline-block rounded-full bg-primary-subtle px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-primary">
                            {item.question.subject.name}
                        </span>
                    )}
                    <p className="font-semibold text-text">{item.question.question_text}</p>
                </div>
                <button
                    onClick={remove}
                    title="Remove from favourites"
                    className="flex-shrink-0 text-xl text-gold-500 hover:opacity-70"
                >
                    ★
                </button>
            </div>

            {revealed ? (
                <>
                    <div className="space-y-2">
                        {item.question.options.map((opt) => (
                            <div
                                key={opt.id}
                                className={`rounded-2xl border p-3 text-sm ${opt.is_correct ? 'border-success bg-success-bg text-text' : 'border-border text-text-secondary'}`}
                            >
                                {opt.option_text}
                                {opt.is_correct && <span className="ml-2 text-xs font-bold uppercase text-success">Correct Answer</span>}
                            </div>
                        ))}
                    </div>
                    {item.question.explanation && (
                        <div className="mt-3 rounded-2xl bg-primary-subtle p-3 text-sm text-text">
                            <span className="font-bold text-primary">Explanation: </span>
                            {item.question.explanation}
                        </div>
                    )}
                </>
            ) : (
                <button
                    onClick={() => setRevealed(true)}
                    className="rounded-full border border-border px-4 py-2 text-sm font-bold uppercase tracking-wide text-text transition-colors hover:border-primary hover:text-primary"
                >
                    Reveal Answer
                </button>
            )}
        </div>
    );
}

export default function FavouriteQuestionsIndex({ favourites }: Props) {
    return (
        <StudentLayout header="Favourite Questions">
            <Head title="Favourite Questions" />

            <p className="mb-6 max-w-2xl text-sm text-text-secondary">
                Questions you've starred while attempting a quiz or test land here so you can find them again without
                re-attempting the whole thing.
            </p>

            {favourites.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                    No favourites yet — tap the star on any question while taking a quiz or test to save it here.
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
