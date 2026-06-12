import {RidesManagementBoard} from "@/components/admin/rideManagement/RidesManagementBoard";

export const metadata = {
    title: "Ride Management | AMT Express",
    description: "Manage all platform rides"
};

export default function RideManagementPage() {
    return (
        <div className="min-h-[100dvh] bg-gray-50 flex flex-col">
            <div className="max-w-7xl mx-auto w-full flex flex-1 flex-col">
                <RidesManagementBoard />
            </div>
        </div>
    );
}
