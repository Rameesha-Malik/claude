import { Head, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import StudentLayout from '@/Layouts/StudentLayout';
import { PageProps } from '@/types';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status, userType }: PageProps<{ mustVerifyEmail: boolean; status?: string; userType: string }>) {
    const { auth } = usePage<PageProps>().props;
    // /profile is reachable by both admin and student accounts -- wrap it in
    // whichever portal shell actually matches this user, same idea as the
    // neutral /dashboard redirect.
    const Layout = userType === 'admin' ? AdminLayout : StudentLayout;

    return (
        <Layout header="Profile">
            <Head title="Profile" />

            <div className="mx-auto max-w-2xl space-y-6">
                <div className="flex items-center gap-4 rounded-3xl border border-border bg-gradient-to-br from-secondary to-teal-950 p-6 text-white">
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-white/15 font-display text-2xl">
                        {auth.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <h1 className="truncate text-xl font-bold">{auth.user?.name}</h1>
                        <p className="truncate text-sm text-teal-200">{auth.user?.email}</p>
                    </div>
                </div>

                <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
                    <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />
                </div>

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
