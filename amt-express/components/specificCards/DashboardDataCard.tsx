/**
 * Dashboard KPI Card Component
 * Displays a single key performance indicator with an icon
 * Used for metrics like total rides, active users, pending invoices, etc.
 */

import {LucideIcon} from "lucide-react";
import styles from "./DashboardDataCard.module.css";

type Props = {
    title: string;          // Label displayed above the metric (e.g., "Total Rides")
    data: string | number;  // The metric value to display
    icon: LucideIcon;       // Lucide icon component to display
    iconColor?: "blue" | "green" | "yellow" | "purple";
};

export function DashboardDataCard({title, data, icon: Icon, iconColor}: Props) {
    const iconVariant = {
        blue: styles.iconBlue,
        green: styles.iconGreen,
        yellow: styles.iconYellow,
        purple: styles.iconPurple,
    }[iconColor || "blue"];

    return (
        <article className={styles.card}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <div className={styles.copy}>
                        <p className={styles.title}>{title}</p>
                        <p className={styles.data}>{data}</p>
                    </div>
                    <div className={`${styles.iconBox} ${iconVariant}`}>
                        <Icon className={styles.icon} />
                    </div>
                </div>
            </div>
        </article>
    );
}