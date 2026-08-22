import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Submission {
    id: number; file_path: string | null; submission_text: string | null; status: string;
    marks_awarded: number | null; feedback: string | null; submitted_at: string;
    user: { name: string; email: string };
}
interface Props {
    assignment: { id: number; title: string; max_marks: number | null; course_id: number };
    course: { id: number; title: string };
    submissions: Submission[];
}

export default function AssignmentSubmissions({ assignment, course, submissions }: Props) {
    return (
        <AdminLayout header={`Submissions — ${assignment.title}`}>
            <Head title={`Submissions — ${assignment.title}`} />

            <p className="mb-6 text-sm text-text-secondary">{course.title} · {submissions.length} submission{submissions.length === 1 ? '' : 's'}</p>

            <div className="space-y-4">
                {submissions.map((s) => (
                    <SubmissionCard key={s.id} submission={s} maxMarks={assignment.max_marks} courseId={course.id} />
                ))}
                {submissions.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                        No submissions yet.
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

function SubmissionCard({ submission, maxMarks, courseId }: { submission: Submission; maxMarks: number | null; courseId: number }) {
    const [grading, setGrading] = useState(false);
    const form = useForm({
        marks_awarded: submission.marks_awarded !== null ? String(submission.marks_awarded) : '',
        feedback: submission.feedback ?? '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.post(`/admin/courses/${courseId}/assignments/submissions/${submission.id}/grade`, {
            preserveScroll: true,
            onSuccess: () => setGrading(false),
        });
    }

    return (
        <div className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <div className="font-semibold text-text">{submission.user.name} <span className="font-normal text-text-secondary">— {submission.user.email}</span></div>
                    <p className="mt-0.5 text-xs text-text-muted">Submitted {new Date(submission.submitted_at).toLocaleString()}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${submission.status === 'graded' ? 'bg-success-bg text-success' : 'bg-warning-bg text-warning'}`}>
                    {submission.status === 'graded' ? `Graded${maxMarks ? ` · ${submission.marks_awarded}/${maxMarks}` : ''}` : 'Ungraded'}
                </span>
            </div>

            {submission.submission_text && (
                <p className="mt-3 whitespace-pre-line rounded-lg bg-surface-sunken p-3 text-sm text-text">{submission.submission_text}</p>
            )}
            {submission.file_path && (
                <a href={`/storage/${submission.file_path}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
                    View Submitted File →
                </a>
            )}

            {submission.status === 'graded' && !grading && (
                <div className="mt-3 rounded-lg bg-primary-subtle p-3 text-sm text-text">
                    <span className="font-bold text-primary">Feedback: </span>{submission.feedback || '—'}
                </div>
            )}

            {grading ? (
                <form onSubmit={submit} className="mt-4 space-y-2 border-t border-border pt-4">
                    <div className="flex items-center gap-3">
                        <input
                            type="number"
                            min={0}
                            max={maxMarks ?? undefined}
                            placeholder={maxMarks ? `Marks (out of ${maxMarks})` : 'Marks'}
                            className="w-40 rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:shadow-glow focus:outline-none"
                            value={form.data.marks_awarded}
                            onChange={(e) => form.setData('marks_awarded', e.target.value)}
                        />
                    </div>
                    <textarea
                        rows={3}
                        placeholder="Feedback"
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:shadow-glow focus:outline-none"
                        value={form.data.feedback}
                        onChange={(e) => form.setData('feedback', e.target.value)}
                    />
                    <div className="flex gap-2">
                        <button type="submit" disabled={form.processing} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold uppercase text-on-primary hover:bg-primary-hover">
                            Save Grade
                        </button>
                        <button type="button" onClick={() => setGrading(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-bold uppercase text-text hover:border-primary">
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <button onClick={() => setGrading(true)} className="mt-3 text-sm font-bold uppercase text-primary hover:underline">
                    {submission.status === 'graded' ? 'Re-grade' : 'Grade'}
                </button>
            )}
        </div>
    );
}
