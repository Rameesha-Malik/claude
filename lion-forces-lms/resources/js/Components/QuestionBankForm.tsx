import { useForm } from '@inertiajs/react';
import RichTextArea from '@/Components/RichTextArea';

interface Subject { id: number; name: string }
interface Topic { id: number; subject_id: number; name: string }
interface CourseOption { id: number; title: string }
interface ExistingOption { id?: number; option_text: string | null; image_path: string | null; is_correct: boolean }
interface ExistingQuestion {
    id: number; question_text: string; explanation: string | null; difficulty: string; image_path: string | null;
    subject: { id: number } | null; topic: { id: number } | null; course: { id: number } | null; options: ExistingOption[];
}

const inputClass = 'w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:shadow-glow focus:outline-none';
const btnClass = 'rounded-lg bg-primary px-4 py-2 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover disabled:opacity-50';

interface OptionState { option_text: string; is_correct: boolean; image: File | null; existing_image_path: string }

function optionsFromQuestion(question?: ExistingQuestion): OptionState[] {
    const base = (question?.options ?? []).map((o) => ({
        option_text: o.option_text ?? '', is_correct: o.is_correct, image: null as File | null, existing_image_path: o.image_path ?? '',
    }));
    while (base.length < 4) {
        base.push({ option_text: '', is_correct: base.length === 0, image: null, existing_image_path: '' });
    }
    return base;
}

interface Props {
    subjects: Subject[];
    topics: Topic[];
    /** Already-known course (embedded in that course's own Quiz builder) -- the course is locked instead of picked. */
    course?: CourseOption;
    /** Free course picker, used when there's no single obvious course (Question Bank's own Questions tab). */
    courses?: CourseOption[];
    /** Present in edit mode -- prefills every field and PUTs instead of POSTs. */
    question?: ExistingQuestion;
    onDone: () => void;
}

// Adds into (or edits) the shared Question Bank (question_bank table) --
// used from Question Bank's own Questions tab, and from inside the Quiz
// builder so an admin can add a brand-new MCQ without leaving the quiz
// they're building. preserveState/preserveScroll keep whichever page
// embeds this (e.g. a partly-filled-in Quiz form, or the rest of the
// question list) from losing its own state when the redirect-back lands.
//
// Course is required (see the migration that added question_bank.
// course_id) -- Custom Quiz only shows a student the questions tagged to
// the course whose quiz module they bought, so an untagged question would
// never actually reach anyone.
//
// Either the question text or its image can carry the question itself,
// and independently, each option can be plain text or a picture (e.g.
// "which of these four insignia is correct") -- option_text is optional
// per option as long as it has one of the two.
export default function QuestionBankForm({ subjects, topics, course, courses = [], question, onDone }: Props) {
    const form = useForm<{
        subject_id: string; topic_id: string; course_id: string; question_text: string; explanation: string;
        difficulty: string; image: File | null; options: OptionState[];
    }>({
        subject_id: question?.subject?.id ? String(question.subject.id) : '',
        topic_id: question?.topic?.id ? String(question.topic.id) : '',
        course_id: question?.course?.id ? String(question.course.id) : (course ? String(course.id) : ''),
        question_text: question?.question_text ?? '',
        explanation: question?.explanation ?? '',
        difficulty: question?.difficulty ?? 'medium',
        image: null,
        options: optionsFromQuestion(question),
    });

    const availableTopics = topics.filter((t) => String(t.subject_id) === form.data.subject_id);

    function updateOption(i: number, patch: Partial<OptionState>) {
        const options = form.data.options.map((o, j) => {
            if (j === i) return { ...o, ...patch };
            return patch.is_correct ? { ...o, is_correct: false } : o;
        });
        form.setData('options', options);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        const options = { forceFormData: true, preserveScroll: true, onSuccess: () => { form.reset(); onDone(); } };
        if (question) {
            form.put(`/admin/question-bank/questions/${question.id}`, options);
        } else {
            form.post('/admin/question-bank/questions', { ...options, preserveState: true });
        }
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
            <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-text-muted">Question image (optional)</label>
                {question?.image_path && !form.data.image && (
                    <img src={`/storage/${question.image_path}`} alt="" className="mb-2 max-h-24 rounded-lg border border-border" />
                )}
                <input type="file" accept="image/*" className="text-sm" onChange={(e) => form.setData('image', e.target.files?.[0] ?? null)} />
            </div>

            <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-text-muted">Options -- pick the radio for the correct one</label>
                <div className="space-y-2">
                    {form.data.options.map((opt, i) => (
                        <div key={i} className="flex items-start gap-2 rounded-lg border border-border p-2">
                            <input type="radio" className="mt-2" checked={opt.is_correct} onChange={() => updateOption(i, { is_correct: true })} />
                            <div className="flex-1 space-y-1">
                                <input
                                    className={inputClass}
                                    placeholder={`Option ${i + 1} text (leave blank if using an image below)`}
                                    value={opt.option_text}
                                    onChange={(e) => updateOption(i, { option_text: e.target.value })}
                                />
                                {opt.existing_image_path && !opt.image && (
                                    <img src={`/storage/${opt.existing_image_path}`} alt="" className="max-h-16 rounded border border-border" />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="block text-xs"
                                    onChange={(e) => updateOption(i, { image: e.target.files?.[0] ?? null })}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <RichTextArea rows={2} className={inputClass} placeholder="Explanation (optional)" value={form.data.explanation} onChange={(v) => form.setData('explanation', v)} />
            <div className="flex gap-2">
                <button type="submit" disabled={form.processing || !form.data.course_id} className={btnClass}>
                    {question ? 'Save Changes' : 'Save Question'}
                </button>
                {question && (
                    <button type="button" onClick={onDone} className="rounded-lg border border-border px-4 py-2 text-sm font-bold uppercase tracking-wide text-text-secondary hover:border-primary">
                        Cancel
                    </button>
                )}
            </div>
            {Object.values(form.errors).map((m, i) => <div key={i} className="text-sm text-danger">{String(m)}</div>)}
        </form>
    );
}
