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
import { toOrder, toProduct } from "../../mappers";
import { PrismaService } from "../../prisma/prisma.service";
import { AnalyticsCacheService } from "./analytics-cache.service";

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: AnalyticsCacheService,
  ) {}

  async getDashboard(filters: AnalyticsFilters = {}): Promise<AnalyticsDashboardResponse> {
    const normalizedFilters = this.normalizeFilters(filters);
    const cacheKey = JSON.stringify(normalizedFilters);
    const cached = await this.cache.get<AnalyticsDashboardResponse>(cacheKey);

    if (cached) {
      return cached;
    }

    const [orders, products] = await Promise.all([
      this.getFilteredOrders(normalizedFilters),
      this.getFilteredProducts(normalizedFilters),
    ]);

    const response: AnalyticsDashboardResponse = {
      filters: normalizedFilters,
      summary: this.buildSummary(normalizedFilters, orders, products.length),
      sales: this.buildSales(orders),
      products: this.buildProductAnalytics(normalizedFilters, orders),
      categories: this.buildCategoryAnalytics(normalizedFilters, orders),
    };

    await this.cache.set(cacheKey, response);
    return response;
  }

  async getSummary(filters: AnalyticsFilters = {}): Promise<AnalyticsSummary> {
    return (await this.getDashboard(filters)).summary;
  }

  async getSales(filters: AnalyticsFilters = {}): Promise<SalesPoint[]> {
    return (await this.getDashboard(filters)).sales;
  }

  async getProductAnalytics(filters: AnalyticsFilters = {}): Promise<ProductAnalyticsItem[]> {
    return (await this.getDashboard(filters)).products;
  }

  async getCategoryAnalytics(filters: AnalyticsFilters = {}): Promise<CategoryAnalyticsItem[]> {
    return (await this.getDashboard(filters)).categories;
  }

  private buildSummary(_filters: AnalyticsFilters, filteredOrders: Order[], productCount: number): AnalyticsSummary {
    const revenueOrders = filteredOrders.filter((order) => order.status !== "cancelled");
    const totalRevenue = revenueOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const completedOrders = filteredOrders.filter((order) => order.status === "completed").length;

    return {
      totalRevenue,
      totalOrders: filteredOrders.length,
      totalProducts: productCount,
      averageOrderValue: revenueOrders.length === 0 ? 0 : Math.round(totalRevenue / revenueOrders.length),
      completedOrders,
      conversionRevenueShare: filteredOrders.length === 0 ? 0 : Math.round((completedOrders / filteredOrders.length) * 100),
    };
  }

  private buildSales(orders: Order[]): SalesPoint[] {
    const grouped = new Map<string, SalesPoint>();

    for (const order of orders.filter((item) => item.status !== "cancelled")) {
      const date = order.createdAt.slice(0, 10);
      const current = grouped.get(date) ?? { date, revenue: 0, orders: 0 };
      current.revenue += order.totalAmount;
      current.orders += 1;
      grouped.set(date, current);
    }

    return [...grouped.values()].sort((a, b) => a.date.localeCompare(b.date));
  }

  private buildProductAnalytics(filters: AnalyticsFilters, orders: Order[]): ProductAnalyticsItem[] {
    const grouped = new Map<string, ProductAnalyticsItem>();

    for (const order of orders.filter((item) => item.status !== "cancelled")) {
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

  private buildCategoryAnalytics(filters: AnalyticsFilters, orders: Order[]): CategoryAnalyticsItem[] {
    const grouped = new Map<string, CategoryAnalyticsItem>();

    for (const product of this.buildProductAnalytics(filters, orders)) {
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

  private async getFilteredOrders(filters: AnalyticsFilters): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: this.dateRange(filters),
        items: filters.categoryId
          ? {
              some: {
                product: {
                  categoryId: filters.categoryId,
                },
              },
            }
          : undefined,
      },
      include: {
        user: true,
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return orders.map(toOrder);
  }

  private async getFilteredProducts(filters: AnalyticsFilters) {
    const products = await this.prisma.product.findMany({
      where: {
        categoryId: filters.categoryId,
      },
      include: { category: true },
      orderBy: { name: "asc" },
    });

    return products.map(toProduct);
  }

  private dateRange(filters: AnalyticsFilters) {
    if (!filters.dateFrom && !filters.dateTo) {
      return undefined;
    }

    return {
      gte: filters.dateFrom ? new Date(`${filters.dateFrom}T00:00:00.000Z`) : undefined,
      lte: filters.dateTo ? new Date(`${filters.dateTo}T23:59:59.999Z`) : undefined,
    };
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
