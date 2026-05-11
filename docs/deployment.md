# Деплой проекта

Документ описывает базовый сценарий публикации ВКР-приложения в интернете. Основной вариант - Render Blueprint: один `render.yaml` создает frontend, backend, PostgreSQL и Redis-compatible Key Value.

## Почему Render

- Поддерживает Infrastructure as Code через `render.yaml`.
- Позволяет развернуть static frontend и Node.js backend из одного monorepo.
- Дает managed PostgreSQL и Redis-compatible Key Value рядом с backend.
- Позволяет подключить бесплатный `onrender.com` subdomain или собственный домен.

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
