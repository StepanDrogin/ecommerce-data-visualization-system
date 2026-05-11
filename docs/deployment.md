# Деплой проекта

Документ описывает базовый сценарий публикации ВКР-приложения в интернете. Основной вариант без привязки карты - Vercel для frontend и serverless backend, а PostgreSQL подключается как внешний managed-сервис через `DATABASE_URL`. Render Blueprint оставлен как альтернативный вариант, но managed PostgreSQL/Redis в Render может потребовать billing-профиль.

## Вариант без карты: Vercel + внешний PostgreSQL

### Что уже подготовлено

- `vercel.json` в корне репозитория.
- `api/index.ts` поднимает NestJS как Vercel Function.
- Frontend собирается в `apps/frontend/dist`.
- Frontend обращается к backend через относительный путь `/api`.
- Redis в production опционален: если `REDIS_URL` не задан, backend использует in-memory fallback cache.
- Prisma Client генерируется на этапе build.
- Prisma migrations и безопасный seed запускаются в `vercel:build`.

### Переменные Vercel

В Vercel нужно добавить переменные для Production:

```text
DATABASE_URL=postgresql://...
VITE_API_URL=/api
FRONTEND_URL=https://your-project.vercel.app
FRONTEND_URLS=https://your-project.vercel.app
ALLOW_VERCEL_SUBDOMAINS=true
ALLOW_RENDER_SUBDOMAINS=false
NODE_ENV=production
```

`REDIS_URL` можно не задавать на первом деплое.

### Порядок деплоя на Vercel

1. Создать бесплатную PostgreSQL-базу в Supabase или Neon.
2. Скопировать connection string и добавить его в Vercel как `DATABASE_URL`.
3. В Vercel открыть **Add New -> Project**.
4. Выбрать GitHub-репозиторий `StepanDrogin/ecommerce-data-visualization-system`.
5. Framework Preset оставить **Other**.
6. Build Command оставить из `vercel.json`: `npm run vercel:build`.
7. Output Directory оставить из `vercel.json`: `apps/frontend/dist`.
8. Нажать **Deploy**.
9. После деплоя проверить:

```text
https://your-project.vercel.app
https://your-project.vercel.app/api/health
https://your-project.vercel.app/api/products
```

## Альтернативный вариант: Render

## Почему Render

- Поддерживает Infrastructure as Code через `render.yaml`.
- Позволяет развернуть static frontend и Node.js backend из одного monorepo.
- Дает managed PostgreSQL и Redis-compatible Key Value рядом с backend.
- Позволяет подключить бесплатный `onrender.com` subdomain или собственный домен.
- Для managed PostgreSQL/Redis может потребоваться billing-профиль.

## Что уже подготовлено

- `render.yaml` в корне репозитория.
- `/health` endpoint на backend для health-check.
- Backend слушает `process.env.PORT`, как ожидают PaaS-платформы.
- CORS поддерживает `FRONTEND_URL`, `FRONTEND_URLS` и Render subdomains.
- Prisma Client генерируется на этапе сборки backend-сервиса.
- Prisma migrations и seed запускаются перед стартом backend-сервиса, потому что `preDeployCommand` недоступен на free tier Render.
- `.env.production.example` содержит production-переменные.

## Сервисы в Render Blueprint

```text
edvs-frontend  Static Site  React + Vite build
edvs-backend   Web Service  NestJS REST API
edvs-postgres  PostgreSQL   база данных приложения
edvs-redis     Key Value    Redis-compatible cache
```

## Порядок деплоя

1. Запушить репозиторий в GitHub.
2. В Render открыть **New -> Blueprint** или перейти по кнопке **Deploy to Render** из `README.md`.
3. Выбрать репозиторий с проектом.
4. Render обнаружит `render.yaml` и предложит создать сервисы.
5. После создания проверить URL:

```text
https://edvs-frontend.onrender.com
https://edvs-backend.onrender.com/health
```

Прямая ссылка для запуска Blueprint: <https://render.com/deploy?repo=https://github.com/StepanDrogin/ecommerce-data-visualization-system>.

В `render.yaml` используется `npm ci --include=dev`, потому что на этапе сборки и запуска нужны TypeScript, Nest CLI, Prisma CLI и seed runner.

Если Render изменит имена сервисов или subdomain, нужно обновить:

- `VITE_API_URL` у `edvs-frontend`
- `FRONTEND_URL` и `FRONTEND_URLS` у `edvs-backend`

## Переменные окружения

### Backend

```text
NODE_ENV=production
DATABASE_URL=<Render PostgreSQL connection string>
REDIS_URL=<Render Key Value connection string>
FRONTEND_URL=https://edvs-frontend.onrender.com
FRONTEND_URLS=https://edvs-frontend.onrender.com,https://your-domain.example
ALLOW_RENDER_SUBDOMAINS=true
```

### Frontend

```text
VITE_API_URL=https://edvs-backend.onrender.com
```

## Подключение домена

Можно оставить бесплатные адреса Render или подключить собственный домен.

Рекомендуемая схема:

```text
app.example.com -> frontend static site
api.example.com -> backend web service
```

После подключения домена нужно:

1. В Render добавить custom domain для frontend и backend.
2. У DNS-провайдера создать записи, которые покажет Render.
3. Дождаться проверки домена и выпуска TLS-сертификата.
4. Обновить переменные окружения:

```text
VITE_API_URL=https://api.example.com
FRONTEND_URL=https://app.example.com
FRONTEND_URLS=https://app.example.com
```

## Данные и миграции

Backend работает через Prisma и PostgreSQL. При деплое выполняются:

```bash
npm run prisma:migrate -w @edvs/backend
npm run prisma:seed -w @edvs/backend
```

Seed наполняет базу демонстрационными категориями, товарами, пользователями, заказами и позициями заказов, чтобы dashboard был готов к защите сразу после публикации.
Если в базе уже есть заказы, seed не очищает данные. Для принудительного пересоздания demo-набора можно задать `FORCE_SEED=true`.

## Важное ограничение текущего этапа

Seed-данные предназначены для академической демонстрации. Для промышленного режима нужно заменить seed на импорт реальных e-commerce данных и добавить отдельную политику обновления витрин.
