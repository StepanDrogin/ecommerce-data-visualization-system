import { Injectable } from "@nestjs/common";
import type { Category, Product } from "@edvs/shared";
import { categories, products } from "../../data/demo-data";

@Injectable()
export class ProductsService {
  findAll(): Product[] {
    return products;
  }

  findCategories(): Category[] {
    return categories;
  }
}
