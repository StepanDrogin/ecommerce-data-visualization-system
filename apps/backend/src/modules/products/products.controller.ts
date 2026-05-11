import { Controller, Get } from "@nestjs/common";
import type { Category, Product } from "@edvs/shared";
import { ProductsService } from "./products.service";

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(): Promise<Product[]> {
    return this.productsService.findAll();
  }

  @Get("categories")
  findCategories(): Promise<Category[]> {
    return this.productsService.findCategories();
  }
}
