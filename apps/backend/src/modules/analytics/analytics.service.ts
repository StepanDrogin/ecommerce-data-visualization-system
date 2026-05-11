import { Injectable } from "@nestjs/common";
import type { AnalyticsSummary, ProductAnalyticsItem, SalesPoint } from "@edvs/shared";

@Injectable()
export class AnalyticsService {
  getSummary(): AnalyticsSummary {
    return {
      totalRevenue: 1284000,
      totalOrders: 342,
      totalProducts: 86,
      averageOrderValue: 3754,
    };
  }

  getSales(): SalesPoint[] {
    return [
      { date: "2026-05-01", revenue: 142000, orders: 38 },
      { date: "2026-05-02", revenue: 168000, orders: 44 },
      { date: "2026-05-03", revenue: 156000, orders: 40 },
      { date: "2026-05-04", revenue: 214000, orders: 57 },
    ];
  }

  getProductAnalytics(): ProductAnalyticsItem[] {
    return [
      { productId: "p-1", productName: "Smart Watch S2", category: "Electronics", revenue: 314000, unitsSold: 48 },
      { productId: "p-2", productName: "Coffee Machine Pro", category: "Home", revenue: 268000, unitsSold: 22 },
      { productId: "p-3", productName: "Wireless Headphones", category: "Electronics", revenue: 196000, unitsSold: 64 },
    ];
  }
}
