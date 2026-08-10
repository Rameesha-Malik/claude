import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Category { id: number; name: string }
interface Instructor { id: number; name: string }
interface Package { id: number; name: string; description: string | null; price: string; validity_days: number | null }
interface Lesson { id: number; title: string; type: string; is_free_preview: boolean }
interface Course {
    id: number; title: string; category_id: number; instructor_id: number | null;
    short_description: string | null; description: string | null; syllabus: string | null;
    level: string | null; hours: number | null; base_price: string | null; status: string;
    quizzes_enabled: boolean; flashcards_enabled: boolean; tests_enabled: boolean;
    target_exam_name: string | null; target_exam_date: string | null;
    packages: Package[]; lessons: Lesson[];
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
        target_exam_name: course?.target_exam_name ?? '',
        target_exam_date: course?.target_exam_date ?? '',
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
                            <textarea rows={4} className={inputClass} value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} />
                        </div>
                        <div>
                            <label className={labelClass}>Syllabus</label>
                            <textarea rows={3} className={inputClass} value={form.data.syllabus} onChange={(e) => form.setData('syllabus', e.target.value)} />
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
                                {(['quizzes_enabled', 'flashcards_enabled', 'tests_enabled'] as const).map((key) => (
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
                        <PackagesPanel course={course!} />
                        <LessonsPanel course={course!} />
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

function LessonsPanel({ course }: { course: Course }) {
    const addForm = useForm({ title: '', type: 'video_youtube', external_url: '', is_free_preview: false });

    return (
        <div className="rounded-2xl border border-border bg-surface p-5">
            <h3 className="mb-3 font-bold text-text">Lessons</h3>
            <div className="mb-4 space-y-2">
                {course.lessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                        <div>
                            <div className="font-semibold text-text">{lesson.title}</div>
                            <div className="text-xs uppercase text-text-muted">{lesson.type.replace('_', ' ')}{lesson.is_free_preview ? ' · Free Preview' : ''}</div>
                        </div>
                        <button onClick={() => router.delete(`/admin/courses/lessons/${lesson.id}`)} className="text-xs font-bold uppercase text-danger hover:underline">Delete</button>
                    </div>
                ))}
                {course.lessons.length === 0 && <p className="text-sm text-text-secondary">No lessons yet.</p>}
            </div>
            <form
                onSubmit={(e) => { e.preventDefault(); addForm.post(`/admin/courses/${course.id}/lessons`, { onSuccess: () => addForm.reset() }); }}
                className="space-y-2"
            >
                <input className={inputClass} placeholder="Lesson Title" value={addForm.data.title} onChange={(e) => addForm.setData('title', e.target.value)} />
                <select className={inputClass} value={addForm.data.type} onChange={(e) => addForm.setData('type', e.target.value)}>
                    {['pdf', 'audio', 'video_upload', 'video_youtube', 'document', 'link'].map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
                <input className={inputClass} placeholder="URL (for video/link types)" value={addForm.data.external_url} onChange={(e) => addForm.setData('external_url', e.target.value)} />
                <label className="flex items-center gap-2 text-sm text-text">
                    <input type="checkbox" checked={addForm.data.is_free_preview} onChange={(e) => addForm.setData('is_free_preview', e.target.checked)} />
                    Free preview
                </label>
                <button type="submit" disabled={addForm.processing} className="w-full rounded-lg bg-primary py-2 text-sm font-bold uppercase text-on-primary hover:bg-primary-hover">Add Lesson</button>
                {Object.values(addForm.errors).map((m, i) => <div key={i} className="text-sm text-danger">{m}</div>)}
            </form>
        </div>
    );
}
