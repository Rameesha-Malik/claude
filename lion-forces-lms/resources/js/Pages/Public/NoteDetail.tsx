import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import PublicLayout from '@/Layouts/PublicLayout';

interface NoteRecord {
    id: number; title: string; content: string | null; file_path: string | null; price: string | null; is_paid: boolean; unlocked: boolean;
    subject: { name: string } | null; courses: { id: number; title: string; slug: string }[];
}
interface FaqItem { id: number; question: string; answer: string }
interface TestimonialItem { id: number; student_name: string; photo_path: string | null; testimonial_text: string; rating: number | null }
interface Props { note: NoteRecord; faqs: FaqItem[]; testimonials: TestimonialItem[] }

function FaqRow({ faq }: { faq: FaqItem }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="rounded-2xl border border-border bg-surface">
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center justify-between gap-3 p-4 text-left text-sm font-semibold text-text"
            >
                {faq.question}
                <span className={`flex-shrink-0 text-text-muted transition-transform ${open ? 'rotate-45' : ''}`}>+</span>
            </button>
            {open && <p className="border-t border-border p-4 text-sm text-text-secondary">{faq.answer}</p>}
        </div>
    );
}

export default function NoteDetail({ note, faqs, testimonials }: Props) {
    return (
        <PublicLayout>
            <Head title={note.title} />

            <section className="bg-gradient-to-br from-secondary to-teal-950 py-16 text-white">
                <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
                    <Link href="/notes" className="text-sm text-teal-200 hover:underline">← All Notes</Link>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        {note.subject && (
                            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-teal-200">
                                {note.subject.name}
                            </span>
                        )}
                        {note.is_paid && (
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${note.unlocked ? 'bg-success-bg text-success' : 'bg-warning-bg text-warning'}`}>
                                {note.unlocked ? 'Unlocked' : `Rs. ${Number(note.price).toLocaleString()}`}
                            </span>
                        )}
                    </div>
                    <h1 className="mt-3 font-display text-4xl uppercase tracking-wide sm:text-5xl">{note.title}</h1>
                </div>
            </section>

            <section className="mx-auto grid max-w-container gap-10 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8">
                <div className="space-y-10 lg:col-span-2">
                    <div className="rounded-2xl border border-border bg-surface p-6">
                        {note.unlocked ? (
                            <>
                                {note.content && <p className="whitespace-pre-line text-text-secondary">{note.content}</p>}
                                {note.file_path && (
                                    <a
                                        href={`/storage/${note.file_path}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover"
                                    >
                                        Download PDF
                                    </a>
                                )}
                            </>
                        ) : (
                            <>
                                {note.content && <p className="line-clamp-3 text-text-secondary">{note.content}</p>}
                                <div className="mt-5 rounded-xl border border-dashed border-border bg-surface-sunken p-6 text-center">
                                    <p className="font-bold text-text">This note is locked</p>
                                    <p className="mt-1 text-sm text-text-secondary">Purchase this note individually to unlock the full content.</p>
                                    <Link
                                        href={`/portal/notes/${note.id}/purchase`}
                                        className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover"
                                    >
                                        Buy Now — Rs. {Number(note.price).toLocaleString()}
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>

                    {note.courses.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold text-text">Also included in</h2>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {note.courses.map((c) => (
                                    <Link
                                        key={c.id}
                                        href={`/courses/${c.slug}`}
                                        className="rounded-full bg-surface-sunken px-3 py-1.5 text-sm font-semibold text-text-secondary hover:bg-primary-subtle hover:text-primary"
                                    >
                                        {c.title}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {faqs.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold text-text">Frequently Asked Questions</h2>
                            <div className="mt-4 space-y-2">
                                {faqs.map((f) => <FaqRow key={f.id} faq={f} />)}
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-fit space-y-4">
                    {testimonials.length > 0 && (
                        <>
                            <h2 className="text-xl font-semibold text-text">What students say</h2>
                            {testimonials.map((t) => (
                                <div key={t.id} className="rounded-2xl border border-border bg-surface p-5">
                                    {t.rating && <p className="text-xs text-warning">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</p>}
                                    <p className="mt-2 text-sm italic text-text-secondary">&ldquo;{t.testimonial_text}&rdquo;</p>
                                    <p className="mt-3 text-sm font-bold text-text">{t.student_name}</p>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}
