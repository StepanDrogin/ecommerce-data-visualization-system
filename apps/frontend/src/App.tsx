import { useState } from "react";
import styles from "./App.module.css";
import { AnalyticsPage } from "./features/analytics/AnalyticsPage";
import { OrdersPage } from "./features/orders/OrdersPage";
import { ProductsPage } from "./features/products/ProductsPage";

type View = "analytics" | "products" | "orders";

const views: Array<{ id: View; label: string }> = [
  { id: "analytics", label: "Аналитика" },
  { id: "products", label: "Товары" },
  { id: "orders", label: "Заказы" },
];

export function App() {
  const [activeView, setActiveView] = useState<View>("analytics");

  return (
    <div className={styles.appShell}>
      <aside className={styles.sidebar}>
        <div>
          <p className={styles.projectLabel}>ВКР Dashboard</p>
          <h1 className={styles.title}>E-commerce Analytics</h1>
        </div>

        <nav className={styles.nav} aria-label="Основная навигация">
          {views.map((view) => (
            <button
              className={activeView === view.id ? styles.navItemActive : styles.navItem}
              type="button"
              key={view.id}
              onClick={() => setActiveView(view.id)}
            >
              {view.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className={styles.content}>
        {activeView === "analytics" ? <AnalyticsPage /> : null}
        {activeView === "products" ? <ProductsPage /> : null}
        {activeView === "orders" ? <OrdersPage /> : null}
      </main>
    </div>
  );
}
