import { useEffect, useMemo, useState } from "react";
import type { Order } from "@edvs/shared";
import { apiGet } from "../../api";
import styles from "./OrdersPage.module.css";

const formatter = new Intl.NumberFormat("ru-RU");
type StatusFilter = "all" | Order["status"];

const statusOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "Все" },
  { value: "created", label: "Создан" },
  { value: "paid", label: "Оплачен" },
  { value: "shipped", label: "Доставляется" },
  { value: "completed", label: "Завершен" },
  { value: "cancelled", label: "Отменен" },
];

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadOrders() {
      try {
        setIsLoading(true);
        setError(null);
        setOrders(await apiGet<Order[]>("/orders", controller.signal));
      } catch (caughtError) {
        if (caughtError instanceof DOMException && caughtError.name === "AbortError") {
          return;
        }
        setError(caughtError instanceof Error ? caughtError.message : "Не удалось загрузить заказы");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadOrders();
    return () => controller.abort();
  }, []);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const searchableText = [
        order.id,
        order.customerName,
        statusLabel(order.status),
        paymentMethod(order.paymentMethod),
        ...order.items.flatMap((item) => [item.productName, item.categoryName]),
      ]
        .join(" ")
        .toLowerCase();

      return matchesStatus && (!normalizedQuery || searchableText.includes(normalizedQuery));
    });
  }, [orders, query, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts = new Map<StatusFilter, number>([["all", orders.length]]);
    for (const option of statusOptions) {
      if (option.value !== "all") {
        counts.set(option.value, orders.filter((order) => order.status === option.value).length);
      }
    }
    return counts;
  }, [orders]);

  const revenue = useMemo(
    () => orders.filter((order) => order.status !== "cancelled").reduce((sum, order) => sum + order.totalAmount, 0),
    [orders],
  );
  const hasFilters = query.trim().length > 0 || statusFilter !== "all";

  return (
    <section className={styles.section} id="orders">
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Поток заказов</span>
          <h2>Заказы</h2>
          <p>Карточки заказов показывают клиента, статус, состав корзины и итоговую сумму без лишнего перехода в детали.</p>
        </div>
        <div className={styles.headerMetrics}>
          <div>
            <span>Оборот</span>
            <strong>{formatMoney(revenue)}</strong>
          </div>
          <div>
            <span>Заказы</span>
            <strong>{formatter.format(orders.length)}</strong>
          </div>
        </div>
      </header>

      <div className={styles.toolbar}>
        <label className={styles.searchBox}>
          <span>Поиск</span>
          <input
            className={styles.search}
            type="search"
            placeholder="Клиент, товар или номер заказа"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className={styles.segmented} aria-label="Статус заказа">
          {statusOptions.map((option) => (
            <button
              className={statusFilter === option.value ? styles.segmentActive : styles.segment}
              type="button"
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
            >
              {option.label}
              <span>{formatter.format(statusCounts.get(option.value) ?? 0)}</span>
            </button>
          ))}
        </div>
        <button
          className={styles.clearButton}
          type="button"
          onClick={() => {
            setQuery("");
            setStatusFilter("all");
          }}
          disabled={!hasFilters}
        >
          Сбросить
        </button>
        {!isLoading && !error ? (
          <span className={styles.resultCount}>
            Показано {formatter.format(filteredOrders.length)} из {formatter.format(orders.length)}
          </span>
        ) : null}
      </div>

      {error ? <div className={`${styles.state} ${styles.error}`}>{error}</div> : null}
      {isLoading ? <LoadingOrders /> : null}

      {!isLoading && !error && filteredOrders.length > 0 ? (
        <div className={styles.grid}>
          {filteredOrders.map((order) => (
            <article className={styles.order} key={order.id}>
              <div className={styles.orderRail} aria-hidden="true" />
              <div className={styles.top}>
                <div>
                  <span className={styles.orderId}>{order.id}</span>
                  <strong>{order.customerName}</strong>
                  <span className={styles.muted}>
                    {order.createdAt.slice(0, 10)} / {paymentMethod(order.paymentMethod)}
                  </span>
                </div>
                <div className={styles.amount}>
                  <strong>{formatMoney(order.totalAmount)}</strong>
                  <StatusBadge status={order.status} />
                </div>
              </div>

              <div className={styles.items}>
                {order.items.map((item) => (
                  <div className={styles.item} key={`${order.id}-${item.productId}`}>
                    <div>
                      <strong>{item.productName}</strong>
                      <span className={styles.muted}>{item.categoryName}</span>
                    </div>
                    <span>
                      {item.quantity} шт. по {formatMoney(item.price)}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {!isLoading && !error && filteredOrders.length === 0 ? (
        <div className={styles.emptyState}>
          <strong>Заказы не найдены</strong>
          <span>Измените поиск, статус или сбросьте фильтры.</span>
        </div>
      ) : null}
    </section>
  );
}

function StatusBadge({ status }: { status: Order["status"] }) {
  if (status === "completed") {
    return <span className={`${styles.badge} ${styles.badgeDone}`}>Завершен</span>;
  }

  if (status === "cancelled") {
    return <span className={`${styles.badge} ${styles.badgeCancel}`}>Отменен</span>;
  }

  if (status === "paid") {
    return <span className={`${styles.badge} ${styles.badgePaid}`}>Оплачен</span>;
  }

  return <span className={styles.badge}>{statusLabel(status)}</span>;
}

function LoadingOrders() {
  return (
    <div className={styles.loadingGrid} aria-label="Загрузка заказов">
      {Array.from({ length: 4 }, (_, index) => (
        <div className={styles.skeletonOrder} key={index}>
          <span />
          <strong />
          <i />
        </div>
      ))}
    </div>
  );
}

function statusLabel(status: Order["status"]) {
  return {
    created: "Создан",
    paid: "Оплачен",
    shipped: "Доставляется",
    completed: "Завершен",
    cancelled: "Отменен",
  }[status];
}

function paymentMethod(method: Order["paymentMethod"]) {
  return {
    card: "карта",
    cash: "наличные",
    bank_transfer: "перевод",
  }[method];
}

function formatMoney(value: number) {
  return `${formatter.format(value)} ₽`;
}
