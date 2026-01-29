'use client'

/**
 * Recent Rides Table Component
 * Displays the 10 most recent rides with key details
 * Responsive design with different layouts for mobile and desktop
 */

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
    rides: Ride[];  // Array of recent rides to display
};

// Tailwind classes for status badge styling
// Different color schemes for each ride status
const statusStyles = {
    completed: 'bg-green-100 text-green-800',
    assigned: 'bg-blue-100 text-blue-800',
    pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800'
};

export function RecentRidesTable({rides}: Props) {
    return (
        <div className="bg-white rounded-lg shadow-md border-2 border-blue-200 overflow-hidden">
            <div className="pt-3 sm:pt-4 md:pt-6 px-3 sm:px-4 md:px-6">
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Recent Rides</h3>
            </div>
            <div className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6 space-y-2 sm:space-y-3 max-h-81 overflow-y-auto">
                {/* Show empty state if no rides available */}
                {rides.length === 0 ? (
                    <div className="px-3 sm:px-6 py-6 sm:py-8 text-center text-gray-500 text-sm">
                        No rides found
                    </div>
                ) : (
                    /* Render each ride as a card-style row */
                    rides.map((ride) => (
                        <div key={ride.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 md:p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-2 sm:gap-3">
                            <div className="flex-1 space-y-1 sm:space-y-2 min-w-0">
                                <div className="flex items-start sm:items-center gap-2 flex-wrap">
                                    <span className="text-xs font-medium text-gray-500 shrink-0">#{ride.id}</span>
                                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
                                        <p className="font-medium text-xs sm:text-sm md:text-base truncate">{ride.departure}</p>
                                        <span className="text-gray-400 text-xs sm:text-sm">→</span>
                                        <p className="font-medium text-xs sm:text-sm md:text-base truncate">{ride.destination}</p>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500">
                                    <div className="flex flex-col sm:flex-row sm:gap-2">
                                        <span className="truncate">Client: {ride.customerName || 'N/A'}</span>
                                        {ride.driverName && <span className="hidden sm:inline">•</span>}
                                        {ride.driverName && <span className="truncate">Driver: {ride.driverName}</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                                <span className="text-xs text-gray-500">
                                    {new Date(ride.departureTime).toLocaleDateString()}
                                </span>
                                <span className="font-semibold text-xs sm:text-sm">€{ride.price}</span>
                                <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 inline-flex text-xs leading-5 font-semibold rounded-full whitespace-nowrap ${statusStyles[ride.status]}`}>
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
