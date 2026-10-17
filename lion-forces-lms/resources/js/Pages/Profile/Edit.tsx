import { Head, router, usePage } from '@inertiajs/react';
import { useRef } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import StudentLayout from '@/Layouts/StudentLayout';
import { PageProps } from '@/types';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdateBiodataForm from './Partials/UpdateBiodataForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status, userType }: PageProps<{ mustVerifyEmail: boolean; status?: string; userType: string }>) {
    const { auth } = usePage<PageProps>().props;
    // /profile is reachable by both admin and student accounts -- wrap it in
    // whichever portal shell actually matches this user, same idea as the
    // neutral /dashboard redirect.
    const Layout = userType === 'admin' ? AdminLayout : StudentLayout;
    const avatarInput = useRef<HTMLInputElement>(null);

    function pickAvatar(file: File | undefined) {
        if (!file) return;
        router.post(route('profile.avatar.update'), { avatar: file }, { forceFormData: true, preserveScroll: true });
    }

    return (
        <Layout header="Profile">
            <Head title="Profile" />

            <div className="mx-auto max-w-2xl space-y-6">
                <div className="flex items-center gap-4 rounded-3xl border border-border bg-gradient-to-br from-secondary to-teal-950 p-6 text-white">
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
                    <div className="min-w-0">
                        <h1 className="truncate text-xl font-bold">{auth.user?.name}</h1>
                        <p className="truncate text-sm text-teal-200">{auth.user?.email}</p>
                    </div>
                </div>

                <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
                    <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />
                </div>

                {userType === 'student' && (
                    <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
                        <UpdateBiodataForm />
                    </div>
                )}

                <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
                    <UpdatePasswordForm />
                </div>

                <div className="rounded-3xl border bg-surface p-6 sm:p-8" style={{ borderColor: 'rgba(220, 38, 38, 0.3)' }}>
                    <DeleteUserForm />
                </div>
            </div>
        </Layout>
    );
}
