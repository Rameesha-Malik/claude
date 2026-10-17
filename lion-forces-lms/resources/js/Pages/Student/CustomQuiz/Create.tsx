import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import StudentLayout from '@/Layouts/StudentLayout';

interface SubjectOption { id: number; name: string; questions_count: number }
interface TopicOption { id: number; subject_id: number; name: string }
interface CourseInfo { id: number; title: string; slug: string }
interface Props { subjects: SubjectOption[]; topics: TopicOption[]; locked?: boolean; course?: CourseInfo | null }

const inputClass = 'w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-primary focus:shadow-glow focus:outline-none';

export default function CreateCustomQuiz({ subjects, topics, locked = false, course = null }: Props) {
    const form = useForm({
        subject_id: '' as number | '',
        topic_id: '' as number | '',
        difficulty: '' as '' | 'easy' | 'medium' | 'hard',
        question_count: 10,
        course_id: course?.id ?? ('' as number | ''),
    });

    // Topic is scoped to a subject -- only offer topics under whichever
    // subject is currently picked, same reasoning as the admin form.
    const availableTopics = topics.filter((t) => t.subject_id === form.data.subject_id);

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post('/portal/custom-quiz');
    }

    if (locked) {
        return (
            <StudentLayout header="Custom Quiz">
                <Head title="Custom Quiz" />

                <div className="mx-auto max-w-lg rounded-3xl border border-dashed border-border bg-surface p-8 text-center">
                    <h1 className="font-display text-2xl text-text">Custom Quiz is Locked</h1>
                    <p className="mt-2 text-sm text-text-secondary">
                        {course
                            ? `Buy "${course.title}" (with quiz access) to build custom quizzes from its question bank.`
                            : 'Buy a course that includes quiz access to build your own random quizzes from the question bank.'}
                    </p>
                    <Link
                        href={course ? `/courses/${course.slug}` : '/courses'}
                        className="mt-6 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-on-primary shadow-sm hover:bg-primary-hover"
                    >
                        {course ? 'View Course' : 'Browse Courses'}
                    </Link>
                </div>
            </StudentLayout>
        );
    }

    return (
        <StudentLayout header="Custom Quiz">
            <Head title="Custom Quiz" />

            <div className="mx-auto max-w-lg rounded-3xl border border-border bg-surface p-6 sm:p-8">
                <h1 className="font-display text-2xl text-text">Build Your Own Quiz</h1>
                <p className="mt-1 text-sm text-text-secondary">
                    {course ? `For "${course.title}" -- ` : ''}Pick a subject (and optionally a topic within it), difficulty, and how many questions -- we'll
                    pull a fresh random set from the question bank.
                </p>

                <form onSubmit={submit} className="mt-6 space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-text">Subject</label>
                        <select
                            className={inputClass}
                            value={form.data.subject_id}
                            onChange={(e) => form.setData((prev) => ({ ...prev, subject_id: e.target.value ? Number(e.target.value) : '', topic_id: '' }))}
                        >
                            <option value="">Any subject</option>
                            {subjects.map((s) => (
                                <option key={s.id} value={s.id}>{s.name} ({s.questions_count} questions)</option>
                            ))}
                        </select>
                    </div>

                    {availableTopics.length > 0 && (
                        <div>
                            <label className="mb-1 block text-sm font-medium text-text">Topic</label>
                            <select className={inputClass} value={form.data.topic_id} onChange={(e) => form.setData('topic_id', e.target.value ? Number(e.target.value) : '')}>
                                <option value="">Any topic in this subject</option>
                                {availableTopics.map((t) => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

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
