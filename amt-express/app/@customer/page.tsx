import { Car } from "lucide-react";
import styles from "../page.module.css";

export default function CustomerDashboardPage() {
  return (
    <div className={styles.homeContainer}>
      <div className={styles.homeHeader}>
        <div className={styles.homeLogoIcon}>
          <Car className={styles.homeLogoIconSvg} />
        </div>
        <div className={styles.homeTitleSection}>
          <h1 className={styles.homeTitle}>Customer Dashboard</h1>
          <p className={styles.homeSubtitle}>
            A shared layout inspired by the connection page.
          </p>
        </div>
      </div>

      <div className={styles.homeContentWrapper}>
        <main className={styles.homeCard}>
          <div className={styles.homePlaceholder}>
            <h2 className={styles.homePlaceholderTitle}>Coming soon...</h2>
            <p className={styles.homePlaceholderText}>
              This area will host the customer dashboard once it is ready.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
