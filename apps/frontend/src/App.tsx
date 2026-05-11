import styles from "./App.module.css";
import { AnalyticsPage } from "./features/analytics/AnalyticsPage";

export function App() {
  return (
    <div className={styles.appShell}>
      <aside className={styles.sidebar}>
        <div>
          <p className={styles.projectLabel}>ВКР Dashboard</p>
          <h1 className={styles.title}>E-commerce Analytics</h1>
        </div>

        <nav className={styles.nav} aria-label="Основная навигация">
          <a className={styles.navItemActive} href="#analytics">Аналитика</a>
          <a className={styles.navItem} href="#products">Товары</a>
          <a className={styles.navItem} href="#orders">Заказы</a>
        </nav>
      </aside>

      <main className={styles.content}>
        <AnalyticsPage />
      </main>
    </div>
  );
}
