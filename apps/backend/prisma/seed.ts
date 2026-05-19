import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, OrderStatus, PaymentMethod, ProductStatus } from "@prisma/client";

const databaseUrl =
  process.env.DIRECT_URL ??
  process.env.DATABASE_URL ??
  "postgresql://ecommerce:ecommerce@localhost:5432/ecommerce_visualization?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

const categories = [
  { id: "electronics", name: "Электроника" },
  { id: "home", name: "Дом и кухня" },
  { id: "fashion", name: "Одежда" },
  { id: "sport", name: "Спорт" },
  { id: "beauty", name: "Красота" },
];

const users = [
  { id: "u-1", name: "Анна Смирнова", email: "anna@example.com" },
  { id: "u-2", name: "Иван Петров", email: "ivan@example.com" },
  { id: "u-3", name: "Мария Волкова", email: "maria@example.com" },
  { id: "u-4", name: "Олег Кузнецов", email: "oleg@example.com" },
  { id: "u-5", name: "Елена Морозова", email: "elena@example.com" },
  { id: "u-6", name: "Дмитрий Орлов", email: "dmitry@example.com" },
];

const products = [
  { id: "p-1", name: "Умные часы S2", categoryId: "electronics", price: 12990, stock: 42, status: ProductStatus.AVAILABLE },
  { id: "p-2", name: "Кофемашина Про", categoryId: "home", price: 21990, stock: 18, status: ProductStatus.AVAILABLE },
  { id: "p-3", name: "Беспроводные наушники", categoryId: "electronics", price: 7990, stock: 64, status: ProductStatus.AVAILABLE },
  { id: "p-4", name: "Беговая куртка", categoryId: "sport", price: 6490, stock: 31, status: ProductStatus.AVAILABLE },
  { id: "p-5", name: "Базовая толстовка", categoryId: "fashion", price: 3990, stock: 0, status: ProductStatus.OUT_OF_STOCK },
  { id: "p-6", name: "Компактный аэрогриль", categoryId: "home", price: 11490, stock: 27, status: ProductStatus.AVAILABLE },
  { id: "p-7", name: "Коврик для йоги", categoryId: "sport", price: 2490, stock: 73, status: ProductStatus.AVAILABLE },
  { id: "p-8", name: "Набор ухода за кожей", categoryId: "beauty", price: 5490, stock: 36, status: ProductStatus.AVAILABLE },
  { id: "p-9", name: "Подставка для ноутбука", categoryId: "electronics", price: 4590, stock: 55, status: ProductStatus.AVAILABLE },
  { id: "p-10", name: "Свободная футболка", categoryId: "fashion", price: 1990, stock: 80, status: ProductStatus.AVAILABLE },
];

const orderSpecs = [
  { id: "o-1", userId: "u-1", status: OrderStatus.COMPLETED, paymentMethod: PaymentMethod.CARD, createdAt: "2026-05-01T12:30:00.000Z", items: [["p-1", 1], ["p-2", 1]] },
  { id: "o-2", userId: "u-2", status: OrderStatus.COMPLETED, paymentMethod: PaymentMethod.BANK_TRANSFER, createdAt: "2026-05-02T14:10:00.000Z", items: [["p-3", 3]] },
  { id: "o-3", userId: "u-3", status: OrderStatus.PAID, paymentMethod: PaymentMethod.CARD, createdAt: "2026-05-03T09:45:00.000Z", items: [["p-4", 3]] },
  { id: "o-4", userId: "u-4", status: OrderStatus.COMPLETED, paymentMethod: PaymentMethod.CASH, createdAt: "2026-05-04T16:20:00.000Z", items: [["p-1", 2]] },
  { id: "o-5", userId: "u-1", status: OrderStatus.COMPLETED, paymentMethod: PaymentMethod.CARD, createdAt: "2026-05-05T11:00:00.000Z", items: [["p-5", 4]] },
  { id: "o-6", userId: "u-2", status: OrderStatus.CANCELLED, paymentMethod: PaymentMethod.CARD, createdAt: "2026-05-06T13:15:00.000Z", items: [["p-2", 1]] },
  { id: "o-7", userId: "u-3", status: OrderStatus.COMPLETED, paymentMethod: PaymentMethod.BANK_TRANSFER, createdAt: "2026-05-07T15:05:00.000Z", items: [["p-3", 2], ["p-1", 2]] },
  { id: "o-8", userId: "u-5", status: OrderStatus.SHIPPED, paymentMethod: PaymentMethod.CARD, createdAt: "2026-05-08T10:20:00.000Z", items: [["p-6", 1], ["p-7", 2]] },
  { id: "o-9", userId: "u-6", status: OrderStatus.COMPLETED, paymentMethod: PaymentMethod.CARD, createdAt: "2026-05-09T18:40:00.000Z", items: [["p-8", 2], ["p-10", 3]] },
  { id: "o-10", userId: "u-4", status: OrderStatus.COMPLETED, paymentMethod: PaymentMethod.BANK_TRANSFER, createdAt: "2026-05-10T12:05:00.000Z", items: [["p-9", 2], ["p-3", 1]] },
  { id: "o-11", userId: "u-2", status: OrderStatus.PAID, paymentMethod: PaymentMethod.CARD, createdAt: "2026-05-11T09:15:00.000Z", items: [["p-4", 1], ["p-7", 1]] },
  { id: "o-12", userId: "u-5", status: OrderStatus.COMPLETED, paymentMethod: PaymentMethod.CARD, createdAt: "2026-05-01T17:25:00.000Z", items: [["p-8", 1], ["p-10", 2]] },
  { id: "o-13", userId: "u-6", status: OrderStatus.COMPLETED, paymentMethod: PaymentMethod.CARD, createdAt: "2026-05-04T19:10:00.000Z", items: [["p-6", 1]] },
  { id: "o-14", userId: "u-5", status: OrderStatus.SHIPPED, paymentMethod: PaymentMethod.BANK_TRANSFER, createdAt: "2026-05-07T11:45:00.000Z", items: [["p-7", 2], ["p-8", 1]] },
  { id: "o-15", userId: "u-1", status: OrderStatus.COMPLETED, paymentMethod: PaymentMethod.CARD, createdAt: "2026-05-09T20:05:00.000Z", items: [["p-1", 1]] },
  { id: "o-16", userId: "u-6", status: OrderStatus.PAID, paymentMethod: PaymentMethod.CARD, createdAt: "2026-05-10T15:35:00.000Z", items: [["p-10", 3]] },
] as const;

async function main() {
  const existingOrders = await prisma.order.count();
  const shouldForceSeed = process.env.FORCE_SEED === "true";

  if (existingOrders > 0 && !shouldForceSeed) {
    console.info(`Seed skipped: database already contains ${existingOrders} orders. Set FORCE_SEED=true to reset demo data.`);
    return;
  }

  if (shouldForceSeed) {
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
  }

  await prisma.category.createMany({ data: categories });
  await prisma.user.createMany({ data: users });
  await prisma.product.createMany({
    data: products.map((product) => ({
      ...product,
      price: product.price,
      createdAt: new Date("2026-04-10T10:00:00.000Z"),
    })),
  });

  const productById = new Map(products.map((product) => [product.id, product]));

  for (const orderSpec of orderSpecs) {
    const items = orderSpec.items.map(([productId, quantity]) => {
      const product = productById.get(productId);
      if (!product) {
        throw new Error(`Unknown product in seed: ${productId}`);
      }

      return {
        productId,
        quantity,
        price: product.price,
      };
    });
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    await prisma.order.create({
      data: {
        id: orderSpec.id,
        userId: orderSpec.userId,
        status: orderSpec.status,
        paymentMethod: orderSpec.paymentMethod,
        totalAmount,
        createdAt: new Date(orderSpec.createdAt),
        items: {
          create: items,
        },
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
