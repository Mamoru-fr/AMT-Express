import {RidesManagementBoard} from "@/components/admin/RidesManagementBoard";

export const metadata = {
    title: "Ride Management | AMT Express",
    description: "Manage all platform rides"
};

export default function RideManagementPage() {



    return (
        <div className="min-h-screen w-full overflow-y-auto md:fixed md:inset-0 z-10">
            <RidesManagementBoard />
        </div>
    );
}
