import { Injectable } from "@nestjs/common";
import type { Order } from "@edvs/shared";

@Injectable()
export class OrdersService {
  findAll(): Order[] {
    return [
      {
        id: "o-1",
        customerName: "Demo Customer",
        status: "completed",
        totalAmount: 34980,
        createdAt: "2026-05-04T12:30:00.000Z",
        items: [
          {
            productId: "p-1",
            productName: "Smart Watch S2",
            quantity: 1,
            price: 12990,
          },
          {
            productId: "p-2",
            productName: "Coffee Machine Pro",
            quantity: 1,
            price: 21990,
          },
        ],
      },
    ];
  }
}
