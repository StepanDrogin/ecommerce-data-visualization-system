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
const moneyFormatter = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });

export function AnalyticsPage() {
  const [filters, setFilters] = useState(defaultFilters);
  const [dashboard, setDashboard] = useState<AnalyticsDashboardResponse | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasCustomFilters =
    filters.dateFrom !== defaultFilters.dateFrom ||
    filters.dateTo !== defaultFilters.dateTo ||
    filters.categoryId !== defaultFilters.categoryId;

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
  const leadingProduct = dashboard?.products[0];
  const selectedCategory = categories.find((category) => category.id === filters.categoryId)?.name ?? "Все категории";

  return (
    <section className={styles.page} id="analytics">
      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>Аналитика выручки</span>
          <h2>Аналитика продаж</h2>
          <p>Видно, где растет выручка, какие категории держат оборот и какие товары стоит подсветить в витрине.</p>
        </div>
        <div className={styles.heroSignal} aria-label="Текущий срез данных">
          <span>Срез</span>
          <strong>{selectedCategory}</strong>
          <small>
            {formatDate(filters.dateFrom)} - {formatDate(filters.dateTo)}
          </small>
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
        <button
          className={styles.resetButton}
          type="button"
          onClick={() => setFilters(defaultFilters)}
          disabled={!hasCustomFilters}
        >
          Сбросить
        </button>
      </form>

      {error ? (
        <div className={styles.errorState} role="alert">
          <strong>Данные не загрузились</strong>
          <span>{error}</span>
        </div>
      ) : null}

      <div className={styles.metricsGrid} aria-busy={isLoading}>
        <MetricCard tone="blue" label="Выручка" value={summary ? formatMoney(summary.totalRevenue) : "-"} caption="без отмененных заказов" />
        <MetricCard tone="green" label="Заказы" value={summary ? formatter.format(summary.totalOrders) : "-"} caption="в выбранном периоде" />
        <MetricCard tone="amber" label="Средний чек" value={summary ? formatMoney(summary.averageOrderValue) : "-"} caption="среднее по заказам" />
        <MetricCard tone="pink" label="Завершение" value={summary ? `${summary.conversionRevenueShare}%` : "-"} caption="доля успешной выручки" />
      </div>

      <div className={styles.insightStrip}>
        <div>
          <span>Лидер витрины</span>
          <strong>{leadingProduct?.productName ?? "Нет данных"}</strong>
        </div>
        <div>
          <span>Продано единиц</span>
          <strong>{leadingProduct ? formatter.format(leadingProduct.unitsSold) : "-"}</strong>
        </div>
        <div>
          <span>Статус</span>
          <strong>{isLoading ? "Обновляем" : "Готово к демо"}</strong>
        </div>
      </div>

      {isLoading ? (
        <LoadingDashboard />
      ) : (
        <div className={styles.dashboardGrid}>
          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <span>Динамика</span>
                <h3>Динамика продаж</h3>
              </div>
              <small>выручка и заказы</small>
            </div>
            <SalesChart data={dashboard?.sales ?? []} />
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <span>Категории</span>
                <h3>Структура категорий</h3>
              </div>
              <small>доля выручки</small>
            </div>
            <CategoryChart data={dashboard?.categories ?? []} />
          </article>

          <article className={styles.panelWide}>
            <div className={styles.panelHeader}>
              <div>
                <span>Рейтинг</span>
                <h3>Товары по выручке</h3>
              </div>
              <small>топ товаров</small>
            </div>
            <ProductsChart data={dashboard?.products ?? []} />
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <span>Детали</span>
                <h3>Детализация товаров</h3>
              </div>
              <small>выручка и штуки</small>
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
  caption: string;
  tone: "blue" | "green" | "amber" | "pink";
};

function MetricCard({ label, value, caption, tone }: MetricCardProps) {
  return (
    <article className={`${styles.metricCard} ${styles[`metric${tone}`]}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{caption}</small>
    </article>
  );
}

function SalesChart({ data }: { data: SalesPoint[] }) {
  const option = useMemo<ChartOption>(
    () => ({
      color: ["#2563eb", "#0f766e"],
      grid: { top: 60, right: 42, bottom: 70, left: 70 },
      tooltip: { trigger: "axis", backgroundColor: "#101828", borderWidth: 0, textStyle: { color: "#ffffff" } },
      legend: { bottom: 0, icon: "roundRect", itemGap: 18, textStyle: { color: "#667085" } },
      xAxis: {
        type: "category",
        data: data.map((point) => point.date.slice(5)),
        axisTick: { show: false },
        axisLine: { lineStyle: { color: "#cbd5e1" } },
        axisLabel: { color: "#667085" },
      },
      yAxis: [
        {
          type: "value",
          name: "руб.",
          nameGap: 24,
          nameTextStyle: { color: "#667085", padding: [0, 0, 8, 0] },
          axisLine: { show: false },
          axisLabel: { color: "#667085" },
          splitLine: { lineStyle: { color: "rgba(148, 163, 184, 0.22)" } },
        },
        {
          type: "value",
          name: "шт.",
          nameGap: 24,
          minInterval: 1,
          nameTextStyle: { color: "#667085", padding: [0, 0, 8, 0] },
          axisLine: { show: false },
          axisLabel: { color: "#667085" },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: "Выручка",
          type: "bar",
          data: data.map((point) => point.revenue),
          barMaxWidth: 34,
          itemStyle: { borderRadius: [6, 6, 0, 0] },
        },
        {
          name: "Заказы",
          type: "line",
          yAxisIndex: 1,
          smooth: true,
          symbolSize: 8,
          lineStyle: { width: 3 },
          data: data.map((point) => point.orders),
        },
      ],
    }),
    [data],
  );

  if (data.length === 0) {
    return <EmptyChartState />;
  }

  return <Chart option={option} ariaLabel="График динамики продаж" />;
}

function CategoryChart({ data }: { data: CategoryAnalyticsItem[] }) {
  const option = useMemo<ChartOption>(
    () => ({
      color: ["#2563eb", "#0f766e", "#f59e0b", "#db2777", "#7c3aed"],
      tooltip: { trigger: "item", formatter: "{b}: {c} руб. ({d}%)", backgroundColor: "#101828", borderWidth: 0, textStyle: { color: "#ffffff" } },
      series: [
        {
          name: "Категории",
          type: "pie",
          radius: ["48%", "68%"],
          center: ["52%", "58%"],
          top: 18,
          avoidLabelOverlap: true,
          label: { color: "#344054", padding: [8, 0, 0, 0] },
          labelLine: { length: 22, length2: 22, maxSurfaceAngle: 80 },
          itemStyle: { borderColor: "#ffffff", borderWidth: 3 },
          data: data.map((item) => ({ value: item.revenue, name: item.categoryName })),
        },
      ],
    }),
    [data],
  );

  if (data.length === 0) {
    return <EmptyChartState />;
  }

  return <Chart option={option} ariaLabel="Диаграмма структуры категорий" />;
}

function ProductsChart({ data }: { data: ProductAnalyticsItem[] }) {
  const isCompact = useIsCompactViewport();
  const option = useMemo<ChartOption>(
    () => {
      if (isCompact) {
        return {
          color: ["#2563eb"],
          grid: { top: 20, right: 24, bottom: 24, left: 126 },
          tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, backgroundColor: "#101828", borderWidth: 0, textStyle: { color: "#ffffff" } },
          xAxis: {
            type: "value",
            axisLine: { show: false },
            axisLabel: { color: "#667085" },
            splitLine: { lineStyle: { color: "rgba(148, 163, 184, 0.22)" } },
          },
          yAxis: {
            type: "category",
            data: data.map((item) => item.productName),
            inverse: true,
            axisTick: { show: false },
            axisLine: { show: false },
            axisLabel: { color: "#667085", width: 112, overflow: "truncate" },
          },
          series: [
            {
              name: "Выручка",
              type: "bar",
              data: data.map((item) => item.revenue),
              barMaxWidth: 18,
              itemStyle: { borderRadius: [0, 6, 6, 0] },
            },
          ],
        };
      }

      return {
        color: ["#2563eb"],
        grid: { top: 42, right: 24, bottom: 82, left: 82 },
        tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, backgroundColor: "#101828", borderWidth: 0, textStyle: { color: "#ffffff" } },
        xAxis: {
          type: "category",
          data: data.map((item) => item.productName),
          axisLabel: { rotate: 24, interval: 0, color: "#667085" },
          axisTick: { show: false },
          axisLine: { lineStyle: { color: "#cbd5e1" } },
        },
        yAxis: {
          type: "value",
          axisLine: { show: false },
          axisLabel: { color: "#667085" },
          splitLine: { lineStyle: { color: "rgba(148, 163, 184, 0.22)" } },
        },
        series: [
          {
            name: "Выручка",
            type: "bar",
            data: data.map((item) => item.revenue),
            barMaxWidth: 42,
            itemStyle: { borderRadius: [6, 6, 0, 0] },
          },
        ],
      };
    },
    [data, isCompact],
  );

  if (data.length === 0) {
    return <EmptyChartState />;
  }

  return <Chart option={option} ariaLabel="Диаграмма товаров по выручке" />;
}

function ProductList({ products }: { products: ProductAnalyticsItem[] }) {
  if (products.length === 0) {
    return <div className={styles.emptyState}>Нет данных для выбранных фильтров</div>;
  }

  return (
    <div className={styles.productList}>
      {products.map((product, index) => (
        <div className={styles.productRow} key={product.productId}>
          <span className={styles.rank}>{String(index + 1).padStart(2, "0")}</span>
          <div>
            <strong>{product.productName}</strong>
            <span>{product.categoryName}</span>
          </div>
          <div className={styles.productValue}>
            <strong>{formatMoney(product.revenue)}</strong>
            <span>{product.unitsSold} шт.</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyChartState() {
  return <div className={styles.chartEmptyState}>Нет данных для выбранных фильтров</div>;
}

function LoadingDashboard() {
  return (
    <div className={styles.loadingGrid} aria-label="Загрузка аналитики">
      {Array.from({ length: 4 }, (_, index) => (
        <div className={styles.skeletonPanel} key={index}>
          <span />
          <strong />
          <i />
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
    chart.setOption(option, true);

    const resizeObserver = new ResizeObserver(() => chart.resize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.dispose();
    };
  }, [option]);

  return <div className={styles.chart} ref={containerRef} role="img" aria-label={ariaLabel} />;
}

function useIsCompactViewport() {
  const [isCompact, setIsCompact] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia("(max-width: 760px)").matches,
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 760px)");
    const update = () => setIsCompact(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return isCompact;
}

function formatMoney(value: number) {
  return `${moneyFormatter.format(value)} ₽`;
}

function formatDate(value: string) {
  return value.split("-").reverse().join(".");
}
