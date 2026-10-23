import { Head, router } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';

interface Stage { id: number; name: string; order: number; duration_minutes: number | null; pass_threshold_percent: string; questions_count: number }
interface StagedTest { id: number; title: string; target_exam_name: string | null; stages: Stage[] }
interface Props { stagedTest: StagedTest; inProgressAttemptId: number | null; resumeStageId: number | null }

export default function StagedTestIntro({ stagedTest, inProgressAttemptId, resumeStageId }: Props) {
    const totalQuestions = stagedTest.stages.reduce((sum, s) => sum + s.questions_count, 0);

    function start() {
        router.post(`/portal/staged-tests/${stagedTest.id}/start`);
    }

    function resume() {
        if (inProgressAttemptId && resumeStageId) {
            router.get(`/portal/staged-tests/${stagedTest.id}/attempts/${inProgressAttemptId}/stages/${resumeStageId}`);
        }
    }

    return (
        <StudentLayout header={stagedTest.title}>
            <Head title={stagedTest.title} />

            <div className="mx-auto max-w-2xl space-y-6">
                <div className="rounded-2xl border border-border bg-surface p-6">
                    <h2 className="font-display text-2xl text-text">{stagedTest.title}</h2>
                    {stagedTest.target_exam_name && (
                        <p className="mt-1 text-sm font-bold uppercase tracking-wide text-gold-700">{stagedTest.target_exam_name} Pattern</p>
                    )}
                    <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                        <div className="rounded-lg bg-surface-sunken p-3">
                            <p className="text-xl font-bold text-text">{stagedTest.stages.length}</p>
                            <p className="text-xs uppercase text-text-muted">Stages</p>
                        </div>
                        <div className="rounded-lg bg-surface-sunken p-3">
                            <p className="text-xl font-bold text-text">{totalQuestions}</p>
                            <p className="text-xs uppercase text-text-muted">Questions</p>
                        </div>
                    </div>

                    <div className="mt-5 space-y-2">
                        {stagedTest.stages.map((s) => (
                            <div key={s.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-2 text-sm">
                                <span className="text-text">{s.order}. {s.name}</span>
                                <span className="text-text-muted">
                                    {s.questions_count} Qs{s.duration_minutes ? ` · ${s.duration_minutes} min` : ''} · Pass at {s.pass_threshold_percent}%
                                </span>
                            </div>
                        ))}
                    </div>

                    <p className="mt-5 rounded-lg bg-warning-bg p-3 text-sm font-semibold text-warning">
                        You must pass each stage's threshold to unlock the next one. Failing a stage ends the test there and shows your result.
                    </p>

                    <div className="mt-6 flex gap-3">
                        {inProgressAttemptId ? (
                            <button onClick={resume} className="rounded-lg bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover">
                                Resume Test
                            </button>
                        ) : (
                            <button
                                onClick={start}
                                disabled={stagedTest.stages.length === 0}
                                className="rounded-lg bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover disabled:opacity-50"
                            >
                                Start Test
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}
