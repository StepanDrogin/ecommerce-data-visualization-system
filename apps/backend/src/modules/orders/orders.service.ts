import { Injectable } from "@nestjs/common";
import type { Order } from "@edvs/shared";
import { toOrder } from "../../mappers";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
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
      orderBy: { createdAt: "desc" },
    });

    return orders.map(toOrder);
  }
}
