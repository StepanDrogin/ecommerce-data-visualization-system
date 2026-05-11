import { Injectable } from "@nestjs/common";
import type {
  AnalyticsDashboardResponse,
  AnalyticsFilters,
  AnalyticsSummary,
  CategoryAnalyticsItem,
  Order,
  ProductAnalyticsItem,
  SalesPoint,
} from "@edvs/shared";
import { orders, products } from "../../data/demo-data";

@Injectable()
export class AnalyticsService {
  private readonly cache = new Map<string, AnalyticsDashboardResponse>();

  getDashboard(filters: AnalyticsFilters = {}): AnalyticsDashboardResponse {
    const normalizedFilters = this.normalizeFilters(filters);
    const cacheKey = JSON.stringify(normalizedFilters);
    const cached = this.cache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const response: AnalyticsDashboardResponse = {
      filters: normalizedFilters,
      summary: this.buildSummary(normalizedFilters),
      sales: this.buildSales(normalizedFilters),
      products: this.buildProductAnalytics(normalizedFilters),
      categories: this.buildCategoryAnalytics(normalizedFilters),
    };

    this.cache.set(cacheKey, response);
    return response;
  }

  getSummary(filters: AnalyticsFilters = {}): AnalyticsSummary {
    return this.getDashboard(filters).summary;
  }

  getSales(filters: AnalyticsFilters = {}): SalesPoint[] {
    return this.getDashboard(filters).sales;
  }

  getProductAnalytics(filters: AnalyticsFilters = {}): ProductAnalyticsItem[] {
    return this.getDashboard(filters).products;
  }

  getCategoryAnalytics(filters: AnalyticsFilters = {}): CategoryAnalyticsItem[] {
    return this.getDashboard(filters).categories;
  }

  private buildSummary(filters: AnalyticsFilters): AnalyticsSummary {
    const filteredOrders = this.getFilteredOrders(filters);
    const revenueOrders = filteredOrders.filter((order) => order.status !== "cancelled");
    const totalRevenue = revenueOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const completedOrders = filteredOrders.filter((order) => order.status === "completed").length;

    return {
      totalRevenue,
      totalOrders: filteredOrders.length,
      totalProducts: this.getFilteredProducts(filters).length,
      averageOrderValue: revenueOrders.length === 0 ? 0 : Math.round(totalRevenue / revenueOrders.length),
      completedOrders,
      conversionRevenueShare: filteredOrders.length === 0 ? 0 : Math.round((completedOrders / filteredOrders.length) * 100),
    };
  }

  private buildSales(filters: AnalyticsFilters): SalesPoint[] {
    const grouped = new Map<string, SalesPoint>();

    for (const order of this.getFilteredOrders(filters).filter((item) => item.status !== "cancelled")) {
      const date = order.createdAt.slice(0, 10);
      const current = grouped.get(date) ?? { date, revenue: 0, orders: 0 };
      current.revenue += order.totalAmount;
      current.orders += 1;
      grouped.set(date, current);
    }

    return [...grouped.values()].sort((a, b) => a.date.localeCompare(b.date));
  }

  private buildProductAnalytics(filters: AnalyticsFilters): ProductAnalyticsItem[] {
    const grouped = new Map<string, ProductAnalyticsItem>();

    for (const order of this.getFilteredOrders(filters).filter((item) => item.status !== "cancelled")) {
      for (const item of order.items) {
        if (filters.categoryId && item.categoryId !== filters.categoryId) {
          continue;
        }

        const current = grouped.get(item.productId) ?? {
          productId: item.productId,
          productName: item.productName,
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          revenue: 0,
          unitsSold: 0,
        };

        current.revenue += item.price * item.quantity;
        current.unitsSold += item.quantity;
        grouped.set(item.productId, current);
      }
    }

    return [...grouped.values()].sort((a, b) => b.revenue - a.revenue);
  }

  private buildCategoryAnalytics(filters: AnalyticsFilters): CategoryAnalyticsItem[] {
    const grouped = new Map<string, CategoryAnalyticsItem>();

    for (const product of this.buildProductAnalytics(filters)) {
      const current = grouped.get(product.categoryId) ?? {
        categoryId: product.categoryId,
        categoryName: product.categoryName,
        revenue: 0,
        unitsSold: 0,
      };

      current.revenue += product.revenue;
      current.unitsSold += product.unitsSold;
      grouped.set(product.categoryId, current);
    }

    return [...grouped.values()].sort((a, b) => b.revenue - a.revenue);
  }

  private getFilteredOrders(filters: AnalyticsFilters): Order[] {
    return orders.filter((order) => {
      const orderDate = order.createdAt.slice(0, 10);
      const matchesDateFrom = !filters.dateFrom || orderDate >= filters.dateFrom;
      const matchesDateTo = !filters.dateTo || orderDate <= filters.dateTo;
      const matchesCategory =
        !filters.categoryId || order.items.some((item) => item.categoryId === filters.categoryId);

      return matchesDateFrom && matchesDateTo && matchesCategory;
    });
  }

  private getFilteredProducts(filters: AnalyticsFilters) {
    return products.filter((product) => !filters.categoryId || product.categoryId === filters.categoryId);
  }

  private normalizeFilters(filters: AnalyticsFilters): AnalyticsFilters {
    return {
      dateFrom: this.normalizeDate(filters.dateFrom),
      dateTo: this.normalizeDate(filters.dateTo),
      categoryId: filters.categoryId || undefined,
    };
  }

  private normalizeDate(value?: string): string | undefined {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return undefined;
    }

    return value;
  }
}
