import type { AnalyticsSummary, ProductAnalyticsItem, SalesPoint } from "@edvs/shared";
import styles from "./AnalyticsPage.module.css";

const summary: AnalyticsSummary = {
  totalRevenue: 1284000,
  totalOrders: 342,
  totalProducts: 86,
  averageOrderValue: 3754,
};

const sales: SalesPoint[] = [
  { date: "2026-05-01", revenue: 142000, orders: 38 },
  { date: "2026-05-02", revenue: 168000, orders: 44 },
  { date: "2026-05-03", revenue: 156000, orders: 40 },
  { date: "2026-05-04", revenue: 214000, orders: 57 },
];

const topProducts: ProductAnalyticsItem[] = [
  { productId: "p-1", productName: "Smart Watch S2", category: "Electronics", revenue: 314000, unitsSold: 48 },
  { productId: "p-2", productName: "Coffee Machine Pro", category: "Home", revenue: 268000, unitsSold: 22 },
  { productId: "p-3", productName: "Wireless Headphones", category: "Electronics", revenue: 196000, unitsSold: 64 },
];

const formatter = new Intl.NumberFormat("ru-RU");

export function AnalyticsPage() {
  return (
    <section className={styles.page} id="analytics">
      <header className={styles.header}>
        <div>
          <h2>Интерактивная аналитика товаров и заказов</h2>
          <p>
            Стартовый экран фиксирует структуру будущего дашборда: ключевые метрики,
            динамику продаж и рейтинг товаров.
          </p>
        </div>
      </header>

      <div className={styles.metricsGrid}>
        <MetricCard label="Выручка" value={`${formatter.format(summary.totalRevenue)} ₽`} />
        <MetricCard label="Заказы" value={formatter.format(summary.totalOrders)} />
        <MetricCard label="Товары" value={formatter.format(summary.totalProducts)} />
        <MetricCard label="Средний чек" value={`${formatter.format(summary.averageOrderValue)} ₽`} />
      </div>

      <div className={styles.dashboardGrid}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>Динамика продаж</h3>
            <span>Apache ECharts placeholder</span>
          </div>
          <div className={styles.chartPlaceholder} role="img" aria-label="Заготовка графика динамики продаж">
            {sales.map((point) => (
              <div className={styles.barGroup} key={point.date}>
                <div
                  className={styles.bar}
                  style={{ height: `${Math.max(24, point.orders)}%` }}
                  title={`${point.date}: ${formatter.format(point.revenue)} ₽`}
                />
                <span>{point.date.slice(5)}</span>
              </div>
            ))}
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>Товары по выручке</h3>
            <span>Top products</span>
          </div>
          <div className={styles.productList}>
            {topProducts.map((product) => (
              <div className={styles.productRow} key={product.productId}>
                <div>
                  <strong>{product.productName}</strong>
                  <span>{product.category}</span>
                </div>
                <div className={styles.productValue}>
                  <strong>{formatter.format(product.revenue)} ₽</strong>
                  <span>{product.unitsSold} шт.</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
};

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <article className={styles.metricCard}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
