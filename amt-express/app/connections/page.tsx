'use client'

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next";
import { Input } from "@/components/classicComponents/Input";
import { Button } from "@/components/classicComponents/Button";
import { signin, signup } from "@/lib/actions/signActions";
import { AlertTriangle, Car } from "lucide-react";

export default function ConnectionsPage() {
    // Hook for translation
    const { t } = useTranslation();

    // Variables for view management, error management and parameters
    const searchParams = useSearchParams();
    // view can be 'signin' or 'signup'
    const viewParam = searchParams.get('view') as "signin" | "signup" | null;
    const [view, setView] = useState<"signin" | "signup">(viewParam || "signin");
    // errorMessage holds any error message to display
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    // loading state for form submission
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        /*
        This useEffect hook listens for changes in the URL search parameters.
        It extracts 'error' and 'view' parameters to update the component's state accordingly.
        */
        const error = searchParams.get('error');
        const viewParam = searchParams.get('view') as "signin" | "signup" | null;

        if (viewParam) {
            /* IF any view params has been set, update the view state */
            setView(viewParam);
        }

        if (error && error !== 'true') {
            const decodedError = decodeURIComponent(error);
            // Try to translate the error
            // First check if it's a custom error key (errors.xxx)
            if (decodedError.startsWith('errors.')) {
                const translatedError = t(decodedError);
                setErrorMessage(translatedError);
            } else {
                // It's a better-auth error message, try to translate it from errors section
                const errorKey = `errors.${decodedError}`;
                const translatedError = t(errorKey, { defaultValue: decodedError });
                setErrorMessage(translatedError);
            }
        } else {
            setErrorMessage(null);
        }
    }, [searchParams, t]);

    const handleForgotPassword = () => {
        // TODO: Implement forgot password redirect
        alert(t('Authentication.PasswordReset', { defaultValue: 'Password reset coming soon' }));
    };

    return (
        <div className="connections-container">
            {/* Header Section */}
            <div className="connections-header">
                <div className="connections-logo-icon">
                    <Car style={{width: '50%'}}/>
                </div>
                <div className="connections-title-section">
                    <h1 className="connections-title">{t('Authentication.Title')}</h1>
                    <p className="connections-subtitle">{t('Authentication.Subtitle')}</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="connections-content-wrapper">
                <div className="connections-card">
                    
                    {/* Error Message */}
                    {errorMessage && (
                        <div className="connections-error-message">
                            <AlertTriangle className="connections-error-icon" />
                            <p className="connections-error-text">
                                {errorMessage}
                            </p>
                        </div>
                    )}

                    {/* Sign In Form */}
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
                        <Button 
                            content={t('Authentication.Login.LoginButton')} 
                            variant='primary'
                            type='submit'
                            disabled={isLoading}
                        />
                    </form>

                    {/* Sign Up Form */}
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
                        <Button 
                            content={t('Authentication.Register.RegisterButton')} 
                            variant='primary'
                            type='submit'
                            disabled={isLoading}
                        />
                    </form>
                </div>
            </div>
                    {/* Toggle Between Sign In and Sign Up */}
                    <div className="connections-toggle-container">
                        <p className="connections-toggle-text">
                            {view === 'signin' 
                                ? t('Authentication.NoAccount', { defaultValue: 'Pas encore de compte ?' })
                                : t('Authentication.HasAccount', { defaultValue: 'Vous avez déjà un compte ?' })
                            }
                        </p>
                        <button 
                            type="button"
                            className="connections-toggle-link"
                            onClick={() => setView(view === 'signin' ? 'signup' : 'signin')}
                        >
                            {view === 'signin' 
                                ? t('Authentication.CreateAccount', { defaultValue: 'Créer un compte' })
                                : t('Authentication.LoginViewButton', { defaultValue: 'Se connecter' })
                            }
                        </button>
                    </div>
        </div>
    );
}