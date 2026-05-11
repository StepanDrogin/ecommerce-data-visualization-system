export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  createdAt: string;
};

export type OrderStatus = "created" | "paid" | "shipped" | "completed" | "cancelled";

export type OrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: string;
  customerName: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
};

export type AnalyticsSummary = {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  averageOrderValue: number;
};

export type SalesPoint = {
  date: string;
  revenue: number;
  orders: number;
};

export type ProductAnalyticsItem = {
  productId: string;
  productName: string;
  category: string;
  revenue: number;
  unitsSold: number;
};
