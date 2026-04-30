# Supers Backend

TypeScript REST API with Express, Prisma, PostgreSQL, and JWT-based auth.

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

Postgres for this app is exposed on **host port 5435** (see `docker-compose.yml`) so it does not collide with another PostgreSQL you may already have on **5432** (common on macOS). Prisma connects via `DATABASE_URL` in `.env`.

```bash
cp .env.example .env
npm install
docker compose up -d db
npm run prisma:migrate
npm run dev
```

## Docker

```bash
docker compose up --build
```

Before production use, replace the JWT secrets and database credentials.
