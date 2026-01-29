/**
 * Dashboard KPI Card Component
 * Displays a single key performance indicator with an icon
 * Used for metrics like total rides, active users, pending invoices, etc.
 */

import {Card, CardContent} from "../classicCard/Card";
import {LucideIcon} from "lucide-react";

type Props = {
    title: string;          // Label displayed above the metric (e.g., "Total Rides")
    data: string | number;  // The metric value to display
    icon: LucideIcon;       // Lucide icon component to display
    iconColor?: string;     // Tailwind background color class (e.g., "bg-blue-500")
};

export function DashboardDataCard({title, data, icon: Icon, iconColor}: Props) {
    return (
        <Card className="flex-1 flex bg-white w-full shadow-md border-2 border-blue-200">
            <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{title}</p>
                        <p className="text-lg sm:text-xl md:text-2xl font-bold truncate">{data}</p>
                    </div>
                    <div className={`${iconColor} p-2 sm:p-2.5 md:p-3 rounded-lg shrink-0`}>
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}