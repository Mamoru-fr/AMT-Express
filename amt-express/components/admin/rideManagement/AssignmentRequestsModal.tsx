'use client'

import { useState, useEffect, useTransition } from "react";
import { X } from "lucide-react";
import { RideWithRelations } from "@/content/database_types/ride";
import type { AssignmentRequestWithDriver } from "@/lib/services/RidesManagementService";
import {
    fetchAssignmentRequestsForRide,
    approveAssignmentRequest,
    rejectAssignmentRequest,
} from "@/lib/actions/ridesManagementActions";
import styles from "./AssignmentRequestsModal.module.css";

type Props = {
    ride: RideWithRelations;
    onClose: () => void;
    onApproved: () => void;
};

export function AssignmentRequestsModal({ ride, onClose, onApproved }: Props) {
    const [requests, setRequests] = useState<AssignmentRequestWithDriver[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        fetchAssignmentRequestsForRide(ride.id).then((res) => {
            if (res.success) setRequests(res.data);
            setLoading(false);
        });
    }, [ride.id]);

    function handleApprove(requestId: string) {
        setActionId(requestId);
        startTransition(async () => {
            const res = await approveAssignmentRequest(requestId);
            if (res.success) {
                onApproved();
                onClose();
            } else {
                // Refresh list to reflect current state
                const updated = await fetchAssignmentRequestsForRide(ride.id);
                if (updated.success) setRequests(updated.data);
                setActionId(null);
            }
        });
    }

    function handleReject(requestId: string) {
        setActionId(requestId);
        startTransition(async () => {
            const res = await rejectAssignmentRequest(requestId);
            if (res.success) {
                const updated = await fetchAssignmentRequestsForRide(ride.id);
                if (updated.success) setRequests(updated.data);
            }
            setActionId(null);
        });
    }

    const busy = isPending && actionId !== null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContainer}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>Demandes d&apos;assignation</h3>
                    <button onClick={onClose} className={styles.closeButton} aria-label="Fermer">
                        <X className={styles.closeIcon} />
                    </button>
                </div>

                <div className={styles.rideInfo}>
                    <p className={styles.rideInfoLine}>
                        <span className={styles.rideInfoLabel}>De :</span> {ride.departure}
                    </p>
                    <p className={styles.rideInfoLine}>
                        <span className={styles.rideInfoLabel}>À :</span> {ride.destination}
                    </p>
                    <p className={styles.rideInfoLine}>
                        <span className={styles.rideInfoLabel}>Départ :</span>{" "}
                        {new Date(ride.departureTime).toLocaleString("fr-FR")}
                    </p>
                </div>

                <div className={styles.requestList}>
                    {loading ? (
                        <p className={styles.emptyState}>Chargement…</p>
                    ) : requests.length === 0 ? (
                        <p className={styles.emptyState}>Aucune demande pour ce trajet.</p>
                    ) : (
                        requests.map((req) => (
                            <div
                                key={req.requestId}
                                className={`${styles.requestCard} ${styles[req.status]}`}
                            >
                                <div className={styles.driverInfo}>
                                    <span className={styles.driverName}>{req.driverName ?? "—"}</span>
                                    <span className={styles.driverEmail}>{req.driverEmail ?? "—"}</span>
                                    <span className={styles.requestedAt}>
                                        {new Date(req.requestedAt).toLocaleString("fr-FR")}
                                    </span>
                                </div>

                                {req.status === "pending" ? (
                                    <div className={styles.cardActions}>
                                        <button
                                            className={styles.approveBtn}
                                            disabled={busy}
                                            onClick={() => handleApprove(req.requestId)}
                                        >
                                            {actionId === req.requestId && busy ? "…" : "Approuver"}
                                        </button>
                                        <button
                                            className={styles.rejectBtn}
                                            disabled={busy}
                                            onClick={() => handleReject(req.requestId)}
                                        >
                                            Refuser
                                        </button>
                                    </div>
                                ) : (
                                    <span className={`${styles.statusBadge} ${styles[req.status]}`}>
                                        {req.status === "approved" ? "Approuvé" : "Refusé"}
                                    </span>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.closeModalBtn} onClick={onClose}>
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}
