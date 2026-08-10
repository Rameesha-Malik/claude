import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Category { id: number; name: string; description: string | null; is_active: boolean; courses_count: number }

export default function CategoriesIndex({ categories }: { categories: Category[] }) {
    const addForm = useForm({ name: '', description: '' });

    return (
        <AdminLayout header="Course Categories">
            <Head title="Categories" />

            <div className="max-w-3xl rounded-2xl border border-border bg-surface p-6">
                <p className="mb-4 text-sm text-text-secondary">
                    The service list courses are organized under (LCC, PMA, ISSB, etc). A category with existing courses can't be deleted.
                </p>
                <div className="space-y-2">
                    {categories.map((cat) => (
                        <CategoryRow key={cat.id} category={cat} />
                    ))}
                </div>

                <h3 className="mb-2 mt-6 text-xs font-bold uppercase tracking-wide text-text-muted">Add New</h3>
                <form
                    onSubmit={(e) => { e.preventDefault(); addForm.post('/admin/categories', { onSuccess: () => addForm.reset() }); }}
                    className="flex flex-wrap gap-2"
                >
                    <input className="rounded-lg border border-border px-3 py-2 text-sm" placeholder="Name" value={addForm.data.name} onChange={(e) => addForm.setData('name', e.target.value)} />
                    <input className="rounded-lg border border-border px-3 py-2 text-sm" placeholder="Description" value={addForm.data.description} onChange={(e) => addForm.setData('description', e.target.value)} />
                    <button type="submit" disabled={addForm.processing} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold uppercase text-on-primary hover:bg-primary-hover">Add</button>
                    {Object.values(addForm.errors).map((msg, i) => <div key={i} className="w-full text-sm text-danger">{msg}</div>)}
                </form>
            </div>
        </AdminLayout>
    );
}

function CategoryRow({ category }: { category: Category }) {
    const [name, setName] = useState(category.name);
    const [description, setDescription] = useState(category.description ?? '');
    const [dirty, setDirty] = useState(false);

    return (
        <div className="flex items-center gap-2 rounded-lg border border-border p-2">
            <input className="flex-1 rounded-lg border border-border px-3 py-2 text-sm" value={name} onChange={(e) => { setName(e.target.value); setDirty(true); }} />
            <input className="flex-1 rounded-lg border border-border px-3 py-2 text-sm" value={description} onChange={(e) => { setDescription(e.target.value); setDirty(true); }} />
            <span className="text-xs text-text-muted">{category.courses_count} courses</span>
            {dirty && (
                <button
                    onClick={() => { router.put(`/admin/categories/${category.id}`, { name, description }); setDirty(false); }}
                    className="text-xs font-bold uppercase text-primary hover:underline"
                >
                    Save
                </button>
            )}
            <button
                onClick={() => router.delete(`/admin/categories/${category.id}`)}
                disabled={category.courses_count > 0}
                className="rounded-lg border border-danger px-3 py-1.5 text-xs font-bold uppercase text-danger hover:bg-danger-bg disabled:opacity-30"
            >
                Delete
            </button>
        </div>
    );
}
