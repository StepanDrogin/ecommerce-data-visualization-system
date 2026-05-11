import { Injectable } from "@nestjs/common";
import type { Order } from "@edvs/shared";
import { orders } from "../../data/demo-data";

@Injectable()
export class OrdersService {
  findAll(): Order[] {
    return orders;
  }
}
