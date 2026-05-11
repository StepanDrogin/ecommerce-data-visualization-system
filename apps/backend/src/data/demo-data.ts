import type { Category, Order, Product, User } from "@edvs/shared";

export const categories: Category[] = [
  { id: "electronics", name: "Электроника" },
  { id: "home", name: "Дом и кухня" },
  { id: "fashion", name: "Одежда" },
  { id: "sport", name: "Спорт" },
];

export const users: User[] = [
  { id: "u-1", name: "Анна Смирнова", email: "anna@example.com" },
  { id: "u-2", name: "Иван Петров", email: "ivan@example.com" },
  { id: "u-3", name: "Мария Волкова", email: "maria@example.com" },
  { id: "u-4", name: "Олег Кузнецов", email: "oleg@example.com" },
];

export const products: Product[] = [
  {
    id: "p-1",
    name: "Smart Watch S2",
    categoryId: "electronics",
    categoryName: "Электроника",
    price: 12990,
    stock: 42,
    status: "available",
    createdAt: "2026-04-10T10:00:00.000Z",
  },
  {
    id: "p-2",
    name: "Coffee Machine Pro",
    categoryId: "home",
    categoryName: "Дом и кухня",
    price: 21990,
    stock: 18,
    status: "available",
    createdAt: "2026-04-12T10:00:00.000Z",
  },
  {
    id: "p-3",
    name: "Wireless Headphones",
    categoryId: "electronics",
    categoryName: "Электроника",
    price: 7990,
    stock: 64,
    status: "available",
    createdAt: "2026-04-16T10:00:00.000Z",
  },
  {
    id: "p-4",
    name: "Running Jacket",
    categoryId: "sport",
    categoryName: "Спорт",
    price: 6490,
    stock: 31,
    status: "available",
    createdAt: "2026-04-18T10:00:00.000Z",
  },
  {
    id: "p-5",
    name: "Classic Hoodie",
    categoryId: "fashion",
    categoryName: "Одежда",
    price: 3990,
    stock: 0,
    status: "out_of_stock",
    createdAt: "2026-04-20T10:00:00.000Z",
  },
];

export const orders: Order[] = [
  {
    id: "o-1",
    userId: "u-1",
    customerName: "Анна Смирнова",
    status: "completed",
    paymentMethod: "card",
    totalAmount: 34980,
    createdAt: "2026-05-01T12:30:00.000Z",
    items: [
      { productId: "p-1", productName: "Smart Watch S2", categoryId: "electronics", categoryName: "Электроника", quantity: 1, price: 12990 },
      { productId: "p-2", productName: "Coffee Machine Pro", categoryId: "home", categoryName: "Дом и кухня", quantity: 1, price: 21990 },
    ],
  },
  {
    id: "o-2",
    userId: "u-2",
    customerName: "Иван Петров",
    status: "completed",
    paymentMethod: "bank_transfer",
    totalAmount: 23970,
    createdAt: "2026-05-02T14:10:00.000Z",
    items: [
      { productId: "p-3", productName: "Wireless Headphones", categoryId: "electronics", categoryName: "Электроника", quantity: 3, price: 7990 },
    ],
  },
  {
    id: "o-3",
    userId: "u-3",
    customerName: "Мария Волкова",
    status: "paid",
    paymentMethod: "card",
    totalAmount: 19470,
    createdAt: "2026-05-03T09:45:00.000Z",
    items: [
      { productId: "p-4", productName: "Running Jacket", categoryId: "sport", categoryName: "Спорт", quantity: 3, price: 6490 },
    ],
  },
  {
    id: "o-4",
    userId: "u-4",
    customerName: "Олег Кузнецов",
    status: "completed",
    paymentMethod: "cash",
    totalAmount: 25980,
    createdAt: "2026-05-04T16:20:00.000Z",
    items: [
      { productId: "p-1", productName: "Smart Watch S2", categoryId: "electronics", categoryName: "Электроника", quantity: 2, price: 12990 },
    ],
  },
  {
    id: "o-5",
    userId: "u-1",
    customerName: "Анна Смирнова",
    status: "completed",
    paymentMethod: "card",
    totalAmount: 15960,
    createdAt: "2026-05-05T11:00:00.000Z",
    items: [
      { productId: "p-5", productName: "Classic Hoodie", categoryId: "fashion", categoryName: "Одежда", quantity: 4, price: 3990 },
    ],
  },
  {
    id: "o-6",
    userId: "u-2",
    customerName: "Иван Петров",
    status: "cancelled",
    paymentMethod: "card",
    totalAmount: 21990,
    createdAt: "2026-05-06T13:15:00.000Z",
    items: [
      { productId: "p-2", productName: "Coffee Machine Pro", categoryId: "home", categoryName: "Дом и кухня", quantity: 1, price: 21990 },
    ],
  },
  {
    id: "o-7",
    userId: "u-3",
    customerName: "Мария Волкова",
    status: "completed",
    paymentMethod: "bank_transfer",
    totalAmount: 41940,
    createdAt: "2026-05-07T15:05:00.000Z",
    items: [
      { productId: "p-3", productName: "Wireless Headphones", categoryId: "electronics", categoryName: "Электроника", quantity: 2, price: 7990 },
      { productId: "p-1", productName: "Smart Watch S2", categoryId: "electronics", categoryName: "Электроника", quantity: 2, price: 12990 },
    ],
  },
];
