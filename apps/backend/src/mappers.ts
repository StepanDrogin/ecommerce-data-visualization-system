import type {
  Category,
  Order,
  OrderItem,
  OrderStatus as SharedOrderStatus,
  PaymentMethod as SharedPaymentMethod,
  Product,
} from "@edvs/shared";
import type { Category as DbCategory, OrderStatus, PaymentMethod, ProductStatus } from "@prisma/client";

export function toCategory(category: DbCategory): Category {
  return {
    id: category.id,
    name: category.name,
  };
}

export function toProduct(product: {
  id: string;
  name: string;
  categoryId: string;
  category: { name: string };
  price: { toNumber(): number };
  stock: number;
  status: ProductStatus;
  createdAt: Date;
}): Product {
  return {
    id: product.id,
    name: product.name,
    categoryId: product.categoryId,
    categoryName: product.category.name,
    price: product.price.toNumber(),
    stock: product.stock,
    status: product.status.toLowerCase() as Product["status"],
    createdAt: product.createdAt.toISOString(),
  };
}

export function toOrder(order: {
  id: string;
  userId: string;
  user: { name: string };
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  totalAmount: { toNumber(): number };
  createdAt: Date;
  items: Array<{
    productId: string;
    quantity: number;
    price: { toNumber(): number };
    product: {
      name: string;
      categoryId: string;
      category: { name: string };
    };
  }>;
}): Order {
  return {
    id: order.id,
    userId: order.userId,
    customerName: order.user.name,
    status: order.status.toLowerCase() as SharedOrderStatus,
    paymentMethod: order.paymentMethod.toLowerCase() as SharedPaymentMethod,
    totalAmount: order.totalAmount.toNumber(),
    createdAt: order.createdAt.toISOString(),
    items: order.items.map(toOrderItem),
  };
}

function toOrderItem(item: {
  productId: string;
  quantity: number;
  price: { toNumber(): number };
  product: {
    name: string;
    categoryId: string;
    category: { name: string };
  };
}): OrderItem {
  return {
    productId: item.productId,
    productName: item.product.name,
    categoryId: item.product.categoryId,
    categoryName: item.product.category.name,
    quantity: item.quantity,
    price: item.price.toNumber(),
  };
}
