import { describe, expect, it } from "vitest";
import { toOrder, toProduct } from "./mappers";

function decimal(value: number) {
  return {
    toNumber: () => value,
  };
}

describe("mappers", () => {
  it("maps a Prisma product into shared Product DTO", () => {
    expect(
      toProduct({
        id: "p-1",
        name: "Smart Watch",
        categoryId: "electronics",
        category: { name: "Электроника" },
        price: decimal(12990),
        stock: 12,
        status: "AVAILABLE",
        createdAt: new Date("2026-05-01T10:00:00.000Z"),
      }),
    ).toEqual({
      id: "p-1",
      name: "Smart Watch",
      categoryId: "electronics",
      categoryName: "Электроника",
      price: 12990,
      stock: 12,
      status: "available",
      createdAt: "2026-05-01T10:00:00.000Z",
    });
  });

  it("maps an order with nested items into shared Order DTO", () => {
    expect(
      toOrder({
        id: "o-1",
        userId: "u-1",
        user: { name: "Анна Смирнова" },
        status: "COMPLETED",
        paymentMethod: "CARD",
        totalAmount: decimal(20980),
        createdAt: new Date("2026-05-01T12:00:00.000Z"),
        items: [
          {
            productId: "p-1",
            quantity: 2,
            price: decimal(10490),
            product: {
              name: "Wireless Headphones",
              categoryId: "electronics",
              category: { name: "Электроника" },
            },
          },
        ],
      }),
    ).toMatchObject({
      id: "o-1",
      customerName: "Анна Смирнова",
      status: "completed",
      paymentMethod: "card",
      totalAmount: 20980,
      items: [
        {
          productName: "Wireless Headphones",
          categoryName: "Электроника",
          quantity: 2,
          price: 10490,
        },
      ],
    });
  });
});
