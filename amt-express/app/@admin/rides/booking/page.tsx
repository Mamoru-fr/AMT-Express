'use client';

import { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { PlusCircle, CheckCircle, ArrowRight } from 'lucide-react';

import { AdminSidebar } from '@/components/admin/navigation/AdminSidebar';
import { createRideRequest } from '@/lib/actions/customerRideActions';
import styles from '@/components/dashboard/CustomerDashboard.module.css';
import formStyles from '@/app/@customer/rides/booking/booking.module.css';

export default function AdminBookingPage() {
    const { t } = useTranslation();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [submittedRideId, setSubmittedRideId] = useState<string | null>(null);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            const result = await createRideRequest(formData);
            if (result.success && result.data) {
                setSubmittedRideId(result.data.rideId);
            } else if (!result.success) {
                setError(result.error || t('rideRequest.submitError'));
            }
        });
    }

    return (
        <AdminSidebar>
            <div className={styles.customerDashboard}>
                <div className={styles.customerInner}>
                    <div className={styles.headerBlock}>
                        <div className={styles.titleRow}>
                            <div className={styles.titleIcon}><PlusCircle /></div>
                            <h1 className={styles.title}>{t('adminNavigation.bookRide')}</h1>
                        </div>
                        <p className={styles.subtitle}>{t('adminNavigation.bookRideDescription')}</p>
                    </div>

                    {submittedRideId ? (
                        <div className={formStyles.successCard}>
                            <CheckCircle className={formStyles.successIcon} />
                            <h2 className={formStyles.successTitle}>{t('rideRequest.successTitle')}</h2>
                            <p className={formStyles.successDesc}>{t('rideRequest.successDesc')}</p>
                            <div className={formStyles.successActions}>
                                <Link href="/rides" className={formStyles.primaryLink}>
                                    {t('rideRequest.viewBookings')} <ArrowRight size={16} />
                                </Link>
                                <button
                                    type="button"
                                    className={formStyles.ghostLink}
                                    onClick={() => { setSubmittedRideId(null); setError(null); }}
                                >
                                    {t('rideRequest.newRequest')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className={formStyles.card}>
                            <div className={formStyles.twoCol}>
                                <div className={formStyles.fieldGroup}>
                                    <label className={formStyles.label} htmlFor="departure">
                                        {t('rideRequest.departure')}
                                    </label>
                                    <input id="departure" name="departure" type="text" className={formStyles.input} placeholder={t('rideRequest.departurePlaceholder')} required disabled={isPending} />
                                </div>
                                <div className={formStyles.fieldGroup}>
                                    <label className={formStyles.label} htmlFor="destination">
                                        {t('rideRequest.destination')}
                                    </label>
                                    <input id="destination" name="destination" type="text" className={formStyles.input} placeholder={t('rideRequest.destinationPlaceholder')} required disabled={isPending} />
                                </div>
                            </div>
                            <div className={formStyles.twoCol}>
                                <div className={formStyles.fieldGroup}>
                                    <label className={formStyles.label} htmlFor="departureDate">
                                        {t('rideRequest.departureDate')}
                                    </label>
                                    <input id="departureDate" name="departureDate" type="date" className={formStyles.input} required disabled={isPending} />
                                </div>
                                <div className={formStyles.fieldGroup}>
                                    <label className={formStyles.label} htmlFor="departureTime">
                                        {t('rideRequest.departureTime')}
                                    </label>
                                    <input id="departureTime" name="departureTime" type="time" className={formStyles.input} required disabled={isPending} />
                                </div>
                            </div>
                            <div className={formStyles.fieldGroup}>
                                <label className={formStyles.label} htmlFor="notes">
                                    {t('rideRequest.notes')}
                                </label>
                                <textarea id="notes" name="notes" className={formStyles.textarea} placeholder={t('rideRequest.notesPlaceholder')} disabled={isPending} rows={3} />
                            </div>
                            {error && <p className={formStyles.feedbackError}>{error}</p>}
                            <div className={formStyles.formActions}>
                                <button type="submit" className={formStyles.submitButton} disabled={isPending}>
                                    {isPending ? t('rideRequest.submitting') : t('rideRequest.submit')}
                                    {!isPending && <ArrowRight size={16} />}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </AdminSidebar>
    );
}
