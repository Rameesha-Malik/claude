import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import LiteMarkdown from '@/Components/LiteMarkdown';
import AdminLayout from '@/Layouts/AdminLayout';

interface Payment { id: number; amount: string; method: string; status: string; reference_number: string | null; notes: string | null; created_at: string; enrollment?: { course: { id: number; title: string } } }
interface Enrollment {
    id: number; status: string;
    course: { id: number; title: string; category: { name: string } | null };
    package: { name: string } | null;
    payments: Payment[];
}
interface QuizAttempt { id: number; type: string; status: string; score: string | null; total_marks: string | null; percentage: string | null; passed: boolean | null; submitted_at: string | null }
interface Review { id: number; course: { id: number; title: string } | null; rating: number | null; review_text: string; status: string; created_at: string }
interface LoginLogRow { id: number; ip_address: string | null; device: string | null; browser: string | null; created_at: string }
interface Stats { enrollments: number; quiz_attempts: number; reviews: number; lectures_done: number }
interface Student {
    id: number; name: string; email: string; phone: string | null; is_active: boolean;
    father_name: string | null; cnic: string | null; education: string | null; address: string | null;
    email_verified_at: string | null; created_at: string; enrollments: Enrollment[];
}
interface Course { id: number; title: string }
interface Props {
    student: Student; courses: Course[]; stats: Stats;
    quizAttempts: QuizAttempt[]; reviews: Review[]; loginLogs: LoginLogRow[]; payments: Payment[];
}

const inputClass = 'w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:shadow-glow focus:outline-none';
const labelClass = 'mb-1 block text-xs font-bold uppercase tracking-wide text-text-muted';

const JUMP_LINKS = [
    { id: 'quiz-attempts', label: 'Quiz Attempts' },
    { id: 'enrollments', label: 'Enrollments' },
    { id: 'biodata', label: 'Biodata' },
    { id: 'payments', label: 'Payments' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'login-history', label: 'Login History' },
];

export default function StudentShow({ student, courses, stats, quizAttempts, reviews, loginLogs, payments }: Props) {
    return (
        <AdminLayout header="Students">
            <Head title={student.name} />

            <ProfileHeader student={student} />

            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatTile label="Enrollments" value={stats.enrollments} />
                <StatTile label="Quiz Attempts" value={stats.quiz_attempts} />
                <StatTile label="Reviews" value={stats.reviews} />
                <StatTile label="Lectures Done" value={stats.lectures_done} />
            </div>

            <div className="mb-6 rounded-2xl border border-border bg-surface p-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">Jump to section</p>
                <div className="flex flex-wrap gap-2">
                    {JUMP_LINKS.map((l) => (
                        <a key={l.id} href={`#${l.id}`} className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-text-secondary hover:border-primary hover:text-primary">
                            {l.label}
                        </a>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                <BiodataPanel student={student} />
                <PaymentsPanel student={student} courses={courses} payments={payments} />
                <LoginHistoryPanel logs={loginLogs} />
                <EnrollmentsPanel student={student} courses={courses} />
                <QuizAttemptsPanel attempts={quizAttempts} />
                <ReviewsPanel reviews={reviews} />
            </div>
        </AdminLayout>
    );
}

function ProfileHeader({ student }: { student: Student }) {
    const [showPassword, setShowPassword] = useState(false);
    const passwordForm = useForm({ password: '', password_confirmation: '' });

    function toggleSuspend() {
        router.post(`/admin/students/${student.id}/toggle-suspend`);
    }

    function destroyStudent() {
        if (confirm(`Delete ${student.name}'s account permanently? This also removes their enrollments and test history. This cannot be undone.`)) {
            router.delete(`/admin/students/${student.id}`, { onSuccess: () => router.visit('/admin/students') });
        }
    }

    function resetDevice() {
        if (confirm(`Reset ${student.name}'s registered devices? They'll be able to sign in from a new device again.`)) {
            router.post('/admin/settings/students/reset-devices', { email: student.email });
        }
    }

    function submitPassword(e: React.FormEvent) {
        e.preventDefault();
        passwordForm.put(`/admin/students/${student.id}/password`, {
            onSuccess: () => { passwordForm.reset(); setShowPassword(false); },
        });
    }

    return (
        <div className="mb-6 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-secondary to-teal-950 p-6 text-white sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl font-bold">
                        {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        {student.email_verified_at && (
                            <span className="mb-1 inline-block rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">Verified</span>
                        )}
                        <h2 className="font-display text-2xl lowercase">{student.name}</h2>
                        <p className="text-sm text-teal-200">{student.email}</p>
                        <p className="text-xs text-teal-300">Joined {new Date(student.created_at).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={toggleSuspend}
                        className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wide ${
                            student.is_active ? 'bg-warning text-white hover:opacity-90' : 'bg-success text-white hover:opacity-90'
                        }`}
                    >
                        {student.is_active ? 'Restrict' : 'Reactivate'}
                    </button>
                    <button onClick={() => setShowPassword((v) => !v)} className="rounded-lg bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wide hover:bg-white/20">
                        Password
                    </button>
                    <button onClick={resetDevice} className="rounded-lg bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wide hover:bg-white/20">
                        Reset Device
                    </button>
                    <button onClick={destroyStudent} className="rounded-lg bg-danger px-4 py-2 text-xs font-bold uppercase tracking-wide text-white hover:opacity-90">
                        Delete
                    </button>
                </div>
            </div>

            {showPassword && (
                <form onSubmit={submitPassword} className="mt-5 flex flex-wrap items-end gap-2 rounded-xl bg-white/10 p-4">
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-teal-200">New Password</label>
                        <input
                            type="password"
                            className="rounded-lg border-0 px-3 py-2 text-sm text-text"
                            value={passwordForm.data.password}
                            onChange={(e) => passwordForm.setData('password', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-teal-200">Confirm</label>
                        <input
                            type="password"
                            className="rounded-lg border-0 px-3 py-2 text-sm text-text"
                            value={passwordForm.data.password_confirmation}
                            onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                        />
                    </div>
                    <button type="submit" disabled={passwordForm.processing} className="rounded-lg bg-accent px-4 py-2 text-xs font-bold uppercase tracking-wide text-accent-fg hover:bg-accent-hover">
                        Save Password
                    </button>
                    {passwordForm.errors.password && <div className="w-full text-xs text-red-300">{passwordForm.errors.password}</div>}
                </form>
            )}
        </div>
    );
}

function StatTile({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-text-muted">{label}</p>
            <p className="mt-1 font-display text-2xl text-text">{value}</p>
        </div>
    );
}

function SectionCard({ id, title, subtitle, action, children }: { id: string; title: string; subtitle: string; action?: React.ReactNode; children: React.ReactNode }) {
    return (
        <div id={id} className="scroll-mt-20 rounded-2xl border border-border bg-surface p-6">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-text">{title}</h3>
                    <p className="text-xs font-bold uppercase tracking-wide text-primary">{subtitle}</p>
                </div>
                {action}
            </div>
            {children}
        </div>
    );
}

function BiodataPanel({ student }: { student: Student }) {
    const [editing, setEditing] = useState(false);
    const form = useForm({
        phone: student.phone ?? '', father_name: student.father_name ?? '', cnic: student.cnic ?? '',
        education: student.education ?? '', address: student.address ?? '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.put(`/admin/students/${student.id}/biodata`, { onSuccess: () => setEditing(false) });
    }

    return (
        <SectionCard
            id="biodata"
            title="Biodata"
            subtitle="Core Identity"
            action={<button onClick={() => setEditing((v) => !v)} className="rounded-lg border border-primary px-4 py-1.5 text-xs font-bold uppercase text-primary hover:bg-primary-subtle">{editing ? 'Cancel' : 'Edit'}</button>}
        >
            {editing ? (
                <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className={labelClass}>Father Name</label>
                        <input className={inputClass} value={form.data.father_name} onChange={(e) => form.setData('father_name', e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>CNIC</label>
                        <input className={inputClass} value={form.data.cnic} onChange={(e) => form.setData('cnic', e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>Mobile</label>
                        <input className={inputClass} value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>Education</label>
                        <input className={inputClass} value={form.data.education} onChange={(e) => form.setData('education', e.target.value)} />
                    </div>
                    <div className="sm:col-span-2">
                        <label className={labelClass}>Address</label>
                        <input className={inputClass} value={form.data.address} onChange={(e) => form.setData('address', e.target.value)} />
                    </div>
                    <div className="sm:col-span-2">
                        <button type="submit" disabled={form.processing} className="rounded-lg bg-primary px-5 py-2 text-sm font-bold uppercase text-on-primary hover:bg-primary-hover">Save</button>
                    </div>
                </form>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    <BioField label="Father Name" value={student.father_name} />
                    <BioField label="CNIC" value={student.cnic} />
                    <BioField label="Mobile" value={student.phone} />
                    <BioField label="Education" value={student.education} />
                    <div className="sm:col-span-2"><BioField label="Address" value={student.address} /></div>
                </div>
            )}
        </SectionCard>
    );
}

function BioField({ label, value }: { label: string; value: string | null }) {
    return (
        <div>
            <p className="text-xs font-bold uppercase tracking-wide text-text-muted">{label}</p>
            <p className="mt-0.5 text-sm text-text">{value || '—'}</p>
        </div>
    );
}

function PaymentsPanel({ student, courses, payments }: { student: Student; courses: Course[]; payments: Payment[] }) {
    const [adding, setAdding] = useState(false);
    const form = useForm({ course_id: '' as number | '', amount: '', reference_number: '', notes: '', status: 'verified' });
    const enrolledCourseIds = new Set(student.enrollments.map((e) => e.course.id));
    const enrolledCourses = courses.filter((c) => enrolledCourseIds.has(c.id));

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.post(`/admin/students/${student.id}/payments`, { onSuccess: () => { form.reset(); setAdding(false); } });
    }

    return (
        <SectionCard
            id="payments"
            title="Payments"
            subtitle="Fiscal Records"
            action={<button onClick={() => setAdding((v) => !v)} className="rounded-lg bg-primary px-4 py-1.5 text-xs font-bold uppercase text-on-primary hover:bg-primary-hover">{adding ? 'Cancel' : '+ Add Payment'}</button>}
        >
            {adding && (
                <form onSubmit={submit} className="mb-5 grid gap-4 rounded-xl border border-border p-4 sm:grid-cols-3">
                    <div>
                        <label className={labelClass}>Course</label>
                        <select className={inputClass} value={form.data.course_id} onChange={(e) => form.setData('course_id', e.target.value ? Number(e.target.value) : '')}>
                            <option value="">Select course...</option>
                            {enrolledCourses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                        {enrolledCourses.length === 0 && <p className="mt-1 text-xs text-text-muted">Enroll the student in a course first.</p>}
                    </div>
                    <div>
                        <label className={labelClass}>Amount (PKR)</label>
                        <input type="number" className={inputClass} placeholder="0.00" value={form.data.amount} onChange={(e) => form.setData('amount', e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>Transaction ID</label>
                        <input className={inputClass} placeholder="Auto-generate" value={form.data.reference_number} onChange={(e) => form.setData('reference_number', e.target.value)} />
                    </div>
                    <div className="sm:col-span-2">
                        <label className={labelClass}>Notes</label>
                        <input className={inputClass} placeholder="e.g. Bank transfer" value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>Status</label>
                        <select className={inputClass} value={form.data.status} onChange={(e) => form.setData('status', e.target.value)}>
                            <option value="verified">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="rejected">Rejected</option>
                            <option value="refunded">Refunded</option>
                        </select>
                    </div>
                    <div className="flex items-end gap-2 sm:col-span-3">
                        <button type="submit" disabled={form.processing} className="rounded-lg bg-primary px-5 py-2 text-sm font-bold uppercase text-on-primary hover:bg-primary-hover disabled:opacity-50">Save Payment</button>
                        {Object.values(form.errors).map((m, i) => <div key={i} className="text-sm text-danger">{m}</div>)}
                    </div>
                </form>
            )}

            {payments.length === 0 ? (
                <p className="py-6 text-center text-sm text-text-secondary">No payment records.</p>
            ) : (
                <div className="space-y-2">
                    {payments.map((p) => (
                        <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3 text-sm">
                            <div>
                                <span className="font-semibold text-text">{p.enrollment?.course.title ?? '—'}</span>
                                <span className="ml-2 text-text-muted">{p.reference_number}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-text">Rs. {Number(p.amount).toLocaleString()}</span>
                                <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${p.status === 'verified' ? 'bg-success-bg text-success' : p.status === 'rejected' ? 'bg-danger-bg text-danger' : 'bg-warning-bg text-warning'}`}>
                                    {p.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </SectionCard>
    );
}

function LoginHistoryPanel({ logs }: { logs: LoginLogRow[] }) {
    return (
        <SectionCard id="login-history" title="Login History" subtitle="Access &amp; Security Audit">
            {logs.length === 0 ? (
                <p className="py-6 text-center text-sm text-text-secondary">No login history yet.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="text-xs font-bold uppercase tracking-wide text-text-muted">
                                <th className="pb-2 pr-4">Timestamp</th>
                                <th className="pb-2 pr-4">IP Address</th>
                                <th className="pb-2 pr-4">Location</th>
                                <th className="pb-2 pr-4">Device</th>
                                <th className="pb-2">Browser</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((l) => (
                                <tr key={l.id} className="border-t border-border">
                                    <td className="py-2 pr-4 text-text">{new Date(l.created_at).toLocaleString()}</td>
                                    <td className="py-2 pr-4 text-text-secondary">{l.ip_address ?? '—'}</td>
                                    <td className="py-2 pr-4 text-text-secondary">—</td>
                                    <td className="py-2 pr-4 text-text-secondary">{l.device ?? '—'}</td>
                                    <td className="py-2 text-text-secondary">{l.browser ?? '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </SectionCard>
    );
}

function EnrollmentsPanel({ student, courses }: { student: Student; courses: Course[] }) {
    const enrollForm = useForm({ course_id: '' });

    function submitEnroll(e: React.FormEvent) {
        e.preventDefault();
        enrollForm.post(`/admin/students/${student.id}/enroll`, { onSuccess: () => enrollForm.reset() });
    }

    return (
        <SectionCard id="enrollments" title="Enrollments" subtitle="Course Progress">
            <form onSubmit={submitEnroll} className="mb-4 flex gap-2">
                <select
                    className={inputClass}
                    value={enrollForm.data.course_id}
                    onChange={(e) => enrollForm.setData('course_id', e.target.value)}
                >
                    <option value="">Enroll in a course...</option>
                    {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
                <button type="submit" disabled={enrollForm.processing || !enrollForm.data.course_id} className="flex-shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-bold uppercase text-on-primary hover:bg-primary-hover disabled:opacity-50">
                    Enroll
                </button>
            </form>

            {student.enrollments.length === 0 ? (
                <p className="py-6 text-center text-sm text-text-secondary">No enrollments yet.</p>
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
        </SectionCard>
    );
}

const ATTEMPT_TYPE_LABELS: Record<string, string> = {
    Quiz: 'Quiz', PracticeTest: 'Practice Test', MockExam: 'Mock Exam', StagedTest: 'Full Test', CustomQuizConfig: 'Custom Quiz', DemoQuiz: 'Demo Quiz',
};

function QuizAttemptsPanel({ attempts }: { attempts: QuizAttempt[] }) {
    return (
        <SectionCard id="quiz-attempts" title="Quiz Attempts" subtitle="Assessment Results">
            {attempts.length === 0 ? (
                <p className="py-6 text-center text-sm text-text-secondary">No quiz data.</p>
            ) : (
                <div className="space-y-2">
                    {attempts.map((a) => (
                        <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3 text-sm">
                            <div>
                                <span className="font-semibold text-text">{ATTEMPT_TYPE_LABELS[a.type] ?? a.type}</span>
                                {a.submitted_at && <span className="ml-2 text-xs text-text-muted">{new Date(a.submitted_at).toLocaleDateString()}</span>}
                            </div>
                            <div className="flex items-center gap-3">
                                {a.percentage !== null && <span className="text-text">{a.percentage}%</span>}
                                <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${a.passed ? 'bg-success-bg text-success' : a.status === 'submitted' ? 'bg-danger-bg text-danger' : 'bg-surface-sunken text-text-muted'}`}>
                                    {a.status === 'submitted' ? (a.passed ? 'Passed' : 'Failed') : a.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </SectionCard>
    );
}

function ReviewsPanel({ reviews }: { reviews: Review[] }) {
    return (
        <SectionCard id="reviews" title="Reviews" subtitle="User Feedback">
            {reviews.length === 0 ? (
                <p className="py-6 text-center text-sm text-text-secondary">No reviews.</p>
            ) : (
                <div className="space-y-3">
                    {reviews.map((r) => (
                        <div key={r.id} className="rounded-lg border border-border p-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-text">{r.course?.title ?? '—'}</span>
                                {r.rating && <span className="text-gold-700">{'★'.repeat(r.rating)}</span>}
                            </div>
                            <LiteMarkdown text={r.review_text} className="mt-1 text-text-secondary" />
                        </div>
                    ))}
                </div>
            )}
        </SectionCard>
    );
}
