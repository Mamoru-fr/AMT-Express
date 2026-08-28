'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import {
    Car, MoveRight, User, Clock, FileText,
    CheckCircle, AlertCircle, X, Flag, Play,
} from 'lucide-react';

import { updateRideProgress, completeRide } from '@/lib/actions/driverRideActions';
import { Button } from '@/components/classicComponents/Button';
import type { RideWithRelations } from '@/content/database_types/ride';
import styles from './LivingRide.module.css';

interface Props {
    ride: RideWithRelations;
    onUpdate: () => Promise<void>;
}

type ActivePopup = 'waiting' | 'notes' | 'complete' | null;

// ─── Waiting time popup ───────────────────────────────────────────────────────

function WaitingPopup({ ride, onClose, onSave }: {
    ride: RideWithRelations;
    onClose: () => void;
    onSave: (minutes: number) => Promise<void>;
}) {
    const { t } = useTranslation();
    const [value, setValue] = useState(String(ride.waitingTime || 0));
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function handleSave() {
        const minutes = parseInt(value, 10);
        if (isNaN(minutes) || minutes < 0) {
            setError(t('livingRide.waitingError', 'Valeur invalide.'));
            return;
        }
        console.log('[WaitingPopup] handleSave — minutes:', minutes);
        startTransition(async () => {
            await onSave(minutes);
        });
    }

    return (
        <div className={styles.popupBackdrop}>
            <div className={styles.popupCard}>
                <h3 className={styles.popupTitle}>
                    <Clock style={{ display: 'inline', width: '1rem', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                    {t('rideDetail.waitingTime', 'Temps d\'attente')}
                </h3>
                <div>
                    <label className={styles.formLabel}>{t('livingRide.waitingMinutes', 'Durée (minutes)')}</label>
                    <input
                        type="number"
                        min={0}
                        max={600}
                        value={value}
                        onChange={e => { setValue(e.target.value); setError(null); }}
                        className={`${styles.formInput} ${error ? styles.formInputError : ''}`}
                        autoFocus
                    />
                    {error && (
                        <p className={styles.formError}>
                            <AlertCircle className={styles.formErrorIcon} /> {error}
                        </p>
                    )}
                </div>
                <div className={styles.formActions}>
                    <Button variant="secondary" onClick={onClose} disabled={isPending}>
                        {t('common.cancel', 'Annuler')}
                    </Button>
                    <Button
                        icon={<CheckCircle className={styles.btnIcon} />}
                        isPending={isPending}
                        pendingText={t('common.saving', 'Enregistrement...')}
                        onClick={handleSave}
                    >
                        {t('common.save', 'Enregistrer')}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ─── Notes popup ──────────────────────────────────────────────────────────────

function NotesPopup({ ride, onClose, onSave }: {
    ride: RideWithRelations;
    onClose: () => void;
    onSave: (notes: string) => Promise<void>;
}) {
    const { t } = useTranslation();
    const [value, setValue] = useState(ride.driverNotes ?? '');
    const [isPending, startTransition] = useTransition();

    function handleSave() {
        console.log('[NotesPopup] handleSave — notes length:', value.trim().length);
        startTransition(async () => {
            await onSave(value.trim());
        });
    }

    return (
        <div className={styles.popupBackdrop}>
            <div className={styles.popupCard}>
                <h3 className={styles.popupTitle}>
                    <FileText style={{ display: 'inline', width: '1rem', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                    {t('livingRide.notes', 'Notes & options imprévues')}
                </h3>
                <div>
                    <label className={styles.formLabel}>
                        {t('livingRide.notesPlaceholder', 'Ex: bagage supplémentaire, arrêt imprévu...')}
                    </label>
                    <textarea
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        rows={4}
                        className={`${styles.formInput} ${styles.formTextarea}`}
                        autoFocus
                    />
                </div>
                <div className={styles.formActions}>
                    <Button variant="secondary" onClick={onClose} disabled={isPending}>
                        {t('common.cancel', 'Annuler')}
                    </Button>
                    <Button
                        icon={<CheckCircle className={styles.btnIcon} />}
                        isPending={isPending}
                        pendingText={t('common.saving', 'Enregistrement...')}
                        onClick={handleSave}
                    >
                        {t('common.save', 'Enregistrer')}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ─── Complete ride popup (blocking) ───────────────────────────────────────────

// Blocking popup: ESC is trapped, click on backdrop does nothing
function CompletePopup({ rideId, onCancel, onSuccess }: {
    rideId: string;
    onCancel: () => void;
    onSuccess: () => void;
}) {
    const { t } = useTranslation();
    const [amount, setAmount] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    // Trap ESC — popup is intentionally blocking until amount is entered or cancelled
    useEffect(() => {
        const block = (e: KeyboardEvent) => { if (e.key === 'Escape') e.preventDefault(); };
        window.addEventListener('keydown', block, true);
        return () => window.removeEventListener('keydown', block, true);
    }, []);

    const isValid = /^\d+(\.\d{1,2})?$/.test(amount.trim()) && parseFloat(amount) > 0;

    function handleConfirm() {
        if (!isValid) {
            setError(t('livingRide.amountRequired', 'Saisissez un montant valide.'));
            return;
        }
        console.log('[CompletePopup] handleConfirm — rideId:', rideId, '| amount:', amount.trim());
        startTransition(async () => {
            const result = await completeRide(rideId, amount.trim());
            console.log('[CompletePopup] handleConfirm — result:', result);
            if (result.success) {
                onSuccess();
            } else {
                setError(result.error ?? t('livingRide.completeFailed', 'Échec de la finalisation.'));
            }
        });
    }

    return (
        // Backdrop click does nothing — intentional blocking behavior
        <div className={styles.popupBackdrop} role="dialog" aria-modal="true">
            <div className={styles.popupCard}>
                <h3 className={styles.popupTitle}>
                    <Flag style={{ display: 'inline', width: '1rem', marginRight: '0.5rem', verticalAlign: 'middle', color: '#fca5a5' }} />
                    {t('livingRide.completeTitle', 'Terminer le trajet')}
                </h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
                    {t('livingRide.completeDescription', 'Saisissez le montant affiché sur le compteur. Ce champ est obligatoire.')}
                </p>
                <div className={styles.amountWrapper}>
                    <input
                        ref={inputRef}
                        type="number"
                        min="0"
                        step="0.01"
                        value={amount}
                        onChange={e => { setAmount(e.target.value); setError(null); }}
                        placeholder="0.00"
                        className={`${styles.formInput} ${styles.amountInput} ${error ? styles.formInputError : ''}`}
                    />
                    <span className={styles.amountCurrency}>€</span>
                </div>
                {error && (
                    <p className={styles.formError}>
                        <AlertCircle className={styles.formErrorIcon} /> {error}
                    </p>
                )}
                <div className={styles.formActions}>
                    <Button variant="secondary" onClick={onCancel} disabled={isPending}>
                        {t('common.cancel', 'Annuler')}
                    </Button>
                    <Button
                        variant="danger"
                        icon={<Flag className={styles.btnIcon} />}
                        isPending={isPending}
                        pendingText={t('livingRide.completing', 'Finalisation...')}
                        disabled={!isValid}
                        onClick={handleConfirm}
                    >
                        {t('livingRide.confirmComplete', 'Confirmer et terminer')}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ─── LivingRide fullscreen ────────────────────────────────────────────────────

function LivingRideFullscreen({ ride, onClose, onUpdate }: {
    ride: RideWithRelations;
    onClose: () => void;
    onUpdate: () => Promise<void>;
}) {
    const { t } = useTranslation();
    const router = useRouter();
    const [popup, setPopup] = useState<ActivePopup>(null);
    const [localRide, setLocalRide] = useState(ride);

    async function handleSaveWaiting(minutes: number) {
        console.log('[LivingRideFullscreen] handleSaveWaiting — minutes:', minutes);
        await updateRideProgress(localRide.id, { waitingTime: minutes });
        setLocalRide(r => ({ ...r, waitingTime: minutes }));
        setPopup(null);
        await onUpdate();
        console.log('[LivingRideFullscreen] handleSaveWaiting — done');
    }

    async function handleSaveNotes(notes: string) {
        console.log('[LivingRideFullscreen] handleSaveNotes — notes length:', notes.length);
        await updateRideProgress(localRide.id, { driverNotes: notes });
        setLocalRide(r => ({ ...r, driverNotes: notes }));
        setPopup(null);
        await onUpdate();
        console.log('[LivingRideFullscreen] handleSaveNotes — done');
    }

    return (
        <div className={styles.fullscreen}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <span className={styles.headerLiveDot} />
                    <span className={styles.headerTitle}>{t('livingRide.title', 'Living Ride')}</span>
                    <span className={styles.headerRideId}>#{localRide.id.slice(0, 8)}</span>
                </div>
                <button className={styles.closeButton} onClick={onClose} title={t('livingRide.minimize', 'Réduire')}>
                    <X className={styles.closeButtonIcon} />
                </button>
            </div>

            {/* Main area */}
            <div className={styles.main}>
                <Car className={styles.carIcon} />

                <div className={styles.routeDisplay}>
                    <div className={`${styles.routePoint} ${styles.routePointFrom}`}>
                        <span className={styles.routePointLabel}>{t('rides.departure', 'Départ')}</span>
                        <span className={styles.routePointValue}>{localRide.departure}</span>
                    </div>
                    <MoveRight className={styles.routeArrowIcon} />
                    <div className={`${styles.routePoint} ${styles.routePointTo}`}>
                        <span className={styles.routePointLabel}>{t('rideDetail.destination', 'Arrivée')}</span>
                        <span className={styles.routePointValue}>{localRide.destination}</span>
                    </div>
                </div>

                {localRide.customers.length > 0 && (
                    <div className={styles.passengersList}>
                        {localRide.customers.map(c => (
                            <span key={c.id} className={styles.passengerChip}>
                                <User className={styles.passengerChipIcon} />
                                {c.name}
                            </span>
                        ))}
                    </div>
                )}

                <div className={styles.dataChips}>
                    <span className={styles.dataChip}>
                        <Clock className={styles.dataChipIcon} />
                        {t('rideDetail.waitingTime', 'Attente')} :&nbsp;
                        <span className={styles.dataChipValue}>{localRide.waitingTime ?? 0} min</span>
                    </span>
                    {localRide.driverNotes && (
                        <span className={styles.dataChip}>
                            <FileText className={styles.dataChipIcon} />
                            <span className={styles.dataChipValue}>{localRide.driverNotes}</span>
                        </span>
                    )}
                </div>

                <span className={styles.gpsComingSoon}>
                    {t('livingRide.gpsComingSoon', 'Navigation GPS — bientôt disponible')}
                </span>
            </div>

            {/* Action bar */}
            <div className={styles.actionBar}>
                <button className={styles.actionBtn} onClick={() => { console.log('[ActionBar] Attente clicked'); setPopup('waiting'); }}>
                    <Clock className={styles.actionBtnIcon} />
                    {t('rideDetail.waitingTime', 'Attente')}
                </button>
                <button className={styles.actionBtn} onClick={() => { console.log('[ActionBar] Notes clicked'); setPopup('notes'); }}>
                    <FileText className={styles.actionBtnIcon} />
                    {t('livingRide.notes', 'Notes')}
                </button>
                <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={() => { console.log('[ActionBar] Terminer clicked'); setPopup('complete'); }}>
                    <Flag className={styles.actionBtnIcon} />
                    {t('livingRide.completeRide', 'Terminer')}
                </button>
            </div>

            {/* Popups rendered inside fullscreen */}
            {popup === 'waiting' && (
                <WaitingPopup ride={localRide} onClose={() => setPopup(null)} onSave={handleSaveWaiting} />
            )}
            {popup === 'notes' && (
                <NotesPopup ride={localRide} onClose={() => setPopup(null)} onSave={handleSaveNotes} />
            )}
            {popup === 'complete' && (
                <CompletePopup
                    rideId={localRide.id}
                    onCancel={() => setPopup(null)}
                    onSuccess={() => router.push('/driver-rides')}
                />
            )}
        </div>
    );
}

// ─── Public export ────────────────────────────────────────────────────────────

export function LivingRide({ ride, onUpdate }: Props) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button
                icon={<Play className={styles.startButtonIcon} />}
                className={styles.startButton}
                onClick={() => { console.log('[LivingRide] Start button clicked'); setIsOpen(true); }}
            >
                {t('livingRide.start', 'Démarrer le Living Ride')}
            </Button>

            {isOpen && (
                <LivingRideFullscreen
                    ride={ride}
                    onClose={() => setIsOpen(false)}
                    onUpdate={onUpdate}
                />
            )}
        </>
    );
}
