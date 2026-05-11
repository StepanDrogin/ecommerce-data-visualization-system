import { useEffect, useState } from "react";
import type { Order } from "@edvs/shared";
import { apiGet } from "../../api";
import styles from "./OrdersPage.module.css";

const formatter = new Intl.NumberFormat("ru-RU");

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
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

  return (
    <section className={styles.section} id="orders">
      <header className={styles.header}>
        <h2>Заказы</h2>
        <p>Карточки заказов показывают клиента, статус, состав заказа и итоговую сумму.</p>
      </header>

      {error ? <div className={`${styles.state} ${styles.error}`}>{error}</div> : null}
      {isLoading ? <div className={styles.state}>Загрузка заказов...</div> : null}

      {!isLoading && !error ? (
        <div className={styles.grid}>
          {orders.map((order) => (
            <article className={styles.order} key={order.id}>
              <div className={styles.top}>
                <div>
                  <strong>{order.customerName}</strong>
                  <span className={styles.muted}>
                    {order.id} · {order.createdAt.slice(0, 10)} · {paymentMethod(order.paymentMethod)}
                  </span>
                </div>
                <div className={styles.amount}>
                  <strong>{formatter.format(order.totalAmount)} ₽</strong>
                  <span className={styles.muted}>
                    <StatusBadge status={order.status} />
                  </span>
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
                      {item.quantity} × {formatter.format(item.price)} ₽
                    </span>
                  </div>
                ))}
              </div>
            </article>
          ))}
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

  return <span className={styles.badge}>{statusLabel(status)}</span>;
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
