This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Docker

| Item | Value |
|---|---|
| Framework | Next.js 16 |
| Language | TypeScript |
| Database | PostgreSQL |
| DB mode for Docker | `DB_DRIVER=postgres-js` |
| Exposed app port | `3000` |

### Prerequisites

* Docker Engine with Compose support.
* The compose file uses [`.env.example`](.env.example) as defaults.

### Local development with Docker

1. Review or copy the example env file if you want custom values.

```bash
cp .env.example .env.local
```

2. Start the stack.

```bash
docker compose up -d --build
```

3. Open the app.

```bash
http://localhost:3000
```

4. Stop the stack.

```bash
docker compose down
```

5. Remove the database volume if you want a fresh start.

```bash
docker compose down -v
```

### Production image

Build the image:

```bash
docker build -t amt-express:1.0.0 .
```

Run it with external secrets:

```bash
docker run -p 3000:3000 \
	--env-file .env.local \
	amt-express:1.0.0
```

For a remote Neon database, keep `DATABASE_URL` pointed at Neon and set `DB_DRIVER=neon-http`.

### Notes

* The local PostgreSQL container loads the SQL migrations found in `drizzle/` on first start.
* The app image runs as a non-root user.
* The container exposes a healthcheck on `http://127.0.0.1:3000`.
