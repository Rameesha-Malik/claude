import { useForm } from '@inertiajs/react';

export interface BulkUploadResult { added: number; errors: string[] }

const inputClass = 'w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:shadow-glow focus:outline-none';
const btnClass = 'rounded-lg bg-primary px-4 py-2 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover disabled:opacity-50';

const CSV_TEMPLATE = [
    'Subject,Topic,Difficulty,Question,Option A,Option B,Option C,Option D,Correct Answer,Explanation',
    'Pakistan Studies,Constitutional History,easy,"In which year was the 1973 Constitution of Pakistan adopted?",1971,1973,1977,1985,B,"The current Constitution of Pakistan was adopted on 10 April 1973."',
].join('\n');

// Bulk-adds into the shared Question Bank via CSV -- used from Content
// Library's Questions tab, and from inside the Quiz builder so an admin
// can import many MCQs at once without leaving the quiz they're
// building. preserveState keeps the embedding page's own unsaved state
// (e.g. a partly-filled-in Quiz form) intact when the redirect-back lands.
export function QuestionBankBulkUploadForm({ onDone }: { onDone: () => void }) {
    const form = useForm<{ csv: File | null }>({ csv: null });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.data.csv) return;
        form.post('/admin/content-library/questions/bulk', { preserveState: true, onSuccess: () => { form.reset(); onDone(); } });
    }

    return (
        <form onSubmit={submit} className="mb-6 space-y-3 rounded-2xl border border-border bg-surface p-5">
            <p className="text-sm text-text-secondary">
                Upload a CSV instead of adding questions one at a time. Columns, in order: Subject, Topic
                (optional), Difficulty (easy/medium/hard), Question, Option A–D, Correct Answer (A/B/C/D),
                Explanation (optional). A Subject or Topic that doesn't exist yet is created automatically.
            </p>
            <a
                href={`data:text/csv;charset=utf-8,${encodeURIComponent(CSV_TEMPLATE)}`}
                download="question-bank-template.csv"
                className="inline-block text-sm font-bold uppercase text-primary hover:underline"
            >
                Download CSV Template
            </a>
            <input
                type="file"
                accept=".csv,text/csv"
                className={inputClass}
                onChange={(e) => form.setData('csv', e.target.files?.[0] ?? null)}
            />
            <button type="submit" disabled={form.processing || !form.data.csv} className={btnClass}>
                {form.processing ? 'Uploading…' : 'Upload'}
            </button>
            {Object.values(form.errors).map((m, i) => <div key={i} className="text-sm text-danger">{String(m)}</div>)}
        </form>
    );
}

export function QuestionBankBulkUploadResult({ result }: { result: BulkUploadResult }) {
    return (
        <div className="mb-6 rounded-2xl border border-border bg-surface p-5">
            <p className="font-semibold text-text">
                {result.added} question{result.added === 1 ? '' : 's'} added
                {result.errors.length > 0 ? `, ${result.errors.length} row${result.errors.length === 1 ? '' : 's'} skipped.` : '.'}
            </p>
            {result.errors.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm text-danger">
                    {result.errors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
            )}
        </div>
    );
}
