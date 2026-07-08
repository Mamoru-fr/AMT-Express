'use client';

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/classicComponents/Input";
import { Button } from "@/components/classicComponents/Button";
import { StatusBanner } from "@/components/classicComponents/StatusBanner";
import { signin, signup } from "@/lib/actions/signActions";
import { AlertTriangle, Car } from "lucide-react";

type View = 'signin' | 'signup';

function isView(value: string | null): value is View {
    return value === 'signin' || value === 'signup';
}

function normalizeView(value: string | null): View {
    return isView(value) ? value : 'signin';
}

function SubmitButton({ content }: { content: string }) {
    const { pending } = useFormStatus();

    return <Button content={content} variant="primary" type="submit" disabled={pending} />;
}

export default function ConnectionsPage() {
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const [view, setView] = useState<View>(() => searchParams ? normalizeView(searchParams.get('view')) : 'signin');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [infoMessage, setInfoMessage] = useState<string | null>(null);

    useEffect(() => {
        const error = searchParams ? searchParams.get('error') : null;
        const nextView = searchParams ? normalizeView(searchParams.get('view')) : 'signin';

        // Only update view if it has changed to avoid unnecessary renders
        if (view !== nextView) {
            setView(nextView);
        }

        if (error && error !== 'true') {
            const decodedError = decodeURIComponent(error);

            if (decodedError.startsWith('errors.')) {
                setErrorMessage(t(decodedError));
            } else {
                const errorKey = `errors.${decodedError}`;
                setErrorMessage(t(errorKey, { defaultValue: decodedError }));
            }
        } else {
            setErrorMessage(null);
        }
    }, [searchParams, t]);

    const handleForgotPassword = () => {
        setInfoMessage(t('Authentication.PasswordReset', { defaultValue: 'Password reset coming soon' }));
    };

    return (
        <div className="connections-container">
            <div className="connections-header">
                <div className="connections-logo-icon">
                    <Car style={{ width: '50%' }} />
                </div>
                <div className="connections-title-section">
                    <h1 className="connections-title">{t('Authentication.Title')}</h1>
                    <p className="connections-subtitle">{t('Authentication.Subtitle')}</p>
                </div>
            </div>

            <div className="connections-content-wrapper">
                <div className="connections-card">
                    {errorMessage && (
                        <StatusBanner
                            tone="error"
                            title={t('Authentication.ErrorTitle', { defaultValue: 'Authentication failed' })}
                            message={errorMessage}
                            className="connections-status-banner"
                        />
                    )}

                    {infoMessage && (
                        <StatusBanner
                            tone="info"
                            title={t('Authentication.InfoTitle', { defaultValue: 'Information' })}
                            message={infoMessage}
                            className="connections-status-banner"
                        />
                    )}

                    <form
                        action={signin}
                        className={`connections-form ${view === 'signin' ? '' : 'hidden'}`}
                    >
                        <Input
                            placeholder={t('Authentication.EmailPlaceholder')}
                            type='email'
                            name='email'
                            required
                        />
                        <Input
                            placeholder={t('Authentication.PasswordPlaceholder')}
                            type='password'
                            name='password'
                            required
                        />
                        <div className="connections-forgot-password-container">
                            <button
                                type="button"
                                className="connections-forgot-password-link"
                                onClick={handleForgotPassword}
                            >
                                {t('Authentication.ForgotPassword', { defaultValue: 'Mot de passe oublié ?' })}
                            </button>
                        </div>
                        <SubmitButton content={t('Authentication.Login.LoginButton')} />
                    </form>

                    <form
                        action={signup}
                        className={`connections-form ${view === 'signup' ? '' : 'hidden'}`}
                    >
                        <Input
                            placeholder={t('Authentication.NamePlaceholder')}
                            type='text'
                            name='name'
                            required
                        />

                        <div className="connections-warning-message">
                            <AlertTriangle className="connections-warning-icon" />
                            <p className="connections-warning-text">
                                {t('Authentication.NameWarning')}
                            </p>
                        </div>

                        <Input
                            placeholder={t('Authentication.EmailPlaceholder')}
                            type='email'
                            name='email'
                            required
                        />
                        <Input
                            placeholder={t('Authentication.PasswordPlaceholder')}
                            type='password'
                            name='password'
                            required
                        />
                        <Input
                            placeholder={t('Authentication.ConfirmPasswordPlaceholder')}
                            type='password'
                            name='confirmPassword'
                            required
                        />
                        <SubmitButton content={t('Authentication.Register.RegisterButton')} />
                    </form>
                </div>
            </div>

            <div className="connections-toggle-container">
                <p className="connections-toggle-text">
                    {view === 'signin'
                        ? t('Authentication.NoAccount')
                        : t('Authentication.HasAccount')
                    }
                </p>
                <button
                    type="button"
                    className="connections-toggle-link"
                    onClick={() => setView(view === 'signin' ? 'signup' : 'signin')}
                >
                    {view === 'signin'
                        ? t('Authentication.CreateAccount')
                        : t('Authentication.LoginViewButton')
                    }
                </button>
            </div>
        </div>
    );
}
