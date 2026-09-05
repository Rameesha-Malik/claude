import { Head, Link, router, useForm } from '@inertiajs/react';
import RichTextArea from '@/Components/RichTextArea';
import AdminLayout from '@/Layouts/AdminLayout';

interface Category { id: number; name: string }
interface Instructor { id: number; name: string }
interface Package { id: number; name: string; description: string | null; price: string; validity_days: number | null }
interface Lesson { id: number; title: string; type: string; is_free_preview: boolean; section_id: number | null }
interface Section { id: number; title: string; lessons: Lesson[] }
interface Tag { id: number; name: string }
interface Course {
    id: number; title: string; category_id: number; instructor_id: number | null;
    short_description: string | null; description: string | null; syllabus: string | null;
    level: string | null; hours: number | null; base_price: string | null; status: string;
    quizzes_enabled: boolean; flashcards_enabled: boolean; tests_enabled: boolean; assignments_enabled: boolean;
    target_exam_name: string | null; target_exam_date: string | null;
    packages: Package[]; lessons: Lesson[]; sections: Section[]; tags: Tag[];
}
interface Props { course?: Course; categories: Category[]; instructors: Instructor[] }

const inputClass = 'w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:shadow-glow focus:outline-none';
const labelClass = 'mb-1 block text-sm font-medium text-text';
const btnClass = 'rounded-lg bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover disabled:opacity-50';

export default function CourseForm({ course, categories, instructors }: Props) {
    const isEdit = !!course;
    const form = useForm({
        title: course?.title ?? '',
        category_id: course?.category_id ?? (categories[0]?.id ?? ''),
        instructor_id: course?.instructor_id ?? '',
        short_description: course?.short_description ?? '',
        description: course?.description ?? '',
        syllabus: course?.syllabus ?? '',
        level: course?.level ?? '',
        hours: course?.hours ?? '',
        base_price: course?.base_price ?? '',
        status: course?.status ?? 'draft',
        quizzes_enabled: course?.quizzes_enabled ?? false,
        flashcards_enabled: course?.flashcards_enabled ?? false,
        tests_enabled: course?.tests_enabled ?? false,
        assignments_enabled: course?.assignments_enabled ?? false,
        target_exam_name: course?.target_exam_name ?? '',
        target_exam_date: course?.target_exam_date ?? '',
        tags: course?.tags.map((t) => t.name).join(', ') ?? '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (isEdit) form.put(`/admin/courses/${course!.id}`);
        else form.post('/admin/courses');
    }

    return (
        <AdminLayout header={isEdit ? 'Edit Course' : 'New Course'}>
            <Head title={isEdit ? course!.title : 'New Course'} />

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-surface p-6">
                        <div>
                            <label className={labelClass}>Title</label>
                            <input className={inputClass} value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} />
                            {form.errors.title && <div className="mt-1 text-sm text-danger">{form.errors.title}</div>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Category</label>
                                <select className={inputClass} value={form.data.category_id} onChange={(e) => form.setData('category_id', Number(e.target.value))}>
                                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Instructor</label>
                                <select className={inputClass} value={form.data.instructor_id} onChange={(e) => form.setData('instructor_id', e.target.value)}>
                                    <option value="">— None —</option>
                                    {instructors.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Short Description</label>
                            <input className={inputClass} value={form.data.short_description} onChange={(e) => form.setData('short_description', e.target.value)} />
                        </div>
                        <div>
                            <label className={labelClass}>Full Description</label>
                            <RichTextArea rows={4} className={inputClass} value={form.data.description} onChange={(v) => form.setData('description', v)} />
                        </div>
                        <div>
                            <label className={labelClass}>Syllabus</label>
                            <RichTextArea rows={3} className={inputClass} value={form.data.syllabus} onChange={(v) => form.setData('syllabus', v)} />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>Level</label>
                                <input className={inputClass} value={form.data.level} onChange={(e) => form.setData('level', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>Hours</label>
                                <input type="number" className={inputClass} value={form.data.hours} onChange={(e) => form.setData('hours', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>Base Price (Rs.)</label>
                                <input type="number" className={inputClass} value={form.data.base_price} onChange={(e) => form.setData('base_price', e.target.value)} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Target Exam Name</label>
                                <input className={inputClass} value={form.data.target_exam_name} onChange={(e) => form.setData('target_exam_name', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>Target Exam Date</label>
                                <input type="date" className={inputClass} value={form.data.target_exam_date} onChange={(e) => form.setData('target_exam_date', e.target.value)} />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Tags</label>
                            <input
                                className={inputClass}
                                placeholder="e.g. Army, Navy, PAF"
                                value={form.data.tags}
                                onChange={(e) => form.setData('tags', e.target.value)}
                            />
                            <p className="mt-1 text-xs text-text-muted">Comma-separated. Shown on the course card and used for search/filtering.</p>
                        </div>

                        <div>
                            <label className={labelClass}>Status</label>
                            <select className={inputClass} value={form.data.status} onChange={(e) => form.setData('status', e.target.value)}>
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="hidden">Hidden</option>
                            </select>
                        </div>

                        <div>
                            <label className={labelClass}>Modules (Lectures + Notes are always included)</label>
                            <div className="flex gap-4">
                                {(['quizzes_enabled', 'flashcards_enabled', 'tests_enabled', 'assignments_enabled'] as const).map((key) => (
                                    <label key={key} className="flex items-center gap-2 text-sm text-text">
                                        <input type="checkbox" checked={form.data[key]} onChange={(e) => form.setData(key, e.target.checked)} />
                                        {key.replace('_enabled', '')}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button type="submit" disabled={form.processing} className={btnClass}>
                            {isEdit ? 'Save Changes' : 'Create Course'}
                        </button>
                    </form>
                </div>

                {isEdit && (
                    <div className="space-y-6">
                        {/* Moved to the top of the sidebar and relabeled -- this was
                            previously the last of six stacked panels, which is why
                            "where do I add video lectures" kept coming up. The
                            structure is Course -> Topics -> Lessons (video/pdf/etc),
                            same idea as most course platforms' "Curriculum" tab. */}
                        <CurriculumPanel course={course!} />
                        <div className="rounded-2xl border border-border bg-surface p-5">
                            <h3 className="mb-3 font-bold text-text">Assessment Engine</h3>
                            <p className="mb-3 text-sm text-text-secondary">Build tests using questions from the Content Library.</p>
                            <div className="space-y-2">
                                <Link
                                    href={`/admin/courses/${course!.id}/practice-tests`}
                                    className="block w-full rounded-lg border border-primary py-2 text-center text-sm font-bold uppercase tracking-wide text-primary hover:bg-primary-subtle"
                                >
                                    Manage Practice Tests
                                </Link>
                                <Link
                                    href={`/admin/courses/${course!.id}/quizzes`}
                                    className="block w-full rounded-lg border border-primary py-2 text-center text-sm font-bold uppercase tracking-wide text-primary hover:bg-primary-subtle"
                                >
                                    Manage Quizzes
                                </Link>
                                <Link
                                    href={`/admin/courses/${course!.id}/mock-exams`}
                                    className="block w-full rounded-lg border border-primary py-2 text-center text-sm font-bold uppercase tracking-wide text-primary hover:bg-primary-subtle"
                                >
                                    Manage Mock Exams
                                </Link>
                                <Link
                                    href={`/admin/courses/${course!.id}/staged-tests`}
                                    className="block w-full rounded-lg border border-primary py-2 text-center text-sm font-bold uppercase tracking-wide text-primary hover:bg-primary-subtle"
                                >
                                    Manage Staged Tests
                                </Link>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-border bg-surface p-5">
                            <h3 className="mb-3 font-bold text-text">Flashcards</h3>
                            <p className="mb-3 text-sm text-text-secondary">Quick front/back study cards for this course.</p>
                            <Link
                                href={`/admin/courses/${course!.id}/flashcards`}
                                className="block w-full rounded-lg border border-primary py-2 text-center text-sm font-bold uppercase tracking-wide text-primary hover:bg-primary-subtle"
                            >
                                Manage Flashcards
                            </Link>
                        </div>
                        <div className="rounded-2xl border border-border bg-surface p-5">
                            <h3 className="mb-3 font-bold text-text">Assignments</h3>
                            <p className="mb-3 text-sm text-text-secondary">Gradable file/text submissions, separate from MCQ tests.</p>
                            <Link
                                href={`/admin/courses/${course!.id}/assignments`}
                                className="block w-full rounded-lg border border-primary py-2 text-center text-sm font-bold uppercase tracking-wide text-primary hover:bg-primary-subtle"
                            >
                                Manage Assignments
                            </Link>
                        </div>
                        <PackagesPanel course={course!} />
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

function PackagesPanel({ course }: { course: Course }) {
    const addForm = useForm({ name: '', price: '', validity_days: '' });

    return (
        <div className="rounded-2xl border border-border bg-surface p-5">
            <h3 className="mb-3 font-bold text-text">Packages</h3>
            <div className="mb-4 space-y-2">
                {course.packages.map((pkg) => (
                    <div key={pkg.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                        <div>
                            <div className="font-semibold text-text">{pkg.name}</div>
                            <div className="text-text-secondary">Rs. {Number(pkg.price).toLocaleString()} · {pkg.validity_days ? `${pkg.validity_days}d` : 'Lifetime'}</div>
                        </div>
                        <button onClick={() => router.delete(`/admin/courses/packages/${pkg.id}`)} className="text-xs font-bold uppercase text-danger hover:underline">Delete</button>
                    </div>
                ))}
                {course.packages.length === 0 && <p className="text-sm text-text-secondary">No packages yet.</p>}
            </div>
            <form
                onSubmit={(e) => { e.preventDefault(); addForm.post(`/admin/courses/${course.id}/packages`, { onSuccess: () => addForm.reset() }); }}
                className="space-y-2"
            >
                <input className={inputClass} placeholder="Package Name" value={addForm.data.name} onChange={(e) => addForm.setData('name', e.target.value)} />
                <div className="flex gap-2">
                    <input type="number" className={inputClass} placeholder="Price" value={addForm.data.price} onChange={(e) => addForm.setData('price', e.target.value)} />
                    <input type="number" className={inputClass} placeholder="Validity (days)" value={addForm.data.validity_days} onChange={(e) => addForm.setData('validity_days', e.target.value)} />
                </div>
                <button type="submit" disabled={addForm.processing} className="w-full rounded-lg bg-primary py-2 text-sm font-bold uppercase text-on-primary hover:bg-primary-hover">Add Package</button>
                {Object.values(addForm.errors).map((m, i) => <div key={i} className="text-sm text-danger">{m}</div>)}
            </form>
        </div>
    );
}

const URL_TYPES = ['video_youtube', 'link'];
const FILE_ACCEPT: Record<string, string> = {
    pdf: '.pdf',
    audio: '.mp3,.wav,.m4a',
    video_upload: '.mp4,.mov,.webm',
    document: '.pdf,.doc,.docx,.ppt,.pptx',
};
// "video lectures" is the #1 thing admins look for in this panel -- both
// video options say "Video" up front instead of "video_youtube"/"video_upload"
// so they're not mistaken for some other content type while scanning the list.
const LESSON_TYPE_LABELS: Record<string, string> = {
    video_youtube: 'Video (YouTube Link)',
    video_upload: 'Video (File Upload)',
    pdf: 'PDF',
    audio: 'Audio',
    document: 'Document',
    link: 'External Link',
};

function LessonRow({ lesson }: { lesson: Lesson }) {
    return (
        <div className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
            <div>
                <div className="font-semibold text-text">{lesson.title}</div>
                <div className="text-xs uppercase text-text-muted">{LESSON_TYPE_LABELS[lesson.type] ?? lesson.type}{lesson.is_free_preview ? ' · Free Preview' : ''}</div>
            </div>
            <button onClick={() => router.delete(`/admin/courses/lessons/${lesson.id}`)} className="text-xs font-bold uppercase text-danger hover:underline">Delete</button>
        </div>
    );
}

function AddTopicForm({ courseId }: { courseId: number }) {
    const form = useForm({ title: '' });

    return (
        <form
            onSubmit={(e) => { e.preventDefault(); form.post(`/admin/courses/${courseId}/sections`, { onSuccess: () => form.reset() }); }}
            className="mb-4 flex gap-2"
        >
            <input className={inputClass} placeholder="New topic name (e.g. Chemistry Lectures)" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} />
            <button type="submit" disabled={form.processing} className="flex-shrink-0 rounded-lg border border-primary px-4 py-2 text-sm font-bold uppercase text-primary hover:bg-primary-subtle">
                + Add Topic
            </button>
        </form>
    );
}

function CurriculumPanel({ course }: { course: Course }) {
    const addForm = useForm<{ title: string; type: string; external_url: string; is_free_preview: boolean; section_id: string; file: File | null }>({
        title: '', type: 'video_youtube', external_url: '', is_free_preview: false, section_id: '', file: null,
    });
    const isUrlType = URL_TYPES.includes(addForm.data.type);
    const ungrouped = course.lessons.filter((l) => l.section_id === null);

    return (
        <div className="rounded-2xl border-2 border-primary bg-surface p-5">
            <h3 className="mb-1 font-bold text-text">Curriculum — Topics &amp; Video Lectures</h3>
            <p className="mb-3 text-sm text-text-secondary">
                This is where video lectures live: <strong>Course → Topic → Lesson</strong>. Add a topic below (e.g. "Chemistry
                Lectures"), then add lessons into it — pick type <em>video (YouTube link)</em> or <em>video (file upload)</em> for a
                lecture. Lessons left ungrouped still show to students, just not under a named topic.
            </p>

            <AddTopicForm courseId={course.id} />

            <div className="mb-4 space-y-4">
                {course.sections.map((section) => (
                    <div key={section.id} className="rounded-xl border border-border p-3">
                        <div className="mb-2 flex items-center justify-between">
                            <h4 className="font-semibold text-text">{section.title}</h4>
                            <button
                                onClick={() => confirm('Remove this topic? Its lessons will become ungrouped, not deleted.') && router.delete(`/admin/courses/sections/${section.id}`)}
                                className="text-xs font-bold uppercase text-danger hover:underline"
                            >
                                Remove Topic
                            </button>
                        </div>
                        <div className="space-y-2">
                            {section.lessons.map((lesson) => <LessonRow key={lesson.id} lesson={lesson} />)}
                            {section.lessons.length === 0 && <p className="text-sm text-text-secondary">No lessons in this topic yet.</p>}
                        </div>
                    </div>
                ))}

                {(ungrouped.length > 0 || course.sections.length === 0) && (
                    <div>
                        {course.sections.length > 0 && <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-text-muted">Ungrouped</h4>}
                        <div className="space-y-2">
                            {ungrouped.map((lesson) => <LessonRow key={lesson.id} lesson={lesson} />)}
                            {ungrouped.length === 0 && <p className="text-sm text-text-secondary">No lessons yet.</p>}
                        </div>
                    </div>
                )}
            </div>

            <form
                onSubmit={(e) => { e.preventDefault(); addForm.post(`/admin/courses/${course.id}/lessons`, { onSuccess: () => addForm.reset() }); }}
                className="space-y-2 border-t border-border pt-4"
            >
                <input className={inputClass} placeholder="Lesson Title" value={addForm.data.title} onChange={(e) => addForm.setData('title', e.target.value)} />
                <div className="grid grid-cols-2 gap-2">
                    <select className={inputClass} value={addForm.data.type} onChange={(e) => addForm.setData('type', e.target.value)}>
                        {Object.entries(LESSON_TYPE_LABELS).map(([t, label]) => <option key={t} value={t}>{label}</option>)}
                    </select>
                    <select className={inputClass} value={addForm.data.section_id} onChange={(e) => addForm.setData('section_id', e.target.value)}>
                        <option value="">No topic (ungrouped)</option>
                        {course.sections.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
                    </select>
                </div>
                {isUrlType ? (
                    <input
                        className={inputClass}
                        placeholder={addForm.data.type === 'video_youtube' ? 'YouTube URL' : 'Link URL'}
                        value={addForm.data.external_url}
                        onChange={(e) => addForm.setData('external_url', e.target.value)}
                    />
                ) : (
                    <div>
                        <input
                            type="file"
                            accept={FILE_ACCEPT[addForm.data.type]}
                            onChange={(e) => addForm.setData('file', e.target.files?.[0] ?? null)}
                            className="w-full text-sm text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-bold file:uppercase file:text-on-primary"
                        />
                        {addForm.data.type === 'video_upload' && <p className="mt-1 text-xs text-text-muted">MP4/MOV/WEBM, up to 500MB. Prefer YouTube for longer lectures.</p>}
                    </div>
                )}
                <label className="flex items-center gap-2 text-sm text-text">
                    <input type="checkbox" checked={addForm.data.is_free_preview} onChange={(e) => addForm.setData('is_free_preview', e.target.checked)} />
                    Free preview
                </label>
                <button type="submit" disabled={addForm.processing} className="w-full rounded-lg bg-primary py-2 text-sm font-bold uppercase text-on-primary hover:bg-primary-hover">
                    {addForm.progress ? `Uploading… ${addForm.progress.percentage}%` : 'Add Lesson'}
                </button>
                {Object.values(addForm.errors).map((m, i) => <div key={i} className="text-sm text-danger">{m}</div>)}
            </form>
        </div>
    );
}
