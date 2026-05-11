export type Product = {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  price: number;
  stock: number;
  status: "available" | "out_of_stock" | "archived";
  createdAt: string;
};

export type Category = {
  id: string;
  name: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
};

export type OrderStatus = "created" | "paid" | "shipped" | "completed" | "cancelled";
export type PaymentMethod = "card" | "cash" | "bank_transfer";

export type OrderItem = {
  productId: string;
  productName: string;
  categoryId: string;
  categoryName: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: string;
  userId: string;
  customerName: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
};

export type AnalyticsFilters = {
  dateFrom?: string;
  dateTo?: string;
  categoryId?: string;
};

export type AnalyticsSummary = {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  averageOrderValue: number;
  completedOrders: number;
  conversionRevenueShare: number;
};

export type SalesPoint = {
  date: string;
  revenue: number;
  orders: number;
};

export type ProductAnalyticsItem = {
  productId: string;
  productName: string;
  categoryId: string;
  categoryName: string;
  revenue: number;
  unitsSold: number;
};

export type CategoryAnalyticsItem = {
  categoryId: string;
  categoryName: string;
  revenue: number;
  unitsSold: number;
};

export type AnalyticsDashboardResponse = {
  filters: AnalyticsFilters;
  summary: AnalyticsSummary;
  sales: SalesPoint[];
  products: ProductAnalyticsItem[];
  categories: CategoryAnalyticsItem[];
};
