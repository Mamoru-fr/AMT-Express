import {RidesManagementBoard} from "@/components/admin/rideManagement/RidesManagementBoard";

export const metadata = {
    title: "Ride Management | AMT Express",
    description: "Manage all platform rides"
};

export default function RideManagementPage() {



    return (
        <div className="min-h-screen min-h-dvh w-full overflow-y-auto z-10">
            <RidesManagementBoard />
        </div>
    );
}
