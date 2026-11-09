import { Head, router, usePage } from '@inertiajs/react';
import { useState, useRef } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import StudentLayout from '@/Layouts/StudentLayout';
import TabBar from '@/Components/TabBar';
import LiquidButton from '@/Components/LiquidButton';
import { PageProps } from '@/types';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdateBiodataForm from './Partials/UpdateBiodataForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

type Tab = 'personal' | 'additional' | 'password';

// Independent settings panels, not a sequential setup flow -- a person can
// jump straight to "Update Password" without ever touching the others, so
// this is a plain click-to-switch tab bar, not a linear Step-1-of-3 wizard
// with Back/Next.
export default function Edit({ mustVerifyEmail, status, userType }: PageProps<{ mustVerifyEmail: boolean; status?: string; userType: string }>) {
    const { auth } = usePage<PageProps>().props;
    // /profile is reachable by both admin and student accounts -- wrap it in
    // whichever portal shell actually matches this user, same idea as the
    // neutral /dashboard redirect.
    const Layout = userType === 'admin' ? AdminLayout : StudentLayout;
    const avatarInput = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = useState<Tab>('personal');
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);

    const tabs: { key: Tab; label: string }[] = [
        { key: 'personal', label: 'Personal Info' },
        ...(userType === 'student' ? [{ key: 'additional' as Tab, label: 'Additional Info' }] : []),
        { key: 'password', label: 'Update' },
    ];

    function pickAvatar(file: File | undefined) {
        if (!file) return;
        router.post(route('profile.avatar.update'), { avatar: file }, { forceFormData: true, preserveScroll: true });
    }

    return (
        <Layout header="Profile">
            <Head title="Profile" />

            <div className="mx-auto max-w-3xl space-y-6">
                <div className="flex items-center gap-4 rounded-[2rem] border border-border bg-gradient-to-br from-secondary to-teal-950 p-6 text-white">
                    <button
                        type="button"
                        onClick={() => avatarInput.current?.click()}
                        title="Change profile photo"
                        className="group relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-white/15"
                    >
                        {auth.user?.avatar_path ? (
                            <img src={`/storage/${auth.user.avatar_path}`} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <span className="flex h-full w-full items-center justify-center font-display text-2xl">
                                {auth.user?.name?.charAt(0).toUpperCase()}
                            </span>
                        )}
                        <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-[0.6rem] font-bold uppercase tracking-wide opacity-0 transition-opacity group-hover:opacity-100">
                            Change
                        </span>
                    </button>
                    <input
                        ref={avatarInput}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => pickAvatar(e.target.files?.[0])}
                    />
                    <div className="min-w-0 flex-1">
                        <h1 className="truncate text-xl font-bold">{auth.user?.name}</h1>
                        <p className="truncate text-sm text-teal-200">{auth.user?.email}</p>
                    </div>
                    <LiquidButton tone="danger" onClick={() => setConfirmingDeletion(true)} className="flex-shrink-0 px-3 py-1.5 text-xs uppercase tracking-wide">
                        Delete Account
                    </LiquidButton>
                </div>

                <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />

                {/* "Glass" rim-light border (the same 1px mask-gradient trick
                    LiquidButton uses for its own rim), not a plain flat border --
                    so this card's edge reads as the same material as the
                    liquid-metal buttons around it instead of a flat line. */}
                <div className="relative overflow-hidden rounded-[2rem] bg-surface p-6 sm:p-8">
                    <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 rounded-[2rem]"
                        style={{
                            padding: 1,
                            background: 'linear-gradient(135deg, rgba(255,255,255,.9), rgba(255,255,255,0) 30%, rgba(255,255,255,0) 65%, var(--teal-600))',
                            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                            WebkitMaskComposite: 'xor',
                            maskComposite: 'exclude',
                        }}
                    />
                    <div className="relative z-10">
                        {activeTab === 'personal' && <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />}
                        {activeTab === 'additional' && userType === 'student' && <UpdateBiodataForm />}
                        {activeTab === 'password' && <UpdatePasswordForm />}
                    </div>
                </div>
            </div>

            <DeleteUserForm show={confirmingDeletion} onClose={() => setConfirmingDeletion(false)} />
        </Layout>
    );
}
