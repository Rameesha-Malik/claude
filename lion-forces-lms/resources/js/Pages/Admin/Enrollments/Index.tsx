import { Head, router } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';

import AdminLayout from '@/Layouts/AdminLayout';

interface Package { id: number; name: string }
interface CourseOpt { id: number; title: string; packages: Package[] }
interface EnrollmentRow {
    id: number; status: string; assigned: boolean; activated_at: string | null; expires_at: string | null; progress: number;
    user: { name: string; email: string } | null;
    course: { title: string } | null;
    package: { name: string } | null;
    payment: { amount: string; proof_file_path: string | null } | null;
}
interface Props {
    enrollments: { data: EnrollmentRow[]; links: { url: string | null; label: string; active: boolean }[]; total: number };
    courses: CourseOpt[];
    filters: { status?: string; course_id?: string; search?: string };
}

const STATUSES = [null, 'pending', 'active', 'suspended', 'expired'];

function StudentPicker({ onPick }: { onPick: (s: { id: number; name: string; email: string }) => void }) {
    const [q, setQ] = useState('');
    const [results, setResults] = useState<{ id: number; name: string; email: string }[]>([]);
    const [picked, setPicked] = useState<{ id: number; name: string; email: string } | null>(null);

    useEffect(() => {
        if (picked || q.trim().length < 2) { setResults([]); return; }
        const t = setTimeout(() => {
            fetch(`/admin/students/search?q=${encodeURIComponent(q)}`)
                .then((r) => r.json())
                .then(setResults)
                .catch(() => setResults([]));
        }, 250);
        return () => clearTimeout(t);
    }, [q, picked]);

    if (picked) {
        return (
            <div className="flex items-center justify-between rounded-lg border border-primary bg-primary-subtle px-3 py-2 text-sm">
                <span className="text-text">{picked.name} — {picked.email}</span>
                <button type="button" onClick={() => { setPicked(null); setQ(''); onPick(null as never); }} className="text-xs font-bold text-primary hover:underline">
                    Change
                </button>
            </div>
        );
    }

    return (
        <div className="relative">
            <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search student by name or email…"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
            {results.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-surface shadow-lg">
                    {results.map((s) => (
                        <button
                            key={s.id}
                            type="button"
                            onClick={() => { setPicked(s); onPick(s); }}
                            className="block w-full px-3 py-2 text-left text-sm hover:bg-primary-subtle"
                        >
                            <span className="font-medium text-text">{s.name}</span>{' '}
                            <span className="text-text-muted">{s.email}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function EnrollStudentModal({ courses, onClose }: { courses: CourseOpt[]; onClose: () => void }) {
    const [studentId, setStudentId] = useState<number | null>(null);
    const [courseId, setCourseId] = useState<number | ''>('');
    const [packageId, setPackageId] = useState<number | ''>('');
    const [submitting, setSubmitting] = useState(false);

    const selectedCourse = courses.find((c) => c.id === courseId);

    function submit(e: FormEvent) {
        e.preventDefault();
        if (!studentId || !courseId) return;
        setSubmitting(true);
        router.post('/admin/enrollments', { user_id: studentId, course_id: courseId, package_id: packageId || null }, {
            onFinish: () => setSubmitting(false),
            onSuccess: onClose,
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-bold text-text">Enroll Student</h2>
                    <button onClick={onClose} className="text-text-muted hover:text-text">✕</button>
                </div>
                <form onSubmit={submit} className="space-y-3">
                    <StudentPicker onPick={(s) => setStudentId(s?.id ?? null)} />
                    <select
                        value={courseId}
                        onChange={(e) => { setCourseId(Number(e.target.value) || ''); setPackageId(''); }}
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                    >
                        <option value="">Select a course…</option>
                        {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                    {selectedCourse && selectedCourse.packages.length > 0 && (
                        <select value={packageId} onChange={(e) => setPackageId(Number(e.target.value) || '')} className="w-full rounded-lg border border-border px-3 py-2 text-sm">
                            <option value="">No specific package (full access)</option>
                            {selectedCourse.packages.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    )}
                    <button
                        type="submit"
                        disabled={!studentId || !courseId || submitting}
                        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-bold uppercase text-on-primary hover:bg-primary-hover disabled:opacity-50"
                    >
                        {submitting ? 'Enrolling…' : 'Enroll Student'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function EnrollmentsIndex({ enrollments, courses, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [courseId, setCourseId] = useState(filters.course_id ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [selected, setSelected] = useState<number[]>([]);
    const [modalOpen, setModalOpen] = useState(false);

    function applyFilters(e?: FormEvent) {
        e?.preventDefault();
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (courseId) params.course_id = courseId;
        if (status) params.status = status;
        router.get('/admin/enrollments', params, { preserveState: true });
    }

    function clearFilters() {
        setSearch(''); setCourseId(''); setStatus('');
        router.get('/admin/enrollments');
    }

    function toggleSelect(id: number) {
        setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    }

    function toggleSelectAll() {
        setSelected((prev) => (prev.length === enrollments.data.length ? [] : enrollments.data.map((e) => e.id)));
    }

    function bulkAction(action: 'cancel' | 'delete') {
        const verb = action === 'cancel' ? 'suspend' : 'permanently delete';
        if (!confirm(`Are you sure you want to ${verb} ${selected.length} enrollment(s)?`)) return;
        router.post('/admin/enrollments/bulk', { action, ids: selected }, {
            preserveScroll: true,
            onSuccess: () => setSelected([]),
        });
    }

    function cancelOne(e: EnrollmentRow) {
        if (confirm(`Suspend ${e.user?.name}'s enrollment in ${e.course?.title}?`)) {
            router.post('/admin/enrollments/bulk', { action: 'cancel', ids: [e.id] }, { preserveScroll: true });
        }
    }

    function deleteOne(e: EnrollmentRow) {
        if (confirm(`Permanently delete this enrollment? This cannot be undone.`)) {
            router.delete(`/admin/enrollments/${e.id}`, { preserveScroll: true });
        }
    }

    return (
        <AdminLayout header="Enrollments">
            <Head title="Enrollments" />

            <div className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-border bg-gradient-to-br from-primary-subtle to-surface p-6 sm:p-8">
                <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary shadow-sm">
                        Offline Payments
                    </span>
                    <h1 className="mt-4 font-display text-3xl text-text">Enrollments</h1>
                    <p className="mt-2 max-w-xl text-sm text-text-secondary">
                        Enroll any student to any course after receiving offline payment. View, approve, cancel, or remove enrollments. Use bulk actions for multiple rows.
                    </p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-3">
                    <div className="rounded-2xl border border-border bg-surface px-5 py-3 text-center shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Total</p>
                        <p className="font-display text-2xl text-text">{enrollments.total}</p>
                    </div>
                    <button onClick={() => setModalOpen(true)} className="rounded-xl bg-secondary px-5 py-3 text-sm font-bold uppercase text-on-secondary shadow-sm hover:bg-teal-800">
                        + Enroll Student
                    </button>
                </div>
            </div>

            <form onSubmit={applyFilters} className="mb-6 rounded-3xl border border-border bg-surface p-5">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase text-text-muted">Search by student</label>
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name or email" className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase text-text-muted">Course</label>
                        <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm">
                            <option value="">All courses</option>
                            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase text-text-muted">Status</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm capitalize">
                            <option value="">All statuses</option>
                            {STATUSES.filter(Boolean).map((s) => <option key={s} value={s!}>{s}</option>)}
                        </select>
                    </div>
                    <div className="flex items-end gap-2">
                        <button type="submit" className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary hover:bg-primary-hover">Apply filters</button>
                        <button type="button" onClick={clearFilters} className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-bold text-text-secondary hover:bg-surface-sunken">Clear filters</button>
                    </div>
                </div>
            </form>

            {selected.length > 0 && (
                <div className="mb-4 flex items-center justify-between rounded-2xl border border-primary bg-primary-subtle px-5 py-3">
                    <span className="text-sm font-semibold text-primary">{selected.length} selected</span>
                    <div className="flex gap-2">
                        <button onClick={() => bulkAction('cancel')} className="rounded-full bg-warning-bg px-3 py-1.5 text-xs font-bold uppercase text-warning hover:opacity-80">Suspend selected</button>
                        <button onClick={() => bulkAction('delete')} className="rounded-full bg-danger-bg px-3 py-1.5 text-xs font-bold uppercase text-danger hover:opacity-80">Delete selected</button>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
                <table className="w-full min-w-[880px] text-left text-sm">
                    <thead className="border-b border-border bg-surface-sunken text-xs uppercase tracking-wide text-text-muted">
                        <tr>
                            <th className="w-10 px-5 py-3">
                                <input type="checkbox" checked={selected.length === enrollments.data.length && enrollments.data.length > 0} onChange={toggleSelectAll} />
                            </th>
                            <th className="px-5 py-3">Student</th>
                            <th className="px-5 py-3">Course</th>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3">Amount / Proof</th>
                            <th className="px-5 py-3">Assigned</th>
                            <th className="px-5 py-3">Progress</th>
                            <th className="px-5 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {enrollments.data.map((e) => (
                            <tr key={e.id}>
                                <td className="px-5 py-3"><input type="checkbox" checked={selected.includes(e.id)} onChange={() => toggleSelect(e.id)} /></td>
                                <td className="px-5 py-3">
                                    <div className="font-medium text-text">{e.user?.name}</div>
                                    <div className="text-xs text-text-muted">{e.user?.email}</div>
                                </td>
                                <td className="px-5 py-3 text-text-secondary">{e.course?.title ?? '—'}</td>
                                <td className="px-5 py-3">
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${
                                        e.status === 'active' ? 'bg-success-bg text-success' : e.status === 'pending' ? 'bg-warning-bg text-warning' : 'bg-danger-bg text-danger'
                                    }`}>{e.status}</span>
                                </td>
                                <td className="px-5 py-3 text-text-secondary">
                                    {e.payment ? (
                                        <>
                                            Rs. {Number(e.payment.amount).toLocaleString()}
                                            {e.payment.proof_file_path && (
                                                <a href={`/storage/${e.payment.proof_file_path}`} target="_blank" rel="noopener noreferrer" className="ml-2 text-xs font-bold text-primary hover:underline">
                                                    View
                                                </a>
                                            )}
                                        </>
                                    ) : '—'}
                                </td>
                                <td className="px-5 py-3 text-text-secondary">{e.assigned ? 'Yes' : 'No'}</td>
                                <td className="px-5 py-3 text-text-secondary">{e.progress}%</td>
                                <td className="px-5 py-3">
                                    <div className="flex gap-3">
                                        <button onClick={() => cancelOne(e)} title="Suspend" className="text-warning hover:opacity-70">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path strokeLinecap="round" d="M9 9l6 6" /></svg>
                                        </button>
                                        <button onClick={() => deleteOne(e)} title="Delete" className="text-danger hover:opacity-70">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 6l1 14a2 2 0 002 2h6a2 2 0 002-2l1-14M4 6h16M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {enrollments.data.length === 0 && <p className="py-10 text-center text-text-secondary">No enrollments found.</p>}

            <div className="mt-6 flex flex-wrap justify-center gap-2">
                {enrollments.links.map((link, i) => (
                    <button
                        key={i}
                        disabled={!link.url}
                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                        className={`rounded-lg px-4 py-2 text-sm ${link.active ? 'bg-primary text-on-primary' : 'bg-surface text-text-secondary hover:bg-primary-subtle'} disabled:opacity-40`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}
            </div>

            {modalOpen && <EnrollStudentModal courses={courses} onClose={() => setModalOpen(false)} />}
        </AdminLayout>
    );
}
