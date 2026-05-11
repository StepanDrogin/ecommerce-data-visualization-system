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
      `${product.name} ${product.categoryName} ${product.status}`.toLowerCase().includes(normalizedQuery),
    );
  }, [products, query]);

  return (
    <section className={styles.section} id="products">
      <header className={styles.header}>
        <h2>Товарный каталог</h2>
        <p>Список товаров из PostgreSQL с категориями, остатками и статусами доступности.</p>
      </header>

      <div className={styles.toolbar}>
        <input
          className={styles.search}
          type="search"
          placeholder="Поиск по товару, категории или статусу"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {error ? <div className={`${styles.state} ${styles.error}`}>{error}</div> : null}
      {isLoading ? <div className={styles.state}>Загрузка товаров...</div> : null}

      {!isLoading && !error ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Товар</th>
                <th>Категория</th>
                <th className={styles.number}>Цена</th>
                <th className={styles.number}>Остаток</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <strong>{product.name}</strong>
                    <span className={styles.muted}>добавлен {product.createdAt.slice(0, 10)}</span>
                  </td>
                  <td>{product.categoryName}</td>
                  <td className={styles.number}>{formatter.format(product.price)} ₽</td>
                  <td className={styles.number}>{formatter.format(product.stock)} шт.</td>
                  <td>
                    <StatusBadge status={product.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

function StatusBadge({ status }: { status: Product["status"] }) {
  if (status === "out_of_stock") {
    return <span className={`${styles.badge} ${styles.badgeWarn}`}>Нет в наличии</span>;
  }

  if (status === "archived") {
    return <span className={`${styles.badge} ${styles.badgeMuted}`}>Архив</span>;
  }

  return <span className={styles.badge}>Доступен</span>;
}
