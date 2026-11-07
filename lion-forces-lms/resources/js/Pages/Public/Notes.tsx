import { Head, Link } from '@inertiajs/react';
import Barcode from '@/Components/Barcode';
import RevealOnScroll from '@/Components/RevealOnScroll';
import SectionKicker from '@/Components/SectionKicker';
import PublicLayout from '@/Layouts/PublicLayout';

interface NoteItem {
    id: number; title: string; content: string | null; price: string | null; is_paid: boolean; unlocked: boolean;
    subject: { name: string } | null; courses: { id: number; title: string; slug: string }[];
}

// One "included with" line, label left / dotted leader / value right --
// the receipt-style line-item look from the client's reference. Still a
// real link to the course (as the old course pills were), just restyled.
function DottedRow({ label, value, href }: { label: string; value: string; href?: string }) {
    const content = (
        <>
            <span className="min-w-0 flex-shrink truncate uppercase tracking-wide text-text group-hover:text-primary">{label}</span>
            <span className="h-0 flex-1 border-b border-dotted border-border" />
            <span className="flex-shrink-0 uppercase tracking-wide text-text-muted group-hover:text-primary">{value}</span>
        </>
    );
    if (href) {
        return <Link href={href} className="group flex items-baseline gap-2 text-[0.7rem]">{content}</Link>;
    }
    return <div className="group flex items-baseline gap-2 text-[0.7rem]">{content}</div>;
}

// Client shared a "receipt ticket" pricing-card reference (dashed dividers,
// monospace, barcode + order-number footer) and asked for the Notes cards
// to look like it. Adapted to what a note actually has -- no fake
// subtotal/discount line since there's no second price to subtract, and
// the barcode/"No." footer use the note's own real id, not a made-up one.
function NoteReceiptCard({ note }: { note: NoteItem }) {
    const priceLabel = !note.is_paid ? 'Free' : note.unlocked ? 'Unlocked' : `Rs. ${Number(note.price).toLocaleString()}`;
    const isLocked = note.is_paid && !note.unlocked;
    const ctaHref = isLocked ? `/portal/notes/${note.id}/purchase` : `/notes/${note.id}`;
    const ctaLabel = isLocked ? `Buy Now (Rs. ${Number(note.price).toLocaleString()})` : 'View Note';

    return (
        <div className="flex flex-col rounded-[0.75rem] border border-border bg-surface p-6 font-mono shadow-sm transition-all duration-normal hover:-translate-y-1 hover:shadow-lg">
            <div className="text-center">
                <p className="truncate text-sm font-bold uppercase tracking-wide text-text">{note.subject?.name ?? 'Lion Forces Academy'}</p>
                {note.courses.length > 0 && (
                    <p className="mt-1 truncate text-[0.6rem] uppercase tracking-wide text-text-muted">
                        {note.courses.map((c) => c.title).join(' · ')}
                    </p>
                )}
            </div>

            <div className="my-4 border-t border-dashed border-border" />

            <Link href={`/notes/${note.id}`} className="font-sans text-sm font-bold normal-case text-text hover:text-primary">
                {note.title}
            </Link>
            {note.content && <p className="mt-1 line-clamp-2 font-sans text-xs normal-case text-text-secondary">{note.content}</p>}

            {note.courses.length > 0 && (
                <>
                    <div className="my-4 border-t border-dashed border-border" />
                    <div className="space-y-2">
                        {note.courses.slice(0, 3).map((c) => (
                            <DottedRow key={c.id} label={c.title} value="Incl" href={`/courses/${c.slug}`} />
                        ))}
                    </div>
                </>
            )}

            <div className="my-4 border-t border-dashed border-border" />

            <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-text">Price</span>
                <span className={`font-display text-xl tracking-wide ${isLocked ? 'text-text' : 'text-success'}`}>{priceLabel}</span>
            </div>

            <Link
                href={ctaHref}
                className="mt-5 block rounded-[0.5rem] bg-secondary py-3 text-center text-xs font-bold uppercase tracking-wide text-on-secondary transition-all duration-fast hover:bg-teal-800"
            >
                {ctaLabel}
            </Link>

            <Barcode seed={note.id} barCount={26} className="mt-5 h-7" />
            <p className="mt-2 text-center text-[0.6rem] uppercase tracking-wide text-text-muted">
                No. {String(note.id).padStart(4, '0')} · Thank You
            </p>
        </div>
    );
}

export default function Notes({ notes }: { notes: NoteItem[] }) {
    return (
        <PublicLayout>
            <Head title="Notes" />

            <section className="relative overflow-hidden bg-secondary py-20 text-center text-white">
                <div className="relative mx-auto max-w-container px-4 sm:px-6 lg:px-8">
                    <SectionKicker dark><span className="mx-auto">Study Material</span></SectionKicker>
                    <h1 className="font-display text-5xl uppercase tracking-wide sm:text-6xl">Notes</h1>
                    <p className="mx-auto mt-4 max-w-xl text-teal-200">
                        Subject-wise notes bundled into every course, including Guaranteed Notes on select packages.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-container px-4 py-20 sm:px-6 lg:px-8">
                {notes.length === 0 ? (
                    <p className="text-center text-text-secondary">No notes published yet. Check back soon.</p>
                ) : (
                    <RevealOnScroll staggerMs={60} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {notes.map((n) => <NoteReceiptCard key={n.id} note={n} />)}
                    </RevealOnScroll>
                )}
            </section>

            <section className="bg-surface-sunken py-20 text-center">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                    <h2 className="font-display text-3xl uppercase tracking-wide text-text sm:text-4xl">Want full access?</h2>
                    <p className="mt-3 text-text-secondary">Enroll in a course to unlock the complete notes bank plus lectures and practice tests.</p>
                    <Link
                        href="/courses"
                        className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-on-primary shadow-sm transition-all duration-fast hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-md"
                    >
                        Browse Courses
                    </Link>
                </div>
            </section>
        </PublicLayout>
    );
}
