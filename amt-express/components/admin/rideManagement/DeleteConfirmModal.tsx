'use client'

import {X} from "lucide-react";
import {useTranslation} from "react-i18next";
import styles from "./DeleteConfirmModal.module.css";

/**
 * Props for the DeleteConfirmModal component
 * @property {string} rideId - The ID of the ride to be deleted
 * @property {Function} onClose - Callback function to close the modal without deleting
 * @property {Function} onConfirm - Callback function to confirm and execute the deletion
 */
type DeleteConfirmModalProps = {
    rideId: string;
    onClose: () => void;
    onConfirm: (rideId: string) => void;
};

/**
 * DeleteConfirmModal Component
 * Confirmation dialog to prevent accidental ride deletion
 * Displays warning message and requires explicit user confirmation
 */
export function DeleteConfirmModal({rideId, onClose, onConfirm}: DeleteConfirmModalProps) {
    const {t} = useTranslation();
    
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContainer}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>{t('rideModals.deleteConfirm.title')}</h3>
                    <button onClick={onClose} className={styles.closeButton} aria-label={t('common.close')}>
                        <X className={styles.closeIcon}/>
                    </button>
                </div>

                <p className={styles.confirmationMessage}>
                    {t('rideModals.deleteConfirm.message', {rideId: rideId})}
                </p>

                <div className={styles.modalFooter}>
                    <button
                        onClick={onClose}
                        className={styles.cancelButton}
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        onClick={() => onConfirm(rideId)}
                        className={styles.deleteButton}
                    >
                        {t('rideModals.deleteConfirm.deleteButton')}
                    </button>
                </div>
            </div>
        </div>
    );
}
