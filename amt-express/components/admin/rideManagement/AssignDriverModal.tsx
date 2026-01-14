'use client'

import {useState} from "react";
import {RideWithRelations} from "@/content/database_types/ride";
import {X} from "lucide-react";

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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Assign Driver to Ride #{ride.id}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6"/>
                    </button>
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600"><strong>From:</strong> {ride.departure}</p>
                    <p className="text-sm text-gray-600"><strong>To:</strong> {ride.destination}</p>
                    <p className="text-sm text-gray-600">
                        <strong>Time:</strong> {new Date(ride.departureTime).toLocaleString('fr-FR')}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Driver</label>
                        <select
                            value={selectedDriver}
                            onChange={(e) => setSelectedDriver(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                    <div className="flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Assign Driver
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
