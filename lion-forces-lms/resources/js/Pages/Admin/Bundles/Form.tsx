import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

interface CourseOption { id: number; title: string; base_price: string | null }
interface Bundle {
    id: number; title: string; description: string | null; price: string;
    is_active: boolean; thumbnail_path: string | null; courses: { id: number }[];
}
interface Props { bundle?: Bundle; courses: CourseOption[] }

const inputClass = 'w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:shadow-glow focus:outline-none';
const labelClass = 'mb-1 block text-sm font-medium text-text';
const btnClass = 'rounded-lg bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover disabled:opacity-50';

export default function BundleForm({ bundle, courses }: Props) {
    const isEdit = !!bundle;
    const [preview, setPreview] = useState<string | null>(null);
    const form = useForm<{
        title: string; description: string; price: string; is_active: boolean;
        course_ids: number[]; thumbnail: File | null;
    }>({
        title: bundle?.title ?? '',
        description: bundle?.description ?? '',
        price: bundle?.price ?? '',
        is_active: bundle?.is_active ?? true,
        course_ids: bundle?.courses.map((c) => c.id) ?? [],
        thumbnail: null,
    });

    const selectedTotal = courses
        .filter((c) => form.data.course_ids.includes(c.id))
        .reduce((sum, c) => sum + Number(c.base_price ?? 0), 0);

    function toggleCourse(id: number) {
        form.setData('course_ids', form.data.course_ids.includes(id)
            ? form.data.course_ids.filter((c) => c !== id)
            : [...form.data.course_ids, id]);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        // File upload + PUT don't mix directly with Inertia -- always POST,
        // spoofing the method via _method when editing (Laravel's standard
        // way to accept a PUT-routed multipart request).
        if (isEdit) {
            form.transform((data) => ({ ...data, _method: 'put' }));
            form.post(`/admin/bundles/${bundle!.id}`, { forceFormData: true });
        } else {
            form.post('/admin/bundles', { forceFormData: true });
        }
    }

    return (
        <AdminLayout header={isEdit ? 'Edit Bundle' : 'New Bundle'}>
            <Head title={isEdit ? bundle!.title : 'New Bundle'} />

            <form onSubmit={submit} className="max-w-2xl space-y-4 rounded-2xl border border-border bg-surface p-6">
                <div>
                    <label className={labelClass}>Title</label>
                    <input className={inputClass} value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} />
                    {form.errors.title && <div className="mt-1 text-sm text-danger">{form.errors.title}</div>}
                </div>
                <div>
                    <label className={labelClass}>Description</label>
                    <textarea rows={3} className={inputClass} value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} />
                </div>
                <div>
                    <label className={labelClass}>Bundle Price (Rs.)</label>
                    <input type="number" className={inputClass} value={form.data.price} onChange={(e) => form.setData('price', e.target.value)} />
                    {form.errors.price && <div className="mt-1 text-sm text-danger">{form.errors.price}</div>}
                    {selectedTotal > 0 && (
                        <p className="mt-1 text-xs text-text-muted">
                            Individually these courses cost Rs. {selectedTotal.toLocaleString()}
                            {Number(form.data.price) > 0 && Number(form.data.price) < selectedTotal && (
                                <> — Rs. {(selectedTotal - Number(form.data.price)).toLocaleString()} savings for the student.</>
                            )}
                        </p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>Thumbnail</label>
                    <div className="flex items-center gap-4">
                        {(preview || bundle?.thumbnail_path) && (
                            // eslint-disable-next-line jsx-a11y/alt-text
                            <img src={preview ?? `/storage/${bundle?.thumbnail_path}`} className="h-16 w-16 rounded-lg object-cover" />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0] ?? null;
                                form.setData('thumbnail', file);
                                setPreview(file ? URL.createObjectURL(file) : null);
                            }}
                            className="text-sm text-text-secondary"
                        />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Included Courses (pick at least 2)</label>
                    <div className="max-h-64 space-y-1.5 overflow-y-auto rounded-lg border border-border p-3">
                        {courses.map((c) => (
                            <label key={c.id} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-surface-sunken">
                                <span className="flex items-center gap-2 text-text">
                                    <input type="checkbox" checked={form.data.course_ids.includes(c.id)} onChange={() => toggleCourse(c.id)} />
                                    {c.title}
                                </span>
                                <span className="text-text-muted">{c.base_price ? `Rs. ${Number(c.base_price).toLocaleString()}` : '—'}</span>
                            </label>
                        ))}
                    </div>
                    {form.errors.course_ids && <div className="mt-1 text-sm text-danger">{form.errors.course_ids}</div>}
                </div>

                <label className="flex items-center gap-2 text-sm text-text">
                    <input type="checkbox" checked={form.data.is_active} onChange={(e) => form.setData('is_active', e.target.checked)} />
                    Active (visible on the public site)
                </label>

                <button type="submit" disabled={form.processing} className={btnClass}>
                    {isEdit ? 'Save Changes' : 'Create Bundle'}
                </button>
            </form>
        </AdminLayout>
    );
}
