'use client'

import {X} from "lucide-react";

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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Confirm Deletion</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6"/>
                    </button>
                </div>

                <p className="text-gray-700 mb-6">
                    Are you sure you want to delete ride <strong>#{rideId}</strong>? This action cannot be undone.
                </p>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(rideId)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Delete Ride
                    </button>
                </div>
            </div>
        </div>
    );
}
