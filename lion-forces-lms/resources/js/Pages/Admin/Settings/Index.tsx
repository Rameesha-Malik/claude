import { Head, router, useForm, usePage } from '@inertiajs/react';
import RichTextArea from '@/Components/RichTextArea';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';

interface Staff { id: number; name: string; email: string; is_active: boolean; roles: { name: string }[] }
interface Props {
    staff: Staff[];
    roles: string[];
    paymentSettings: { bank_details: string | null; easypaisa_number: string | null; jazzcash_number: string | null };
}

const inputClass = 'w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:shadow-glow focus:outline-none';
const btnClass = 'rounded-lg bg-primary px-4 py-2 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover disabled:opacity-50';

export default function SettingsIndex({ staff, roles, paymentSettings }: Props) {
    const { auth } = usePage<PageProps>().props;
    const isOwner = staff.find((s) => s.id === auth.user?.id)?.roles.some((r) => r.name === 'owner') ?? false;

    const addForm = useForm({ name: '', email: '', password: '', role: 'staff' });
    const paymentForm = useForm({ ...paymentSettings });

    return (
        <AdminLayout header="Settings">
            <Head title="Settings" />

            <div className="space-y-6">
                <div className="max-w-2xl rounded-2xl border border-border bg-surface p-6">
                    <h2 className="mb-4 font-bold text-text">Admin & Staff Accounts</h2>
                    <div className="mb-4 space-y-2">
                        {staff.map((s) => (
                            <div key={s.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                                <div>
                                    <div className="font-medium text-text">{s.name} {s.id === auth.user?.id && <span className="text-xs text-text-muted">(you)</span>}</div>
                                    <div className="text-text-secondary">{s.email}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-xs font-bold uppercase text-primary">{s.roles[0]?.name ?? 'staff'}</span>
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${s.is_active ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger'}`}>
                                        {s.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                    {isOwner && s.id !== auth.user?.id && (
                                        <button onClick={() => router.post(`/admin/settings/staff/${s.id}/toggle-active`)} className="text-xs font-bold uppercase text-danger hover:underline">
                                            {s.is_active ? 'Deactivate' : 'Activate'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {isOwner ? (
                        <>
                            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">Add Staff Account</h3>
                            <form
                                onSubmit={(e) => { e.preventDefault(); addForm.post('/admin/settings/staff', { onSuccess: () => addForm.reset() }); }}
                                className="space-y-2"
                            >
                                <div className="grid grid-cols-2 gap-2">
                                    <input className={inputClass} placeholder="Name" value={addForm.data.name} onChange={(e) => addForm.setData('name', e.target.value)} />
                                    <input className={inputClass} placeholder="Email" value={addForm.data.email} onChange={(e) => addForm.setData('email', e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="password" className={inputClass} placeholder="Password" value={addForm.data.password} onChange={(e) => addForm.setData('password', e.target.value)} />
                                    <select className={inputClass} value={addForm.data.role} onChange={(e) => addForm.setData('role', e.target.value)}>
                                        {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <button type="submit" disabled={addForm.processing} className={btnClass}>Create Account</button>
                                {Object.values(addForm.errors).map((m, i) => <div key={i} className="text-sm text-danger">{String(m)}</div>)}
                            </form>
                        </>
                    ) : (
                        <p className="text-sm text-text-muted">Only the Owner can manage staff accounts.</p>
                    )}
                </div>

                <div className="max-w-2xl rounded-2xl border border-border bg-surface p-6">
                    <h2 className="mb-1 font-bold text-text">Payment Details</h2>
                    <p className="mb-4 text-sm text-text-secondary">Shown to students during checkout. Online gateway integration can be added later without changing this screen.</p>
                    <form
                        onSubmit={(e) => { e.preventDefault(); paymentForm.put('/admin/settings/payment'); }}
                        className="space-y-3"
                    >
                        <div>
                            <label className="mb-1 block text-sm font-medium text-text">Bank Transfer Details</label>
                            <RichTextArea rows={2} className={inputClass} value={paymentForm.data.bank_details ?? ''} onChange={(v) => paymentForm.setData('bank_details', v)} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-text">Easypaisa Number</label>
                                <input className={inputClass} value={paymentForm.data.easypaisa_number ?? ''} onChange={(e) => paymentForm.setData('easypaisa_number', e.target.value)} />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-text">JazzCash Number</label>
                                <input className={inputClass} value={paymentForm.data.jazzcash_number ?? ''} onChange={(e) => paymentForm.setData('jazzcash_number', e.target.value)} />
                            </div>
                        </div>
                        <button type="submit" disabled={paymentForm.processing} className={btnClass}>Save Payment Details</button>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
