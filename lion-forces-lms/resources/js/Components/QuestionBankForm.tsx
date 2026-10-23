import { useForm } from '@inertiajs/react';
import RichTextArea from '@/Components/RichTextArea';

interface Subject { id: number; name: string }
interface Topic { id: number; subject_id: number; name: string }
interface CourseOption { id: number; title: string }

const inputClass = 'w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:shadow-glow focus:outline-none';
const btnClass = 'rounded-lg bg-primary px-4 py-2 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover disabled:opacity-50';

interface Props {
    subjects: Subject[];
    topics: Topic[];
    /** Already-known course (embedded in that course's own Quiz builder) -- the course is locked instead of picked. */
    course?: CourseOption;
    /** Free course picker, used when there's no single obvious course (Content Library's own Questions tab). */
    courses?: CourseOption[];
    onDone: () => void;
}

// Adds straight into the shared Question Bank (question_bank table) --
// used from Content Library's own Questions tab, and from inside the
// Quiz builder so an admin can add a brand-new MCQ without leaving the
// quiz they're building. preserveState keeps whichever page embeds this
// (e.g. a partly-filled-in Quiz form) from losing its own unsaved state
// when the redirect-back lands.
//
// Course is required (see the migration that added question_bank.
// course_id) -- Custom Quiz only shows a student the questions tagged to
// the course whose quiz module they bought, so an untagged question would
// never actually reach anyone.
export default function QuestionBankForm({ subjects, topics, course, courses = [], onDone }: Props) {
    const form = useForm({
        subject_id: '',
        topic_id: '',
        course_id: course ? String(course.id) : '',
        question_text: '',
        explanation: '',
        difficulty: 'medium',
        options: [{ option_text: '', is_correct: true }, { option_text: '', is_correct: false }, { option_text: '', is_correct: false }, { option_text: '', is_correct: false }],
    });

    const availableTopics = topics.filter((t) => String(t.subject_id) === form.data.subject_id);

    function setOption(i: number, field: 'option_text' | 'is_correct', value: string | boolean) {
        const options = [...form.data.options];
        if (field === 'is_correct') {
            options.forEach((o, j) => (o.is_correct = j === i));
        } else {
            options[i] = { ...options[i], option_text: value as string };
        }
        form.setData('options', options);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.post('/admin/content-library/questions', { preserveState: true, onSuccess: () => { form.reset(); onDone(); } });
    }

    return (
        <form onSubmit={submit} className="mb-6 space-y-3 rounded-2xl border border-border bg-surface p-5">
            {course ? (
                <p className="text-sm text-text-secondary">Adding to <span className="font-semibold text-text">{course.title}</span></p>
            ) : (
                <select required className={inputClass} value={form.data.course_id} onChange={(e) => form.setData('course_id', e.target.value)}>
                    <option value="">Select a course</option>
                    {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
            )}
            <div className="grid grid-cols-2 gap-3">
                <select
                    className={inputClass}
                    value={form.data.subject_id}
                    onChange={(e) => form.setData((prev) => ({ ...prev, subject_id: e.target.value, topic_id: '' }))}
                >
                    <option value="">No subject</option>
                    {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select className={inputClass} value={form.data.difficulty} onChange={(e) => form.setData('difficulty', e.target.value)}>
                    {['easy', 'medium', 'hard'].map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>
            <select
                className={inputClass}
                value={form.data.topic_id}
                onChange={(e) => form.setData('topic_id', e.target.value)}
                disabled={!form.data.subject_id}
            >
                <option value="">{form.data.subject_id ? 'No topic' : 'Pick a subject first to choose a topic'}</option>
                {availableTopics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <RichTextArea rows={2} className={inputClass} placeholder="Question text" value={form.data.question_text} onChange={(v) => form.setData('question_text', v)} />
            {form.data.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                    <input type="radio" checked={opt.is_correct} onChange={() => setOption(i, 'is_correct', true)} />
                    <input className={inputClass} placeholder={`Option ${i + 1}`} value={opt.option_text} onChange={(e) => setOption(i, 'option_text', e.target.value)} />
                </div>
            ))}
            <RichTextArea rows={2} className={inputClass} placeholder="Explanation (optional)" value={form.data.explanation} onChange={(v) => form.setData('explanation', v)} />
            <button type="submit" disabled={form.processing || !form.data.course_id} className={btnClass}>Save Question</button>
            {Object.values(form.errors).map((m, i) => <div key={i} className="text-sm text-danger">{String(m)}</div>)}
        </form>
    );
}
