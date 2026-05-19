import { useMemo, useState } from "react";
import styles from "./App.module.css";
import { AnalyticsPage } from "./features/analytics/AnalyticsPage";
import { OrdersPage } from "./features/orders/OrdersPage";
import { ProductsPage } from "./features/products/ProductsPage";

type View = "analytics" | "products" | "orders";

const views: Array<{ id: View; label: string; shortLabel: string; description: string }> = [
  { id: "analytics", label: "Аналитика", shortLabel: "AN", description: "Выручка, категории, топы" },
  { id: "products", label: "Товары", shortLabel: "PR", description: "Каталог и остатки" },
  { id: "orders", label: "Заказы", shortLabel: "OR", description: "Статусы и состав" },
];

export function App() {
  const [activeView, setActiveView] = useState<View>("analytics");
  const activeMeta = useMemo(() => views.find((view) => view.id === activeView) ?? views[0], [activeView]);

  return (
    <div className={styles.appShell}>
      <aside className={styles.rail} aria-label="Навигация приложения">
        <div className={styles.brand}>
          <span className={styles.brandMark}>ED</span>
          <div>
            <span className={styles.projectLabel}>ВКР Dashboard</span>
            <strong>E-commerce</strong>
          </div>
        </div>

        <nav className={styles.nav} aria-label="Основная навигация">
          {views.map((view) => (
            <button
              className={activeView === view.id ? styles.navItemActive : styles.navItem}
              type="button"
              key={view.id}
              onClick={() => setActiveView(view.id)}
              aria-current={activeView === view.id ? "page" : undefined}
            >
              <span className={styles.navCode}>{view.shortLabel}</span>
              <span>
                <strong>{view.label}</strong>
                <small>{view.description}</small>
              </span>
            </button>
          ))}
        </nav>

        <div className={styles.railFooter}>
          <span className={styles.liveDot} />
          <span>Production data</span>
        </div>
      </aside>

      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <div>
            <span className={styles.contextLabel}>Операционный центр</span>
            <h1>{activeMeta.label}</h1>
          </div>
          <div className={styles.topbarMeta} aria-label="Состояние витрины">
            <span>Supabase</span>
            <span>Vercel</span>
            <strong>Live</strong>
          </div>
        </header>

        <main className={styles.content}>
          {activeView === "analytics" ? <AnalyticsPage /> : null}
          {activeView === "products" ? <ProductsPage /> : null}
          {activeView === "orders" ? <OrdersPage /> : null}
        </main>
      </div>
    </div>
  );
}
