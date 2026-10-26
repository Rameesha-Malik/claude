import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import LiteMarkdown from '@/Components/LiteMarkdown';
import RichTextArea from '@/Components/RichTextArea';
import AdminLayout from '@/Layouts/AdminLayout';

interface Category { id: number; name: string }
interface Instructor { id: number; name: string }
type Module = 'lectures' | 'quiz' | 'tests' | 'assignments';
const ALL_MODULES: Module[] = ['lectures', 'quiz', 'tests', 'assignments'];
const MODULE_LABELS: Record<Module, string> = { lectures: 'Lectures', quiz: 'Quiz', tests: 'Tests', assignments: 'Assignments' };

// A package can grant any combination of modules -- "Full Course" is just
// shorthand for all four being checked, same idiom as Admin/Packages/Index.
function summarizeModules(modules: Module[]): string {
    if (ALL_MODULES.every((m) => modules.includes(m))) return 'Full Course';
    return modules.map((m) => MODULE_LABELS[m]).join(' + ') || 'Nothing selected';
}

interface Package { id: number; name: string; modules: Module[]; description: string | null; price: string; validity_days: number | null }
interface Lesson { id: number; title: string; type: string; is_free_preview: boolean; section_id: number | null }
interface Section { id: number; title: string; description: string | null; lessons: Lesson[] }
interface Tag { id: number; name: string }
interface Course {
    id: number; title: string; category_id: number | null; instructor_id: number | null;
    description: string | null;
    hours: number | null; status: string;
    thumbnail_path: string | null;
    packages: Package[]; lessons: Lesson[]; sections: Section[]; tags: Tag[];
}
interface Props { course?: Course; categories: Category[]; instructors: Instructor[] }

const inputClass = 'w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:shadow-glow focus:outline-none';
const labelClass = 'mb-1 block text-sm font-medium text-text';
const btnClass = 'rounded-lg bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover disabled:opacity-50';

// Client feedback: the previous layout showed the Details form next to a
// tall stack of five separate cards (Curriculum, Assessment Engine,
// Flashcards, Assignments, Packages) all at once -- "cool features, but
// make it easy to understand, not complex." One tab open at a time, same
// pattern as Settings/Website Management, instead of everything stacked in
// a narrow sidebar simultaneously.
const EDIT_TABS = ['Details', 'Curriculum', 'Packages'] as const;
type EditTab = (typeof EDIT_TABS)[number];

export default function CourseForm({ course, categories, instructors }: Props) {
    const isEdit = !!course;
    const form = useForm({
        title: course?.title ?? '',
        category_id: course?.category_id ?? '',
        instructor_id: course?.instructor_id ?? '',
        description: course?.description ?? '',
        hours: course?.hours ?? '',
        status: course?.status ?? 'draft',
        tags: course?.tags.map((t) => t.name).join(', ') ?? '',
        thumbnail: null as File | null,
    });

    const [tab, setTab] = useState<EditTab>('Details');

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (isEdit) form.put(`/admin/courses/${course!.id}`);
        else form.post('/admin/courses');
    }

    const detailsForm = (
        <form onSubmit={submit} className="mx-auto max-w-3xl space-y-4 rounded-2xl border border-border bg-surface p-6">
            <div>
                <label className={labelClass}>Title</label>
                <input className={inputClass} value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} />
                {form.errors.title && <div className="mt-1 text-sm text-danger">{form.errors.title}</div>}
            </div>

            <div>
                <label className={labelClass}>Video Thumbnail</label>
                <div className="flex items-center gap-4">
                    {course?.thumbnail_path && (
                        <div className="flex-shrink-0 text-center">
                            <img src={`/storage/${course.thumbnail_path}`} alt="" className="h-16 w-28 rounded-lg border border-border object-cover" />
                            <button
                                type="button"
                                onClick={() => confirm('Remove the current thumbnail?') && router.delete(`/admin/courses/${course.id}/thumbnail`, { preserveScroll: true })}
                                className="mt-1 text-xs font-bold uppercase text-danger hover:underline"
                            >
                                Delete
                            </button>
                        </div>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        className={inputClass}
                        onChange={(e) => form.setData('thumbnail', e.target.files?.[0] ?? null)}
                    />
                </div>
                <p className="mt-1 text-xs text-text-muted">
                    Shown on the course card on the Courses page and homepage. Leave empty to keep the current one.
                </p>
                {form.errors.thumbnail && <div className="mt-1 text-sm text-danger">{form.errors.thumbnail}</div>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Category</label>
                    <select
                        className={inputClass}
                        value={form.data.category_id}
                        onChange={(e) => form.setData('category_id', e.target.value ? Number(e.target.value) : '')}
                    >
                        <option value="">None</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelClass}>Instructor</label>
                    <select className={inputClass} value={form.data.instructor_id} onChange={(e) => form.setData('instructor_id', e.target.value)}>
                        <option value="">None</option>
                        {instructors.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label className={labelClass}>Description</label>
                <RichTextArea rows={4} className={inputClass} value={form.data.description} onChange={(v) => form.setData('description', v)} />
            </div>

            <div>
                <label className={labelClass}>Hours</label>
                <input type="number" className={inputClass} value={form.data.hours} onChange={(e) => form.setData('hours', e.target.value)} />
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

            {/* No course-level price field anymore -- a student always buys a
                specific package now (see combo-module Packages tab), so price
                lives there, not here. */}
            {isEdit ? (
                <p className="text-xs text-text-muted">
                    Set pricing in the <strong>Packages</strong> tab, above -- a course needs at least one package before a student can buy it.
                </p>
            ) : (
                <p className="text-xs text-text-muted">Pricing is set per package, once this course is created -- continue to the Packages tab next.</p>
            )}

            <button type="submit" disabled={form.processing} className={btnClass}>
                {isEdit ? 'Save Changes' : 'Create Course'}
            </button>
        </form>
    );

    return (
        <AdminLayout header={isEdit ? 'Edit Course' : 'New Course'}>
            <Head title={isEdit ? course!.title : 'New Course'} />

            <Link href="/admin/courses" className="mb-4 inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary">
                ← Back to courses
            </Link>

            {!isEdit && detailsForm}

            {isEdit && (
                <>
                    <div className="mb-6 flex flex-wrap gap-2 border-b border-border">
                        {EDIT_TABS.map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setTab(t)}
                                className={`border-b-2 px-4 py-3 text-sm font-bold uppercase tracking-wide transition-colors ${
                                    tab === t ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    {tab === 'Details' && detailsForm}
                    {tab === 'Curriculum' && <CurriculumPanel course={course!} />}
                    {tab === 'Packages' && <div className="mx-auto max-w-2xl"><PackagesPanel course={course!} /></div>}
                </>
            )}
        </AdminLayout>
    );
}

function PackagesPanel({ course }: { course: Course }) {
    const addForm = useForm({ name: '', modules: ALL_MODULES as Module[], price: '', validity_days: '' });

    function toggleModule(m: Module) {
        const current = addForm.data.modules;
        addForm.setData('modules', current.includes(m) ? current.filter((x) => x !== m) : [...current, m]);
    }
    const isFull = ALL_MODULES.every((m) => addForm.data.modules.includes(m));

    return (
        <div className="rounded-2xl border border-border bg-surface p-5">
            <h3 className="mb-3 font-bold text-text">Packages</h3>
            <p className="mb-4 text-sm text-text-secondary">
                For more fields (description, active/inactive), use the full{' '}
                <Link href="/admin/packages" className="font-semibold text-primary hover:underline">Packages</Link> page instead.
            </p>
            <div className="mb-4 space-y-2">
                {course.packages.map((pkg) => (
                    <div key={pkg.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                        <div>
                            <div className="font-semibold text-text">{pkg.name}</div>
                            <div className="text-text-secondary">
                                {summarizeModules(pkg.modules)} · Rs. {Number(pkg.price).toLocaleString()} · {pkg.validity_days ? `${pkg.validity_days}d` : 'Lifetime'}
                            </div>
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
                <div>
                    <div className="flex flex-wrap gap-4 rounded-lg border border-border px-3 py-2.5">
                        {ALL_MODULES.map((m) => (
                            <label key={m} className="flex items-center gap-1.5 text-sm text-text">
                                <input type="checkbox" checked={addForm.data.modules.includes(m)} onChange={() => toggleModule(m)} />
                                {MODULE_LABELS[m]}
                            </label>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={() => addForm.setData('modules', isFull ? [] : ALL_MODULES)}
                        className="mt-1.5 text-xs font-bold uppercase text-primary hover:underline"
                    >
                        {isFull ? 'Clear all' : 'Select all (Full Course)'}
                    </button>
                </div>
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

// Every new lesson is a video link now (client: keep it to just a title,
// link, and free-preview toggle) -- this map only still matters for
// displaying whatever type an older lesson already has (PDF/Audio/
// Document/uploaded video), from before the form was simplified.
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
    const form = useForm({ title: '', description: '' });

    return (
        <form
            onSubmit={(e) => { e.preventDefault(); form.post(`/admin/courses/${courseId}/sections`, { onSuccess: () => form.reset() }); }}
            className="mb-4 space-y-2 rounded-lg border border-dashed border-border p-3"
        >
            <input className={inputClass} placeholder="New topic name (e.g. Chemistry Lectures)" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} />
            <RichTextArea
                rows={2}
                className={inputClass}
                placeholder="Topic description (optional)"
                value={form.data.description}
                onChange={(v) => form.setData('description', v)}
            />
            <button type="submit" disabled={form.processing} className="w-full rounded-lg border border-primary px-4 py-2 text-sm font-bold uppercase text-primary hover:bg-primary-subtle">
                + Add Topic
            </button>
        </form>
    );
}

// Topic title + description are shown read-only until "Edit" is clicked --
// keeps the topic list scannable (client feedback: keep this easy to
// understand, not a form-per-topic wall) while still letting the
// description added at creation be corrected later, same as everything
// else editable in this admin.
function TopicHeader({ section }: { section: Section }) {
    const [editing, setEditing] = useState(false);
    const form = useForm({ title: section.title, description: section.description ?? '' });

    if (editing) {
        return (
            <form
                onSubmit={(e) => { e.preventDefault(); form.put(`/admin/courses/sections/${section.id}`, { onSuccess: () => setEditing(false) }); }}
                className="mb-3 space-y-2 rounded-lg border border-primary p-3"
            >
                <input className={inputClass} value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} />
                <RichTextArea rows={2} className={inputClass} value={form.data.description} onChange={(v) => form.setData('description', v)} />
                <div className="flex gap-2">
                    <button type="submit" disabled={form.processing} className="rounded-lg bg-primary px-4 py-1.5 text-xs font-bold uppercase text-on-primary hover:bg-primary-hover">Save</button>
                    <button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-border px-4 py-1.5 text-xs font-bold uppercase text-text-secondary hover:border-primary">Cancel</button>
                </div>
            </form>
        );
    }

    return (
        <div className="mb-2 flex items-start justify-between gap-3">
            <div>
                <h4 className="font-semibold text-text">{section.title}</h4>
                {section.description && <LiteMarkdown text={section.description} className="mt-0.5 text-sm text-text-secondary" />}
            </div>
            <div className="flex flex-shrink-0 gap-3">
                <button onClick={() => setEditing(true)} className="text-xs font-bold uppercase text-primary hover:underline">Edit</button>
                <button
                    onClick={() => confirm('Remove this topic? Its lessons will become ungrouped, not deleted.') && router.delete(`/admin/courses/sections/${section.id}`)}
                    className="text-xs font-bold uppercase text-danger hover:underline"
                >
                    Remove
                </button>
            </div>
        </div>
    );
}

function CurriculumPanel({ course }: { course: Course }) {
    // `type` is always 'video_youtube' now -- not shown as a choice (client:
    // simplify to just a title, link, and free-preview toggle) -- but the
    // shared storeLesson endpoint still expects the field, same backend
    // used by every pre-existing lesson type.
    const addForm = useForm<{ title: string; type: string; external_url: string; is_free_preview: boolean; section_id: string }>({
        title: '', type: 'video_youtube', external_url: '', is_free_preview: false, section_id: '',
    });
    const ungrouped = course.lessons.filter((l) => l.section_id === null);

    return (
        <div className="rounded-2xl border-2 border-primary bg-surface p-5">
            <h3 className="mb-1 font-bold text-text">Curriculum: Topics &amp; Video Lectures</h3>
            <p className="mb-3 text-sm text-text-secondary">
                This is where video lectures live: <strong>Course → Topic → Lesson</strong>. Add a topic below (e.g. "Chemistry
                Lectures"), then add lessons into it -- a title and a video link (e.g. an unlisted YouTube link) is all each
                lesson needs. Lessons left ungrouped still show to students, just not under a named topic.
            </p>

            <AddTopicForm courseId={course.id} />

            <div className="mb-4 space-y-4">
                {course.sections.map((section) => (
                    <div key={section.id} className="rounded-xl border border-border p-3">
                        <TopicHeader section={section} />
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
                <select className={inputClass} value={addForm.data.section_id} onChange={(e) => addForm.setData('section_id', e.target.value)}>
                    <option value="">No topic (ungrouped)</option>
                    {course.sections.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
                <input
                    className={inputClass}
                    placeholder="Video link (e.g. an unlisted YouTube URL)"
                    value={addForm.data.external_url}
                    onChange={(e) => addForm.setData('external_url', e.target.value)}
                />
                <label className="flex items-center gap-2 text-sm text-text">
                    <input type="checkbox" checked={addForm.data.is_free_preview} onChange={(e) => addForm.setData('is_free_preview', e.target.checked)} />
                    Free preview
                </label>
                <button type="submit" disabled={addForm.processing} className="w-full rounded-lg bg-primary py-2 text-sm font-bold uppercase text-on-primary hover:bg-primary-hover">
                    Add Lesson
                </button>
                {Object.values(addForm.errors).map((m, i) => <div key={i} className="text-sm text-danger">{m}</div>)}
            </form>
        </div>
    );
}
