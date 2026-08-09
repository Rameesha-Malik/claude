import { Head } from '@inertiajs/react';
import RevealOnScroll from '@/Components/RevealOnScroll';
import PublicLayout from '@/Layouts/PublicLayout';

interface Instructor { name: string; photo_path: string | null; qualification: string | null; experience: string | null; bio: string | null }
interface Props {
    instructors: Instructor[];
    section: { title: string; content: { paragraph?: string; items?: { title: string; description: string }[] } } | null;
}

export default function About({ instructors, section }: Props) {
    return (
        <PublicLayout>
            <Head title="About Us" />

            <section className="bg-surface-brand py-20">
                <div className="mx-auto max-w-container px-4 text-center sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-bold text-secondary sm:text-5xl">About Lion Forces Academy</h1>
                    <p className="mx-auto mt-4 max-w-2xl text-text-secondary">
                        A modern, results-driven learning platform built for Pakistan Armed Forces test preparation. We
                        provide structured training, smart assessments, and performance tracking to help candidates
                        prepare with confidence and clarity.
                    </p>
                </div>
            </section>

            {section?.content.items && (
                <section className="mx-auto max-w-container px-4 py-20 sm:px-6 lg:px-8">
                    <RevealOnScroll className="mx-auto mb-4 max-w-2xl text-center">
                        <h2 className="text-3xl font-bold text-text">Our Core Values</h2>
                        <p className="mt-3 text-text-secondary">{section.content.paragraph}</p>
                    </RevealOnScroll>
                    <RevealOnScroll className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {section.content.items.map((item, i) => (
                            <div key={i} className="rounded-2xl border border-border bg-surface p-6">
                                <h3 className="font-semibold text-text">{item.title}</h3>
                                <p className="mt-1 text-sm text-text-secondary">{item.description}</p>
                            </div>
                        ))}
                    </RevealOnScroll>
                </section>
            )}

            {instructors.length > 0 && (
                <section className="bg-surface-sunken py-20">
                    <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
                        <RevealOnScroll className="mx-auto mb-12 max-w-2xl text-center">
                            <h2 className="text-3xl font-bold text-text">Our Instructors</h2>
                        </RevealOnScroll>
                        <RevealOnScroll className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {instructors.map((instructor, i) => (
                                <div key={i} className="rounded-2xl border border-border bg-surface p-6 text-center">
                                    <div className="mx-auto h-20 w-20 rounded-full bg-primary-subtle" />
                                    <h3 className="mt-4 font-semibold text-text">{instructor.name}</h3>
                                    <p className="text-sm text-primary">{instructor.qualification}</p>
                                    <p className="mt-2 text-sm text-text-secondary">{instructor.bio}</p>
                                </div>
                            ))}
                        </RevealOnScroll>
                    </div>
                </section>
            )}
        </PublicLayout>
    );
}
