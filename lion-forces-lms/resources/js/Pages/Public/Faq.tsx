import { Head } from '@inertiajs/react';
import FaqAccordionItem from '@/Components/FaqAccordionItem';
import PublicLayout from '@/Layouts/PublicLayout';

interface Faq { question: string; answer: string }
interface Props { faqs: Faq[] }

export default function FaqPage({ faqs }: Props) {
    return (
        <PublicLayout>
            <Head title="FAQ" />

            <section className="bg-gradient-to-br from-secondary to-teal-950 py-16 text-white">
                <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
                    <h1 className="font-display text-4xl uppercase tracking-wide sm:text-5xl">Frequently Asked Questions</h1>
                </div>
            </section>

            <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
                {faqs.length > 0 ? (
                    <div className="divide-y divide-border rounded-2xl border border-border bg-surface">
                        {faqs.map((f, i) => <FaqAccordionItem key={i} question={f.question} answer={f.answer} />)}
                    </div>
                ) : (
                    <p className="text-text-secondary">No FAQs yet.</p>
                )}
            </section>
        </PublicLayout>
    );
}
