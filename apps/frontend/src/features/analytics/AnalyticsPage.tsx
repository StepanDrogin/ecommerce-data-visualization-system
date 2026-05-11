import { useEffect, useMemo, useRef, useState } from "react";
import { BarChart, LineChart, PieChart, type BarSeriesOption, type LineSeriesOption, type PieSeriesOption } from "echarts/charts";
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
  type GridComponentOption,
  type LegendComponentOption,
  type TooltipComponentOption,
} from "echarts/components";
import * as echarts from "echarts/core";
import type { ComposeOption } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import type {
  AnalyticsDashboardResponse,
  AnalyticsFilters,
  Category,
  CategoryAnalyticsItem,
  ProductAnalyticsItem,
  SalesPoint,
} from "@edvs/shared";
import { apiGet } from "../../api";
import styles from "./AnalyticsPage.module.css";

echarts.use([BarChart, LineChart, PieChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer]);

type ChartOption = ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | PieSeriesOption
  | GridComponentOption
  | LegendComponentOption
  | TooltipComponentOption
>;

const defaultFilters: Required<Pick<AnalyticsFilters, "dateFrom" | "dateTo">> & Pick<AnalyticsFilters, "categoryId"> = {
  dateFrom: "2026-05-01",
  dateTo: "2026-05-11",
  categoryId: "",
};

const formatter = new Intl.NumberFormat("ru-RU");

export function AnalyticsPage() {
  const [filters, setFilters] = useState(defaultFilters);
  const [dashboard, setDashboard] = useState<AnalyticsDashboardResponse | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      setIsLoading(true);
      setError(null);

      try {
        const query = new URLSearchParams();
        query.set("dateFrom", filters.dateFrom);
        query.set("dateTo", filters.dateTo);
        if (filters.categoryId) {
          query.set("categoryId", filters.categoryId);
        }

        const [dashboardData, categoryData] = await Promise.all([
          apiGet<AnalyticsDashboardResponse>(`/analytics/dashboard?${query.toString()}`, controller.signal),
          apiGet<Category[]>("/products/categories", controller.signal),
        ]);

        setDashboard(dashboardData);
        setCategories(categoryData);
      } catch (caughtError) {
        if (caughtError instanceof DOMException && caughtError.name === "AbortError") {
          return;
        }

        setError(caughtError instanceof Error ? caughtError.message : "Неизвестная ошибка загрузки");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadData();

    return () => controller.abort();
  }, [filters]);

  const summary = dashboard?.summary;

  return (
    <section className={styles.page} id="analytics">
      <header className={styles.header}>
        <div>
          <h2>Интерактивная аналитика товаров и заказов</h2>
          <p>
            Дашборд показывает ключевые показатели e-commerce: динамику продаж, структуру категорий,
            топ товаров, средний чек и долю завершенных заказов.
          </p>
        </div>
      </header>

      <form className={styles.filters} aria-label="Фильтры аналитики">
        <label>
          <span>Начало периода</span>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(event) => setFilters((current) => ({ ...current, dateFrom: event.target.value }))}
          />
        </label>
        <label>
          <span>Конец периода</span>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(event) => setFilters((current) => ({ ...current, dateTo: event.target.value }))}
          />
        </label>
        <label>
          <span>Категория</span>
          <select
            value={filters.categoryId}
            onChange={(event) => setFilters((current) => ({ ...current, categoryId: event.target.value }))}
          >
            <option value="">Все категории</option>
            {categories.map((category) => (
              <option value={category.id} key={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </form>

      {error ? (
        <div className={styles.errorState} role="alert">
          <strong>Данные не загрузились</strong>
          <span>{error}</span>
        </div>
      ) : null}

      <div className={styles.metricsGrid} aria-busy={isLoading}>
        <MetricCard label="Выручка" value={summary ? `${formatter.format(summary.totalRevenue)} ₽` : "-"} />
        <MetricCard label="Заказы" value={summary ? formatter.format(summary.totalOrders) : "-"} />
        <MetricCard label="Средний чек" value={summary ? `${formatter.format(summary.averageOrderValue)} ₽` : "-"} />
        <MetricCard label="Завершение" value={summary ? `${summary.conversionRevenueShare}%` : "-"} />
      </div>

      {isLoading ? (
        <div className={styles.loadingState}>Загрузка аналитики...</div>
      ) : (
        <div className={styles.dashboardGrid}>
          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3>Динамика продаж</h3>
              <span>выручка и заказы</span>
            </div>
            <SalesChart data={dashboard?.sales ?? []} />
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3>Структура категорий</h3>
              <span>доля выручки</span>
            </div>
            <CategoryChart data={dashboard?.categories ?? []} />
          </article>

          <article className={styles.panelWide}>
            <div className={styles.panelHeader}>
              <h3>Товары по выручке</h3>
              <span>top products</span>
            </div>
            <ProductsChart data={dashboard?.products ?? []} />
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3>Детализация товаров</h3>
              <span>выручка и штуки</span>
            </div>
            <ProductList products={dashboard?.products ?? []} />
          </article>
        </div>
      )}
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

function SalesChart({ data }: { data: SalesPoint[] }) {
  const option = useMemo<ChartOption>(
    () => ({
      color: ["#2563eb", "#16a34a"],
      grid: { top: 24, right: 16, bottom: 32, left: 58 },
      tooltip: { trigger: "axis" },
      legend: { bottom: 0, textStyle: { color: "#475467" } },
      xAxis: {
        type: "category",
        data: data.map((point) => point.date.slice(5)),
        axisLine: { lineStyle: { color: "#cbd5e1" } },
      },
      yAxis: [
        { type: "value", name: "₽", axisLine: { show: false }, splitLine: { lineStyle: { color: "#e5edf7" } } },
        { type: "value", name: "шт.", axisLine: { show: false }, splitLine: { show: false } },
      ],
      series: [
        { name: "Выручка", type: "bar", data: data.map((point) => point.revenue), barMaxWidth: 34 },
        { name: "Заказы", type: "line", yAxisIndex: 1, smooth: true, data: data.map((point) => point.orders) },
      ],
    }),
    [data],
  );

  return <Chart option={option} ariaLabel="График динамики продаж" />;
}

function CategoryChart({ data }: { data: CategoryAnalyticsItem[] }) {
  const option = useMemo<ChartOption>(
    () => ({
      color: ["#2563eb", "#16a34a", "#f59e0b", "#db2777", "#7c3aed"],
      tooltip: { trigger: "item", formatter: "{b}: {c} ₽ ({d}%)" },
      series: [
        {
          name: "Категории",
          type: "pie",
          radius: ["48%", "72%"],
          avoidLabelOverlap: true,
          data: data.map((item) => ({ value: item.revenue, name: item.categoryName })),
        },
      ],
    }),
    [data],
  );

  return <Chart option={option} ariaLabel="Диаграмма структуры категорий" />;
}

function ProductsChart({ data }: { data: ProductAnalyticsItem[] }) {
  const option = useMemo<ChartOption>(
    () => ({
      color: ["#2563eb"],
      grid: { top: 20, right: 18, bottom: 62, left: 78 },
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      xAxis: {
        type: "category",
        data: data.map((item) => item.productName),
        axisLabel: { rotate: 24, interval: 0 },
        axisLine: { lineStyle: { color: "#cbd5e1" } },
      },
      yAxis: { type: "value", axisLine: { show: false }, splitLine: { lineStyle: { color: "#e5edf7" } } },
      series: [{ name: "Выручка", type: "bar", data: data.map((item) => item.revenue), barMaxWidth: 42 }],
    }),
    [data],
  );

  return <Chart option={option} ariaLabel="Диаграмма товаров по выручке" />;
}

function ProductList({ products }: { products: ProductAnalyticsItem[] }) {
  if (products.length === 0) {
    return <div className={styles.emptyState}>Нет данных для выбранных фильтров</div>;
  }

  return (
    <div className={styles.productList}>
      {products.map((product) => (
        <div className={styles.productRow} key={product.productId}>
          <div>
            <strong>{product.productName}</strong>
            <span>{product.categoryName}</span>
          </div>
          <div className={styles.productValue}>
            <strong>{formatter.format(product.revenue)} ₽</strong>
            <span>{product.unitsSold} шт.</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function Chart({ option, ariaLabel }: { option: ChartOption; ariaLabel: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const chart = echarts.init(containerRef.current);
    chart.setOption(option);

    const resizeObserver = new ResizeObserver(() => chart.resize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.dispose();
    };
  }, [option]);

  return <div className={styles.chart} ref={containerRef} role="img" aria-label={ariaLabel} />;
}
