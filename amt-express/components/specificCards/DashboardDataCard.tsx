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
        <Card className="flex-1 flex bg-white min-w-50 w-full shadow-md max-h-28 border-2 border-blue-200">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">{title}</p>
                        <p className="text-2xl font-bold">{data}</p>
                    </div>
                    <div className={`${iconColor} p-3 rounded-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}