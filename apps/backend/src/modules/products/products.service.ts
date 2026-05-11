import { Injectable } from "@nestjs/common";
import type { Category, Product } from "@edvs/shared";
import { toCategory, toProduct } from "../../mappers";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      include: { category: true },
      orderBy: [{ createdAt: "desc" }, { name: "asc" }],
    });

    return products.map(toProduct);
  }

  async findCategories(): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    return categories.map(toCategory);
  }
}
