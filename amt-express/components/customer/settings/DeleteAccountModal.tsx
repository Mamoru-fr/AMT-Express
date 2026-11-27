'use client';

/**
 * DeleteAccountModal — confirmation RGPD de suppression de compte.
 * Pattern hérité de DeleteConfirmModal (role="dialog" + aria-modal + aria-labelledby, RGAA).
 */
import { X, UserX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/classicComponents/Button';
import styles from './DeleteAccountModal.module.css';

type DeleteAccountModalProps = {
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
};

export function DeleteAccountModal({ onClose, onConfirm, isDeleting }: DeleteAccountModalProps) {
    const { t } = useTranslation();

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContainer} role="dialog" aria-modal="true" aria-labelledby="delete-account-title">
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle} id="delete-account-title">
                        {t('account.delete.title')}
                    </h3>
                    <button onClick={onClose} className={styles.closeButton} aria-label={t('common.close') ?? t('account.delete.cancel')} disabled={isDeleting}>
                        <X className={styles.closeIcon} />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.warningIconBlock}>
                        <UserX className={styles.warningIcon} aria-hidden="true" />
                    </div>
                    <p className={styles.confirmationMessage}>
                        {t('account.delete.message')}
                    </p>
                </div>

                <div className={styles.modalFooter}>
                    <Button variant="secondary" onClick={onClose} disabled={isDeleting}>
                        {t('account.delete.cancel')}
                    </Button>
                    <Button variant="danger" onClick={onConfirm} disabled={isDeleting} isPending={isDeleting} pendingText={t('profile.sending') ?? '…'}>
                        {t('account.delete.confirm')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
