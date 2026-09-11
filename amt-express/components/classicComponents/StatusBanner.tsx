import styles from './StatusBanner.module.css';

type StatusBannerProps = {
    title?: string;
    message: string;
    className?: string;
    tone?: 'info' | 'warning' | 'error' | 'success';
};

export function StatusBanner({ title, message, className, tone = 'info' }: StatusBannerProps) {
    const isError = tone === 'error';

    return (
        <div
            className={`${styles.statusBanner} ${styles[`statusBanner--${tone}`]} ${className || ''}`}
            role={isError ? 'alert' : 'status'}
            aria-live={isError ? 'assertive' : 'polite'}
        >
            {title && <strong className={styles.statusBannerTitle}>{title}</strong>}
            <p className={styles.statusBannerMessage}>{message}</p>
        </div>
    );
}