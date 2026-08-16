import { useState } from 'react';

// Shared accordion row for FAQ lists (Home + Contact) -- single open/close
// state per item, no shared "only one open at a time" behavior since each
// list is short enough that it isn't needed.
export default function FaqAccordionItem({ question, answer }: { question: string; answer: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div>
            <button
                className="flex w-full items-center justify-between px-6 py-5 text-left font-medium text-text"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
            >
                {question}
                <svg
                    className={`h-5 w-5 flex-shrink-0 text-text-muted transition-transform duration-fast ${open ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {open && <div className="px-6 pb-5 text-sm text-text-secondary">{answer}</div>}
        </div>
    );
}
