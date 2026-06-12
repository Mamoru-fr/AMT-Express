'use client'

import {useState} from "react";
import {RideStatus, RideWithRelations} from "@/content/database_types/ride";
import {X} from "lucide-react";
import styles from "./EditRideModal.module.css";

/**
 * Props for the EditRideModal component
 * @property {RideWithRelations} ride - The ride object to edit, includes all ride details and relations
 * @property {Function} onClose - Callback function to close the modal
 * @property {Function} onSave - Callback function to save the updated ride details
 */
type EditRideModalProps = {
    ride: RideWithRelations;
    onClose: () => void;
    onSave: (ride: RideWithRelations, updates: any) => void;
};

/**
 * EditRideModal Component
 * Modal form for editing existing ride details
 * Pre-populates form with current ride data and allows modifications to all editable fields
 */
export function EditRideModal({ride, onClose, onSave}: EditRideModalProps) {
    // Initialize form data with existing ride details
    // departureTime is converted to datetime-local format (YYYY-MM-DDTHH:mm)
    const [formData, setFormData] = useState({
        departure: ride.departure,
        destination: ride.destination,
        departureTime: new Date(ride.departureTime).toISOString().slice(0, 16),
        price: ride.price,
        status: ride.status,
        customerNotes: ride.customerNotes || ''
    });

    /**
     * Handles form submission for ride updates
     * Prevents default form behavior and transforms departureTime back to Date object
     * Passes original ride object and updates to parent component
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(ride, {
            ...formData,
            departureTime: new Date(formData.departureTime)
        });
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContainer}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>Edit Ride #{ride.id}</h3>
                    <button onClick={onClose} className={styles.closeButton}>
                        <X className={styles.closeIcon}/>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            Departure <span className={styles.formLabelRequired}>
                        </span></label>
                        <input
                            type="text"
                            value={formData.departure}
                            onChange={(e) => setFormData({...formData, departure: e.target.value})}
                            className={styles.formInput}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            Destination <span className={styles.formLabelRequired}>
                        </span></label>
                        <input
                            type="text"
                            value={formData.destination}
                            onChange={(e) => setFormData({...formData, destination: e.target.value})}
                            className={styles.formInput}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            Departure Time <span className={styles.formLabelRequired}>
                        </span></label>
                        <input
                            type="datetime-local"
                            value={formData.departureTime}
                            onChange={(e) => setFormData({...formData, departureTime: e.target.value})}
                            className={styles.formInput}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            Price (€) <span className={styles.formLabelRequired}>
                        </span></label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({...formData, price: e.target.value})}
                            className={styles.formInput}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({...formData, status: e.target.value as RideStatus})}
                            className={styles.formSelect}
                        >
                            <option value="pending">Pending</option>
                            <option value="assigned">Assigned</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Customer Notes</label>
                        <textarea
                            value={formData.customerNotes}
                            onChange={(e) => setFormData({...formData, customerNotes: e.target.value})}
                            className={styles.formTextarea}
                            rows={3}
                        />
                    </div>

                    <div className={styles.modalFooter}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={styles.cancelButton}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={styles.saveButton}
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
