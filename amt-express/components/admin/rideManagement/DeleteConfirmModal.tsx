'use client'

import {X} from "lucide-react";
import styles from "./DeleteConfirmModal.module.css";

/**
 * Props for the DeleteConfirmModal component
 * @property {number} rideId - The ID of the ride to be deleted
 * @property {Function} onClose - Callback function to close the modal without deleting
 * @property {Function} onConfirm - Callback function to confirm and execute the deletion
 */
type DeleteConfirmModalProps = {
    rideId: number;
    onClose: () => void;
    onConfirm: (rideId: number) => void;
};

/**
 * DeleteConfirmModal Component
 * Confirmation dialog to prevent accidental ride deletion
 * Displays warning message and requires explicit user confirmation
 */
export function DeleteConfirmModal({rideId, onClose, onConfirm}: DeleteConfirmModalProps) {
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContainer}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>Confirm Deletion</h3>
                    <button onClick={onClose} className={styles.closeButton}>
                        <X className={styles.closeIcon}/>
                    </button>
                </div>

                <p className={styles.confirmationMessage}>
                    Are you sure you want to delete ride <strong>#{rideId}</strong>? This action cannot be undone.
                </p>

                <div className={styles.modalFooter}>
                    <button
                        onClick={onClose}
                        className={styles.cancelButton}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(rideId)}
                        className={styles.deleteButton}
                    >
                        Delete Ride
                    </button>
                </div>
            </div>
        </div>
    );
}
