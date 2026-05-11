import { Injectable } from "@nestjs/common";
import type { Product } from "@edvs/shared";

@Injectable()
export class ProductsService {
  findAll(): Product[] {
    return [
      {
        id: "p-1",
        name: "Smart Watch S2",
        category: "Electronics",
        price: 12990,
        stock: 42,
        createdAt: "2026-05-01T10:00:00.000Z",
      },
      {
        id: "p-2",
        name: "Coffee Machine Pro",
        category: "Home",
        price: 21990,
        stock: 18,
        createdAt: "2026-05-02T10:00:00.000Z",
      },
    ];
  }
}
