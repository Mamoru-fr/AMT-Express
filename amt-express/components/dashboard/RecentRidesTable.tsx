'use client'

type Ride = {
    id: number;
    departure: string;
    destination: string;
    customerName: string | null;
    driverName: string | null;
    price: string;
    status: 'pending' | 'assigned' | 'completed' | 'cancelled';
    departureTime: Date;
};

type Props = {
    rides: Ride[];
};

const statusStyles = {
    completed: 'bg-green-100 text-green-800',
    assigned: 'bg-blue-100 text-blue-800',
    pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800'
};

export function RecentRidesTable({rides}: Props) {
    return (
        <div className="bg-white rounded-lg shadow-md border-2 border-blue-200 overflow-hidden">
            <div className="pt-6 px-6">
                <h3 className="text-lg font-semibold mb-4">Recent Rides</h3>
            </div>
            <div className="px-6 pb-6 space-y-3 max-h-81 overflow-y-auto">
                {rides.length === 0 ? (
                    <div className="px-6 py-8 text-center text-gray-500">
                        No rides found
                    </div>
                ) : (
                    rides.map((ride) => (
                        <div key={ride.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-3">
                            <div className="flex-1 space-y-2">
                                <div className="flex items-start sm:items-center gap-2 flex-wrap">
                                    <span className="text-xs font-medium text-gray-500 shrink-0">#{ride.id}</span>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-medium text-sm sm:text-base">{ride.departure}</p>
                                        <span className="text-gray-400">→</span>
                                        <p className="font-medium text-sm sm:text-base">{ride.destination}</p>
                                    </div>
                                </div>
                                <div className="text-xs sm:text-sm text-gray-500">
                                    <div className="flex flex-col sm:flex-row sm:gap-2">
                                        <span>Client: {ride.customerName || 'N/A'}</span>
                                        {ride.driverName && <span className="hidden sm:inline">•</span>}
                                        {ride.driverName && <span>Driver: {ride.driverName}</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
                                <span className="text-xs sm:text-sm text-gray-500">
                                    {new Date(ride.departureTime).toLocaleDateString()}
                                </span>
                                <span className="font-semibold text-sm sm:text-base">€{ride.price}</span>
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full whitespace-nowrap ${statusStyles[ride.status]}`}>
                                    {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
