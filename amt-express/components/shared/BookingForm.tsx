'use client';

import { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';

import { createRideRequest } from '@/lib/actions/customerRideActions';
import styles from './BookingForm.module.css';

export function BookingForm() {
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

    if (submittedRideId) {
        return (
            <div className={styles.successCard}>
                <CheckCircle className={styles.successIcon} />
                <h2 className={styles.successTitle}>{t('rideRequest.successTitle')}</h2>
                <p className={styles.successDesc}>{t('rideRequest.successDesc')}</p>
                <div className={styles.successActions}>
                    <Link href="/rides" className={styles.primaryLink}>
                        {t('rideRequest.viewBookings')} <ArrowRight size={16} />
                    </Link>
                    <button
                        type="button"
                        className={styles.ghostLink}
                        onClick={() => { setSubmittedRideId(null); setError(null); }}
                    >
                        {t('rideRequest.newRequest')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={styles.card}>
            <div className={styles.twoCol}>
                <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="departure">
                        {t('rideRequest.departure')}
                    </label>
                    <input
                        id="departure"
                        name="departure"
                        type="text"
                        className={styles.input}
                        placeholder={t('rideRequest.departurePlaceholder')}
                        required
                        disabled={isPending}
                    />
                </div>
                <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="destination">
                        {t('rideRequest.destination')}
                    </label>
                    <input
                        id="destination"
                        name="destination"
                        type="text"
                        className={styles.input}
                        placeholder={t('rideRequest.destinationPlaceholder')}
                        required
                        disabled={isPending}
                    />
                </div>
            </div>

            <div className={styles.twoCol}>
                <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="departureDate">
                        {t('rideRequest.departureDate')}
                    </label>
                    <input
                        id="departureDate"
                        name="departureDate"
                        type="date"
                        className={styles.input}
                        required
                        disabled={isPending}
                    />
                </div>
                <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="departureTime">
                        {t('rideRequest.departureTime')}
                    </label>
                    <input
                        id="departureTime"
                        name="departureTime"
                        type="time"
                        className={styles.input}
                        required
                        disabled={isPending}
                    />
                </div>
            </div>

            <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="notes">
                    {t('rideRequest.notes')}
                </label>
                <textarea
                    id="notes"
                    name="notes"
                    className={styles.textarea}
                    placeholder={t('rideRequest.notesPlaceholder')}
                    disabled={isPending}
                    rows={3}
                />
            </div>

            {error && <p className={styles.feedbackError}>{error}</p>}

            <div className={styles.formActions}>
                <button type="submit" className={styles.submitButton} disabled={isPending}>
                    {isPending ? t('rideRequest.submitting') : t('rideRequest.submit')}
                    {!isPending && <ArrowRight size={16} />}
                </button>
            </div>
        </form>
    );
}
