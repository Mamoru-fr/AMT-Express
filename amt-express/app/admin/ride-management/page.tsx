import {RidesManagementBoard} from "@/components/admin/rideManagement/RidesManagementBoard";

export const metadata = {
    title: "Ride Management | AMT Express",
    description: "Manage all platform rides"
};

export default function RideManagementPage() {
    return (
        <RidesManagementBoard />
    );
}
