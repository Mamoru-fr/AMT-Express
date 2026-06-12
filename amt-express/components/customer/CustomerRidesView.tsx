'use client'

/**
 * CustomerRidesView Component
 * 
 * Displays rides for customer users with 2 different views:
 * 1. Completed Rides - Rides the customer has completed
 * 2. Pending Rides - Rides the customer has requested that are not yet completed
 */

import {useState, useEffect} from "react";
import {useTranslation} from "react-i18next";
import {RideWithRelations} from "@/content/database_types/ride";
import {
    fetchCustomerCompletedRides,
    fetchCustomerRequestedRides
} from "@/lib/actions/ridesViewActions";
import {Calendar, MapPin, User, DollarSign, CheckCircle, Clock} from "lucide-react";

type CustomerView = "completed" | "pending";

export default function CustomerRidesView() {
    const {t} = useTranslation();
    const [activeView, setActiveView] = useState<CustomerView>("pending");
    const [completedRides, setCompletedRides] = useState<RideWithRelations[]>([]);
    const [pendingRides, setPendingRides] = useState<RideWithRelations[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadRides();
    }, [activeView]);

    async function loadRides() {
        setLoading(true);
        setError(null);

        try {
            if (activeView === "completed") {
                const result = await fetchCustomerCompletedRides();
                if (result.success) {
                    setCompletedRides(result.data);
                } else {
                    setError(result.error || "Failed to load completed rides");
                }
            } else {
                const result = await fetchCustomerRequestedRides();
                if (result.success) {
                    setPendingRides(result.data);
                } else {
                    setError(result.error || "Failed to load pending rides");
                }
            }
        } catch (err) {
            setError("An unexpected error occurred");
            console.error("Error loading rides:", err);
        } finally {
            setLoading(false);
        }
    }

    function getCurrentRides(): RideWithRelations[] {
        return activeView === "completed" ? completedRides : pendingRides;
    }

    function formatDate(date: Date | string | null) {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function getStatusBadge(status: string) {
        const statusStyles: Record<string, string> = {
            pending: "bg-yellow-100 text-yellow-800",
            assigned: "bg-blue-100 text-blue-800",
            completed: "bg-green-100 text-green-800",
            cancelled: "bg-red-100 text-red-800"
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || "bg-gray-100 text-gray-800"}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    }

    const rides = getCurrentRides();

    return (
        <div className="min-h-[100dvh] bg-gray-50 flex flex-col p-6">
            <div className="max-w-7xl mx-auto w-full flex flex-1 flex-col">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Rides</h1>
                    <p className="text-gray-600 mt-2">View your ride history and track pending rides</p>
                </div>

                {/* Tabs */}
                <div className="bg-white shadow rounded-lg mb-6">
                    <div className="flex border-b">
                        <button
                            onClick={() => setActiveView("pending")}
                            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                                activeView === "pending"
                                    ? "text-blue-600 border-b-2 border-blue-600"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            Pending Rides
                            {pendingRides.length > 0 && (
                                <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-600 rounded-full text-xs">
                                    {pendingRides.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveView("completed")}
                            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                                activeView === "completed"
                                    ? "text-blue-600 border-b-2 border-blue-600"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            Completed Rides
                            {completedRides.length > 0 && (
                                <span className="ml-2 px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs">
                                    {completedRides.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white shadow rounded-lg">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-500 mt-4">Loading rides...</p>
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center">
                            <p className="text-red-600">{error}</p>
                            <button
                                onClick={loadRides}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    ) : rides.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-gray-500">
                                {activeView === "pending" 
                                    ? "You have no pending rides" 
                                    : "You have no completed rides yet"}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ride ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Route
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Departure Time
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Driver
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {rides.map((ride) => (
                                        <tr key={ride.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                #{ride.id}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col space-y-1">
                                                    <div className="flex items-center text-sm text-gray-900">
                                                        <MapPin className="h-4 w-4 mr-2 text-green-500" />
                                                        {ride.departure}
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <MapPin className="h-4 w-4 mr-2 text-red-500" />
                                                        {ride.destination}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-900">
                                                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                                    {formatDate(ride.departureTime)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {ride.driver ? (
                                                    <div className="flex items-center text-sm text-gray-900">
                                                        <User className="h-4 w-4 mr-2 text-gray-400" />
                                                        {ride.driver.name}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-500">Not assigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm font-medium text-gray-900">
                                                    <DollarSign className="h-4 w-4 mr-1 text-green-500" />
                                                    {ride.price ? `${parseFloat(ride.price).toFixed(2)}` : "-"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(ride.status)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Summary Stats */}
                {!loading && !error && (
                    <div className="mt-6 flex flex-wrap gap-4">
                        <div className="bg-white shadow rounded-lg p-6 w-full md:w-[calc(50%-1rem)] min-w-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Pending Rides</p>
                                    <p className="text-2xl font-bold text-yellow-600">{pendingRides.length}</p>
                                </div>
                                <Clock className="h-10 w-10 text-yellow-600 opacity-20" />
                            </div>
                        </div>
                        <div className="bg-white shadow rounded-lg p-6 w-full md:w-[calc(50%-1rem)] min-w-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Completed Rides</p>
                                    <p className="text-2xl font-bold text-green-600">{completedRides.length}</p>
                                </div>
                                <CheckCircle className="h-10 w-10 text-green-600 opacity-20" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
