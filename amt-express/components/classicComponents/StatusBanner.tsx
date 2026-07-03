import { cn } from "@/utils/cn";

type StatusBannerProps = {
    title?: string;
    message: string;
    className?: string;
    tone?: 'info' | 'warning' | 'error' | 'success';
};

export function StatusBanner({ title, message, className, tone = 'info' }: StatusBannerProps) {
    return (
        <div className={cn('statusBanner', `statusBanner--${tone}`, className)} role="status" aria-live="polite">
            {title && <strong className="statusBannerTitle">{title}</strong>}
            <p className="statusBannerMessage">{message}</p>
        </div>
    );
}