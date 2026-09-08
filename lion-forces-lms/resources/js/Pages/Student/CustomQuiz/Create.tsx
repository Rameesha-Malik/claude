import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import StudentLayout from '@/Layouts/StudentLayout';

interface SubjectOption { id: number; name: string; questions_count: number }
interface Props { subjects: SubjectOption[] }

const inputClass = 'w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-primary focus:shadow-glow focus:outline-none';

export default function CreateCustomQuiz({ subjects }: Props) {
    const form = useForm({
        subject_id: '' as number | '',
        difficulty: '' as '' | 'easy' | 'medium' | 'hard',
        question_count: 10,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post('/portal/custom-quiz');
    }

    return (
        <StudentLayout header="Custom Quiz">
            <Head title="Custom Quiz" />

            <div className="mx-auto max-w-lg rounded-3xl border border-border bg-surface p-6 sm:p-8">
                <h1 className="font-display text-2xl text-text">Build Your Own Quiz</h1>
                <p className="mt-1 text-sm text-text-secondary">
                    Pick a subject, difficulty, and how many questions -- we'll pull a fresh random set from the
                    question bank.
                </p>

                <form onSubmit={submit} className="mt-6 space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-text">Subject</label>
                        <select className={inputClass} value={form.data.subject_id} onChange={(e) => form.setData('subject_id', e.target.value ? Number(e.target.value) : '')}>
                            <option value="">Any subject</option>
                            {subjects.map((s) => (
                                <option key={s.id} value={s.id}>{s.name} ({s.questions_count} questions)</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-text">Difficulty</label>
                        <select className={inputClass} value={form.data.difficulty} onChange={(e) => form.setData('difficulty', e.target.value as typeof form.data.difficulty)}>
                            <option value="">Any difficulty</option>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-text">Number of questions</label>
                        <input
                            type="number"
                            min={1}
                            max={50}
                            className={inputClass}
                            value={form.data.question_count}
                            onChange={(e) => form.setData('question_count', Number(e.target.value))}
                        />
                    </div>

                    {form.errors.question_count && <p className="text-sm text-danger">{form.errors.question_count}</p>}

                    <button
                        type="submit"
                        disabled={form.processing}
                        className="w-full rounded-full bg-primary py-3 text-sm font-bold uppercase tracking-wide text-on-primary shadow-sm hover:bg-primary-hover disabled:opacity-50"
                    >
                        {form.processing ? 'Building…' : 'Start Custom Quiz'}
                    </button>
                </form>
            </div>
        </StudentLayout>
    );
}
