'use client'

import {useState} from "react";
import {
    DriverDashboardData,
    toggleDriverAvailability,
    requestRideAssignment
} from "@/lib/actions/driverDashboardActions";
import {
    Car,
    DollarSign,
    Star,
    Calendar,
    MapPin,
    Clock,
    Users,
    CheckCircle,
    X
} from "lucide-react";
import {DashboardDataCard} from "@/components/specificCards/DashboardDataCard";
import {useTranslation} from "react-i18next";

type Props = {
    data: DriverDashboardData;
    onRefresh?: () => void;
};

export function DriverDashboard({data, onRefresh}: Props) {
    const {t} = useTranslation();
    const [isAvailable, setIsAvailable] = useState(data.isAvailable);
    const [requestModal, setRequestModal] = useState<{ open: boolean; rideId: number | null }>({
        open: false,
        rideId: null
    });
    const [requestMessage, setRequestMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAvailabilityToggle = async () => {
        setLoading(true);
        try {
            const newStatus = !isAvailable;
            await toggleDriverAvailability(newStatus);
            setIsAvailable(newStatus);
            onRefresh?.();
        } catch (error) {
            console.error('Failed to toggle availability:', error);
            alert('Failed to update availability');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestRide = async (rideId: number) => {
        setLoading(true);
        try {
            await requestRideAssignment(rideId, requestMessage);
            setRequestModal({open: false, rideId: null});
            setRequestMessage('');
            onRefresh?.();
            alert('Ride requested successfully!');
        } catch (error) {
            console.error('Failed to request ride:', error);
            alert('Failed to request ride');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'assigned':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="w-full py-8 px-4 md:px-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                            {t('driverDashboard.title', 'Driver Dashboard')}
                        </h1>
                        <p className="text-white/90 mt-2 drop-shadow-md">
                            {t('driverDashboard.subtitle', 'Manage your rides and availability')}
                        </p>
                    </div>

                    {/* Availability Toggle */}
                    <div className="flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4">
                        <span className="text-sm font-medium text-gray-700">
                            {isAvailable ? t('driverDashboard.available', 'Available') : t('driverDashboard.offline', 'Offline')}
                        </span>
                        <button
                            onClick={handleAvailabilityToggle}
                            disabled={loading}
                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                                isAvailable ? 'bg-green-500' : 'bg-gray-300'
                            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span
                                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                                    isAvailable ? 'translate-x-4' : '-translate-x-4'
                                }`}
                            />
                        </button>
                    </div>
                </div>

                {/* KPIs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <DashboardDataCard
                        title={t('driverDashboard.totalRides', 'Total Rides')}
                        data={data.stats.totalRides}
                        icon={Car}
                        iconColor="bg-blue-500"
                    />
                    <DashboardDataCard
                        title={t('driverDashboard.completedRides', 'Completed')}
                        data={data.stats.completedRides}
                        icon={CheckCircle}
                        iconColor="bg-green-500"
                    />
                    <DashboardDataCard
                        title={t('driverDashboard.earnings', 'Earnings')}
                        data={`€${data.stats.earnings}`}
                        icon={DollarSign}
                        iconColor="bg-purple-500"
                    />
                    <DashboardDataCard
                        title={t('driverDashboard.rating', 'Rating')}
                        data={`${data.stats.averageRating.toFixed(1)} ⭐`}
                        icon={Star}
                        iconColor="bg-yellow-500"
                    />
                </div>

                {/* Assigned Rides */}
                <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-blue-600"/>
                        {t('driverDashboard.assignedRides', 'Your Assigned Rides')}
                    </h2>

                    {data.assignedRides.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                            {t('driverDashboard.noAssignedRides', 'No assigned rides at the moment')}
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {data.assignedRides.map(ride => (
                                <div
                                    key={ride.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <span className="text-sm text-gray-500">
                                                Ride #{ride.id}
                                            </span>
                                            <span
                                                className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ride.status)}`}>
                                                {ride.status}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-gray-900">€{ride.price}</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="flex items-start gap-2">
                                            <Clock className="w-5 h-5 text-gray-400 mt-0.5 shrink-0"/>
                                            <div>
                                                <div className="text-sm font-medium text-gray-700">
                                                    {new Date(ride.departureTime).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {new Date(ride.departureTime).toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2">
                                            <Users className="w-5 h-5 text-gray-400 mt-0.5 shrink-0"/>
                                            <div>
                                                <div className="text-sm font-medium text-gray-700">Clients</div>
                                                <div className="text-sm text-gray-600">
                                                    {ride.customers.map(c => c.name).join(', ')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="w-4 h-4 text-green-600 shrink-0"/>
                                            <span className="font-medium text-gray-700">From:</span>
                                            <span className="text-gray-600">{ride.departure}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm mt-1">
                                            <MapPin className="w-4 h-4 text-red-600 shrink-0"/>
                                            <span className="font-medium text-gray-700">To:</span>
                                            <span className="text-gray-600">{ride.destination}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Suggested Rides */}
                <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Car className="w-6 h-6 text-green-600"/>
                        {t('driverDashboard.suggestedRides', 'Available Rides')}
                    </h2>

                    {data.suggestedRides.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                            {t('driverDashboard.noSuggestedRides', 'No rides available at the moment')}
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {data.suggestedRides.map(ride => (
                                <div
                                    key={ride.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-xs text-gray-500">Ride #{ride.id}</span>
                                        <div className="text-xl font-bold text-green-600">€{ride.price}</div>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Clock className="w-4 h-4 text-gray-400"/>
                                            <span className="text-gray-700">
                                                {new Date(ride.departureTime).toLocaleString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>

                                        <div className="flex items-start gap-2 text-sm">
                                            <MapPin className="w-4 h-4 text-green-600 mt-0.5 shrink-0"/>
                                            <span className="text-gray-700 line-clamp-1">{ride.departure}</span>
                                        </div>

                                        <div className="flex items-start gap-2 text-sm">
                                            <MapPin className="w-4 h-4 text-red-600 mt-0.5 shrink-0"/>
                                            <span className="text-gray-700 line-clamp-1">{ride.destination}</span>
                                        </div>

                                        {ride.customers.length > 0 && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Users className="w-4 h-4 text-gray-400"/>
                                                <span className="text-gray-600 text-xs">
                                                    {ride.customers.map(c => c.name).join(', ')}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => setRequestModal({open: true, rideId: ride.id})}
                                        disabled={loading}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {t('driverDashboard.requestRide', 'Request This Ride')}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Request Modal */}
                {requestModal.open && requestModal.rideId && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-gray-900">
                                    {t('driverDashboard.requestRideTitle', 'Request Ride Assignment')}
                                </h3>
                                <button
                                    onClick={() => setRequestModal({open: false, rideId: null})}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-6 h-6"/>
                                </button>
                            </div>

                            <p className="text-gray-700 mb-4">
                                {t('driverDashboard.requestMessage', 'Add an optional message for the admin:')}
                            </p>

                            <textarea
                                value={requestMessage}
                                onChange={(e) => setRequestMessage(e.target.value)}
                                placeholder={t('driverDashboard.messagePlaceholder', 'I am available and ready for this ride...')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                                rows={4}
                            />

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setRequestModal({open: false, rideId: null})}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    {t('common.cancel', 'Cancel')}
                                </button>
                                <button
                                    onClick={() => handleRequestRide(requestModal.rideId!)}
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {t('driverDashboard.confirmRequest', 'Send Request')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
