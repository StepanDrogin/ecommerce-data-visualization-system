# ecommerce-data-visualization-system

Research and development of an interactive data visualization system for product and order analytics in e-commerce.

## Назначение проекта

Проект разрабатывается в рамках ВКР на тему:

> Исследование и разработка системы интерактивной визуализации данных о товарах и заказах в e-commerce.

Цель системы - предоставить веб-интерфейс для анализа товарных и заказных данных электронной коммерции с помощью интерактивных графиков, агрегированных показателей и REST API.

## Технологический стек

- Frontend: React, TypeScript, Vite, CSS Modules
- Backend: NestJS, TypeScript, REST API
- База данных: PostgreSQL
- ORM: Prisma
- Кэширование: Redis
- Визуализация данных: Apache ECharts
- Инфраструктура: Docker, Docker Compose
- Управление пакетами: npm workspaces

## Архитектура

Репозиторий организован как монорепозиторий:

```text
apps/
  frontend/   React-приложение для интерактивного аналитического дашборда
  backend/    NestJS API для данных о товарах, заказах и аналитике
packages/
  shared/     Общие TypeScript-типы для frontend и backend
docker/       Инфраструктурные материалы
docs/         Документация по архитектуре и ВКР-контексту
```

Основные доменные области:

- `products` - товары и показатели по товарному каталогу
- `orders` - заказы и связанные позиции
- `analytics` - агрегированные данные для визуализации

## REST API

На первом этапе заложены следующие endpoints:

```text
GET /products
GET /orders
GET /analytics/summary
GET /analytics/sales
GET /analytics/products
```

Пока endpoints возвращают демонстрационные данные. На следующих этапах они будут подключены к PostgreSQL через Prisma и дополнены кэшированием Redis.

## Локальный запуск

### 1. Установка зависимостей

```bash
npm install
```

### 2. Переменные окружения

Скопируйте `.env.example` в `.env` и при необходимости измените значения:

```bash
cp .env.example .env
```

### 3. Инфраструктура

```bash
docker compose up -d postgres redis
```

### 4. Запуск backend

```bash
npm run dev:backend
```

Backend по умолчанию доступен на `http://localhost:3000`.

### 5. Запуск frontend

```bash
npm run dev:frontend
```

Frontend по умолчанию доступен на `http://localhost:5173`.

## Скрипты

```bash
npm run build          # сборка всех workspace-пакетов
npm run dev:frontend   # запуск frontend
npm run dev:backend    # запуск backend
npm run prisma:generate # генерация Prisma Client
```

## Связь с ВКР

Проект демонстрирует практическую часть ВКР: разработку веб-системы, которая объединяет сбор, обработку и интерактивную визуализацию данных о товарах и заказах. Архитектура разделяет пользовательский интерфейс, серверный API, слой данных и общие типы, что позволяет использовать проект как прикладной результат исследования.
