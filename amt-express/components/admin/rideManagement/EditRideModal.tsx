'use client'

import {useState} from "react";
import {RideStatus, RideWithRelations} from "@/content/database_types/ride";
import {X} from "lucide-react";

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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Edit Ride #{ride.id}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6"/>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Departure</label>
                        <input
                            type="text"
                            value={formData.departure}
                            onChange={(e) => setFormData({...formData, departure: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                        <input
                            type="text"
                            value={formData.destination}
                            onChange={(e) => setFormData({...formData, destination: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Departure Time</label>
                        <input
                            type="datetime-local"
                            value={formData.departureTime}
                            onChange={(e) => setFormData({...formData, departureTime: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (€)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({...formData, price: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({...formData, status: e.target.value as RideStatus})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="pending">Pending</option>
                            <option value="assigned">Assigned</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer Notes</label>
                        <textarea
                            value={formData.customerNotes}
                            onChange={(e) => setFormData({...formData, customerNotes: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                        />
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
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
