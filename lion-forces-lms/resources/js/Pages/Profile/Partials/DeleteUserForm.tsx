import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useRef } from 'react';
import { LockIcon } from '@/Components/AuthIcons';
import IconTextInput from '@/Components/IconTextInput';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import LiquidButton from '@/Components/LiquidButton';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';

// Controlled from Edit.tsx -- the trigger now lives as a small link in the
// profile header card (see Edit.tsx) instead of a whole standing "Delete
// Account" section stacked at the bottom of the page, so this component is
// just the confirmation modal itself; the modal's own copy already explains
// the consequences, so nothing is lost by dropping the outer section.
export default function DeleteUserForm({ show, onClose }: { show: boolean; onClose: () => void }) {
    const passwordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => onClose(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    useEffect(() => {
        if (!show) {
            clearErrors();
            reset();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show]);

    return (
        <Modal show={show} onClose={onClose}>
            <form onSubmit={deleteUser} className="p-6">
                <h2 className="text-lg font-bold text-text">
                    Are you sure you want to delete your account?
                </h2>

                <p className="mt-1 text-sm text-text-secondary">
                    Once your account is deleted, all of its resources and data will be permanently deleted.
                    Please enter your password to confirm you would like to permanently delete your account.
                </p>

                <div className="mt-6">
                    <InputLabel htmlFor="password" value="Password" className="sr-only" />

                    <IconTextInput
                        id="password"
                        type="password"
                        icon={<LockIcon />}
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        className="w-full"
                        isFocused
                        placeholder="Password"
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton type="button" onClick={onClose}>
                        Cancel
                    </SecondaryButton>

                    <LiquidButton type="submit" tone="danger" disabled={processing} className="px-5 py-2.5 text-sm uppercase tracking-wide">
                        Delete Account
                    </LiquidButton>
                </div>
            </form>
        </Modal>
    );
}
