'use client'

import {useSearchParams} from "next/navigation";
import {useState, useEffect} from "react"
import {useTranslation} from "react-i18next";
import {Input} from "@/components/classicComponents/Input";
import {Button} from "@/components/classicComponents/Button";
import {signin, signup} from "@/lib/actions/signActions";
import {AlertTriangle} from "lucide-react";

export default function ConnectionsPage() {
    // Hook for translation
    const {t} = useTranslation();

    // Variables for view management, error management and parameters
    const searchParams = useSearchParams();
    // view can be 'signin' or 'signup'
    const viewParam = searchParams.get('view') as "signin" | "signup" | null;
    const [view, setView] = useState<"signin" | "signup">(viewParam || "signin");
    // errorMessage holds any error message to display
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        /*
        This useEffect hook listens for changes in the URL search parameters.
        It extracts 'error' and 'view' parameters to update the component's state accordingly.
        */
        const error = searchParams.get('error');
        const viewParam = searchParams.get('view') as "signin" | "signup" | null;

        if (viewParam) {
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

    return (
        <div className="flex flex-col relative w-screen h-screen justify-between py-4">
            <div className="flex justify-center w-full mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-white pt-15">{t('Authentication.Title')}</h1>
            </div>
            <div className="flex items-end justify-center flex-1 p-4 pb-25">
                <div className="mb-5 rounded-3xl bg-white/98 backdrop-blur-[10px] shadow-[0_30px_80px_rgba(0,0,0,0.4)] flex flex-col absolute overflow-hidden p-4 md:p-8 lg:p-10 w-[90vw] max-w-150 min-w-70 max-h-[70vh] gap-3 md:gap-4 lg:gap-5">
                    
                    {/* Error Message */}
                    {errorMessage && (
                        <div className="flex items-start gap-2 bg-red-50 border-l-4 border-red-400 rounded-md p-2 md:p-3">
                            <AlertTriangle className="shrink-0 mt-0.5 text-red-600 w-4 h-4 md:w-5 md:h-5" />
                            <p className="text-red-800 leading-relaxed text-xs md:text-sm">
                                {errorMessage}
                            </p>
                        </div>
                    )}

                    {/* Sign In Form */}
                    <form 
                        action={signin}
                        className={`flex flex-col gap-2 md:gap-3 lg:gap-4 ${view === 'signin' ? '' : 'hidden'}`}
                    >
                        <Input placeholder={t('Authentication.EmailPlaceholder')} type='email' name='email' required />
                        <Input placeholder={t('Authentication.PasswordPlaceholder')} type='password' name='password' required />
                        <Button content={t('Authentication.Login.LoginButton')} variant='primary' />
                    </form>

                    {/* Sign Up Form */}
                    <form 
                        action={signup}
                        className={`flex flex-col gap-2 md:gap-3 lg:gap-4 ${view === 'signup' ? '' : 'hidden'}`}
                    >
                        <Input placeholder={t('Authentication.NamePlaceholder')} type='text' name='name' required />
                        
                        <div className="flex items-start gap-2 bg-amber-50 border-l-4 border-amber-400 rounded-md p-2 md:p-3">
                            <AlertTriangle className="shrink-0 mt-0.5 text-amber-600 w-4 h-4 md:w-5 md:h-5" />
                            <p className="text-amber-800 leading-relaxed text-xs md:text-sm">
                                {t('Authentication.NameWarning')}
                            </p>
                        </div>
                        
                        <Input placeholder={t('Authentication.EmailPlaceholder')} type='email' name='email' required />
                        <Input placeholder={t('Authentication.PasswordPlaceholder')} type='password' name='password' required />
                        <Input placeholder={t('Authentication.ConfirmPasswordPlaceholder')} type='password' name='confirmPassword' required />
                        <Button content={t('Authentication.Register.RegisterButton')} variant='primary' />
                    </form>

                    {/* View Toggle Buttons */}
                    <div className="flex flex-row gap-2 md:gap-3 w-full mt-2 md:mt-4">
                        <Button 
                            content={t('Authentication.LoginViewButton')} 
                            variant={view === 'signin' ? 'primary' : 'secondary'}
                            onClick={() => setView('signin')}
                        />
                        <Button 
                            content={t('Authentication.RegisterViewButton')} 
                            variant={view === 'signup' ? 'primary' : 'secondary'}
                            onClick={() => setView('signup')}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}