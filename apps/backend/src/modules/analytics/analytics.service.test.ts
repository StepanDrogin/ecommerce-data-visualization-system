import { describe, expect, it, vi } from "vitest";
import { AnalyticsService } from "./analytics.service";

function decimal(value: number) {
  return {
    toNumber: () => value,
  };
}

const categories = {
  electronics: { name: "Электроника" },
  home: { name: "Дом и кухня" },
};

const users = {
  anna: { name: "Анна Смирнова" },
  ivan: { name: "Иван Петров" },
};

const products = [
  {
    id: "p-1",
    name: "Smart Watch S2",
    categoryId: "electronics",
    category: categories.electronics,
    price: decimal(12990),
    stock: 10,
    status: "AVAILABLE",
    createdAt: new Date("2026-04-10T10:00:00.000Z"),
  },
  {
    id: "p-2",
    name: "Coffee Machine Pro",
    categoryId: "home",
    category: categories.home,
    price: decimal(21990),
    stock: 5,
    status: "AVAILABLE",
    createdAt: new Date("2026-04-10T10:00:00.000Z"),
  },
] as const;

const orders = [
  {
    id: "o-1",
    userId: "u-1",
    user: users.anna,
    status: "COMPLETED",
    paymentMethod: "CARD",
    totalAmount: decimal(12990),
    createdAt: new Date("2026-05-01T12:00:00.000Z"),
    items: [
      {
        productId: "p-1",
        quantity: 1,
        price: decimal(12990),
        product: products[0],
      },
    ],
  },
  {
    id: "o-2",
    userId: "u-2",
    user: users.ivan,
    status: "CANCELLED",
    paymentMethod: "CARD",
    totalAmount: decimal(21990),
    createdAt: new Date("2026-05-02T12:00:00.000Z"),
    items: [
      {
        productId: "p-2",
        quantity: 1,
        price: decimal(21990),
        product: products[1],
      },
    ],
  },
] as const;

function createService() {
  const prisma = {
    order: {
      findMany: vi.fn().mockResolvedValue(orders),
    },
    product: {
      findMany: vi.fn().mockResolvedValue(products),
    },
  };
  const cache = {
    get: vi.fn().mockResolvedValue(undefined),
    set: vi.fn().mockResolvedValue(undefined),
  };

  return {
    cache,
    prisma,
    service: new AnalyticsService(prisma as never, cache as never),
  };
}

describe("AnalyticsService", () => {
  it("builds dashboard metrics without counting cancelled order revenue", async () => {
    const { cache, service } = createService();

    const dashboard = await service.getDashboard({ dateFrom: "2026-05-01", dateTo: "2026-05-02" });

    expect(dashboard.summary).toMatchObject({
      totalRevenue: 12990,
      totalOrders: 2,
      totalProducts: 2,
      averageOrderValue: 12990,
      completedOrders: 1,
      conversionRevenueShare: 50,
    });
    expect(dashboard.sales).toEqual([{ date: "2026-05-01", revenue: 12990, orders: 1 }]);
    expect(cache.set).toHaveBeenCalledWith(
      JSON.stringify({ dateFrom: "2026-05-01", dateTo: "2026-05-02", categoryId: undefined }),
      dashboard,
    );
  });

  it("uses cached dashboard data before querying Prisma", async () => {
    const { cache, prisma, service } = createService();
    const cachedDashboard = {
      filters: {},
      summary: {
        totalRevenue: 1,
        totalOrders: 1,
        totalProducts: 1,
        averageOrderValue: 1,
        completedOrders: 1,
        conversionRevenueShare: 100,
      },
      sales: [],
      products: [],
      categories: [],
    };
    cache.get.mockResolvedValue(cachedDashboard);

    await expect(service.getDashboard()).resolves.toBe(cachedDashboard);
    expect(prisma.order.findMany).not.toHaveBeenCalled();
    expect(prisma.product.findMany).not.toHaveBeenCalled();
  });
});
