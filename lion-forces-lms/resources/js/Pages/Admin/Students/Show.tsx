import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Payment { id: number; amount: string; method: string; status: string }
interface Enrollment {
    id: number; status: string;
    course: { id: number; title: string; category: { name: string } | null };
    package: { name: string } | null;
    payments: Payment[];
}
interface Student {
    id: number; name: string; email: string; phone: string | null; is_active: boolean;
    created_at: string; enrollments: Enrollment[];
}
interface Course { id: number; title: string }

export default function StudentShow({ student, courses }: { student: Student; courses: Course[] }) {
    const enrollForm = useForm({ course_id: '' });

    function submitEnroll(e: React.FormEvent) {
        e.preventDefault();
        enrollForm.post(`/admin/students/${student.id}/enroll`, { onSuccess: () => enrollForm.reset() });
    }

    return (
        <AdminLayout header="Student Profile">
            <Head title={student.name} />

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border border-border bg-surface p-6">
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary-subtle text-xl font-bold text-primary">
                        {student.name.charAt(0).toUpperCase()}
                    </div>
                    <h2 className="text-center font-bold text-text">{student.name}</h2>
                    <p className="text-center text-sm text-text-secondary">{student.email}</p>
                    {student.phone && <p className="text-center text-sm text-text-secondary">{student.phone}</p>}
                    <p className="mt-2 text-center text-xs text-text-muted">Joined {new Date(student.created_at).toLocaleDateString()}</p>

                    <button
                        onClick={() => router.post(`/admin/students/${student.id}/toggle-suspend`)}
                        className={`mt-4 w-full rounded-lg py-2 text-sm font-bold uppercase tracking-wide ${
                            student.is_active ? 'border border-danger text-danger hover:bg-danger-bg' : 'bg-success text-white hover:opacity-90'
                        }`}
                    >
                        {student.is_active ? 'Suspend Student' : 'Reactivate Student'}
                    </button>
                </div>

                <div className="lg:col-span-2">
                    <div className="mb-6 rounded-2xl border border-border bg-surface p-6">
                        <h3 className="mb-3 font-bold text-text">Enroll in a Course</h3>
                        <form onSubmit={submitEnroll} className="flex gap-2">
                            <select
                                className="flex-1 rounded-lg border border-border px-3 py-2 text-sm"
                                value={enrollForm.data.course_id}
                                onChange={(e) => enrollForm.setData('course_id', e.target.value)}
                            >
                                <option value="">Select a course...</option>
                                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </select>
                            <button type="submit" disabled={enrollForm.processing || !enrollForm.data.course_id} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold uppercase text-on-primary hover:bg-primary-hover disabled:opacity-50">
                                Enroll
                            </button>
                        </form>
                    </div>

                    <div className="rounded-2xl border border-border bg-surface p-6">
                        <h3 className="mb-3 font-bold text-text">Enrollments</h3>
                        {student.enrollments.length === 0 ? (
                            <p className="text-sm text-text-secondary">No enrollments yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {student.enrollments.map((e) => (
                                    <div key={e.id} className="rounded-lg border border-border p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                {e.course.category && (
                                                    <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-xs font-bold text-primary">{e.course.category.name}</span>
                                                )}
                                                <div className="mt-1 font-semibold text-text">{e.course.title}</div>
                                                {e.package && <div className="text-xs text-text-secondary">{e.package.name}</div>}
                                            </div>
                                            <select
                                                value={e.status}
                                                onChange={(ev) => router.put(`/admin/students/enrollments/${e.id}/status`, { status: ev.target.value })}
                                                className="rounded-lg border border-border px-2 py-1 text-xs font-bold uppercase"
                                            >
                                                {['pending', 'active', 'suspended', 'expired'].map((s) => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        {e.payments.length > 0 && (
                                            <div className="mt-2 text-xs text-text-muted">
                                                {e.payments.length} payment(s) — {e.payments.map((p) => `Rs. ${Number(p.amount).toLocaleString()} (${p.status})`).join(', ')}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
