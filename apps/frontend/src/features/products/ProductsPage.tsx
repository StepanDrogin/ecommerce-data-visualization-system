import { useEffect, useMemo, useState } from "react";
import type { Product } from "@edvs/shared";
import { apiGet } from "../../api";
import styles from "./ProductsPage.module.css";

const formatter = new Intl.NumberFormat("ru-RU");

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        setIsLoading(true);
        setError(null);
        setProducts(await apiGet<Product[]>("/products", controller.signal));
      } catch (caughtError) {
        if (caughtError instanceof DOMException && caughtError.name === "AbortError") {
          return;
        }
        setError(caughtError instanceof Error ? caughtError.message : "Не удалось загрузить товары");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadProducts();
    return () => controller.abort();
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return products;
    }

    return products.filter((product) =>
      `${product.name} ${product.categoryName} ${product.status} ${productStatusLabel(product.status)}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [products, query]);

  const stats = useMemo(
    () => ({
      total: products.length,
      available: products.filter((product) => product.status === "available").length,
      out: products.filter((product) => product.status === "out_of_stock").length,
      archived: products.filter((product) => product.status === "archived").length,
      stock: products.reduce((sum, product) => sum + product.stock, 0),
    }),
    [products],
  );
  const hasQuery = query.trim().length > 0;

  return (
    <section className={styles.section} id="products">
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Карта ассортимента</span>
          <h2>Товарный каталог</h2>
          <p>Витрина товаров из базы данных: категории, остатки, цены и статус доступности в одном рабочем срезе.</p>
        </div>
        <div className={styles.headerBadge}>
          <span>Товаров</span>
          <strong>{formatter.format(stats.total)}</strong>
        </div>
      </header>

      <div className={styles.statsGrid} aria-label="Сводка по товарам">
        <Stat label="Доступно" value={stats.available} tone="green" />
        <Stat label="Нет в наличии" value={stats.out} tone="amber" />
        <Stat label="Архив" value={stats.archived} tone="slate" />
        <Stat label="Остаток, шт." value={stats.stock} tone="blue" />
      </div>

      <div className={styles.toolbar}>
        <label className={styles.searchBox}>
          <span>Поиск</span>
          <input
            className={styles.search}
            type="search"
            placeholder="Товар, категория или статус"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <button className={styles.clearButton} type="button" onClick={() => setQuery("")} disabled={!hasQuery}>
          Сбросить
        </button>
        {!isLoading && !error ? (
          <span className={styles.resultCount}>
            Показано {formatter.format(filteredProducts.length)} из {formatter.format(products.length)}
          </span>
        ) : null}
      </div>

      {error ? <div className={`${styles.state} ${styles.error}`}>{error}</div> : null}
      {isLoading ? <LoadingRows /> : null}

      {!isLoading && !error && filteredProducts.length > 0 ? (
        <div className={styles.catalog}>
          {filteredProducts.map((product) => (
            <article className={styles.productCard} key={product.id}>
              <div className={styles.productTop}>
                <div>
                  <span className={styles.category}>{product.categoryName}</span>
                  <h3>{product.name}</h3>
                </div>
                <StatusBadge status={product.status} />
              </div>
              <div className={styles.productMeta}>
                <div>
                  <span>Цена</span>
                  <strong>{formatMoney(product.price)}</strong>
                </div>
                <div>
                  <span>Остаток</span>
                  <strong>{formatter.format(product.stock)} шт.</strong>
                </div>
                <div>
                  <span>Добавлен</span>
                  <strong>{product.createdAt.slice(0, 10)}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {!isLoading && !error && filteredProducts.length === 0 ? (
        <div className={styles.emptyState}>
          <strong>Товары не найдены</strong>
          <span>Измените поисковый запрос или сбросьте фильтр.</span>
        </div>
      ) : null}
    </section>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "green" | "amber" | "slate" | "blue" }) {
  return (
    <div className={`${styles.stat} ${styles[`stat${tone}`]}`}>
      <span>{label}</span>
      <strong>{formatter.format(value)}</strong>
    </div>
  );
}

function StatusBadge({ status }: { status: Product["status"] }) {
  const label = productStatusLabel(status);
  if (status === "out_of_stock") {
    return <span className={`${styles.badge} ${styles.badgeWarn}`}>{label}</span>;
  }

  if (status === "archived") {
    return <span className={`${styles.badge} ${styles.badgeMuted}`}>{label}</span>;
  }

  return <span className={styles.badge}>{label}</span>;
}

function LoadingRows() {
  return (
    <div className={styles.loadingGrid} aria-label="Загрузка товаров">
      {Array.from({ length: 6 }, (_, index) => (
        <div className={styles.skeletonCard} key={index}>
          <span />
          <strong />
          <i />
        </div>
      ))}
    </div>
  );
}

function productStatusLabel(status: Product["status"]) {
  return {
    available: "Доступен",
    out_of_stock: "Нет в наличии",
    archived: "Архив",
  }[status];
}

function formatMoney(value: number) {
  return `${formatter.format(value)} ₽`;
}
