# Supers Backend

TypeScript REST API with Express, Prisma, PostgreSQL, and JWT-based auth.

## Tech Stack

- Node.js + TypeScript
- Express
- Prisma
- PostgreSQL (Docker Compose)
- JWT auth

## Endpoints

- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me` with `Authorization: Bearer <accessToken>`
- `GET /super` list available supers from DB
- `POST /super/:superId/scrape` launch parser stub for a specific super

## Local Development

Postgres for this app is exposed on **host port 5435** (see `docker-compose.yml`) so it does not collide with another PostgreSQL that may already be running on **5432**. Prisma connects via `DATABASE_URL` in `.env`.

```bash
cp .env.example .env
npm install
docker compose up -d db
npm run prisma:migrate
npm run dev
```

API base URL: `http://localhost:4000`

## Useful Scripts

- `npm run dev` start backend in watch mode
- `npm run build` compile TypeScript
- `npm run start` run compiled app from `dist`
- `npm run lint` type-check with TypeScript
- `npm run prisma:migrate` run Prisma migrations
- `npm run prisma:generate` generate Prisma client
- `npm run prisma:studio` open Prisma Studio

## Docker

```bash
docker compose up --build
```

Before production use, replace the JWT secrets and database credentials.
