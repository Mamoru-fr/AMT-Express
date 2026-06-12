'use client'

import {useState} from "react";
import {RideWithRelations} from "@/content/database_types/ride";
import {X} from "lucide-react";
import styles from "./AssignDriverModal.module.css";

/**
 * Props for the AssignDriverModal component
 * @property {RideWithRelations} ride - The ride to assign a driver to
 * @property {Array} drivers - List of available drivers for selection
 * @property {Function} onClose - Callback function to close the modal
 * @property {Function} onAssign - Callback function to assign the selected driver to the ride
 */
type AssignDriverModalProps = {
    ride: RideWithRelations;
    drivers: Array<{ id: string; name: string; email: string }>;
    onClose: () => void;
    onAssign: (rideId: number, driverId: string) => void;
};

/**
 * AssignDriverModal Component
 * Modal for assigning an available driver to an unassigned ride
 * Displays ride details and allows selection from available drivers list
 */
export function AssignDriverModal({ride, drivers, onClose, onAssign}: AssignDriverModalProps) {
    // Track the selected driver ID from dropdown
    const [selectedDriver, setSelectedDriver] = useState('');

    /**
     * Handles driver assignment submission
     * Validates that a driver is selected before calling the onAssign callback
     * @param {React.FormEvent} e - Form submission event
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Only proceed if a driver has been selected from the dropdown
        if (selectedDriver) {
            onAssign(ride.id, selectedDriver);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContainer}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>Assign Driver to Ride #{ride.id}</h3>
                    <button onClick={onClose} className={styles.closeButton}>
                        <X className={styles.closeIcon}/>
                    </button>
                </div>

                <div className={styles.rideInfo}>
                    <p className={styles.rideInfoLine}>
                        <span className={styles.rideInfoLabel}>From:</span> {ride.departure}
                    </p>
                    <p className={styles.rideInfoLine}>
                        <span className={styles.rideInfoLabel}>To:</span> {ride.destination}
                    </p>
                    <p className={styles.rideInfoLine}>
                        <span className={styles.rideInfoLabel}>Time:</span> {new Date(ride.departureTime).toLocaleString('fr-FR')}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Select Driver</label>
                        <select
                            value={selectedDriver}
                            onChange={(e) => setSelectedDriver(e.target.value)}
                            className={styles.formSelect}
                            required
                        >
                            <option value="">-- Choose a driver --</option>
                            {drivers.map(driver => (
                                <option key={driver.id} value={driver.id}>
                                    {driver.name} ({driver.email})
                                </option>
                            ))}
                        </select>
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
                            className={styles.assignButton}
                            disabled={!selectedDriver}
                        >
                            Assign Driver
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
