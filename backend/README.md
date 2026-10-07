```txt
npm install
npm run dev
```

```txt
npm run deploy
```

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiating `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```

cd /home/jeet/projects/freelancing/dreamkey-crm/backend

# Regenerate TypeScript types for PrismaClient
npx prisma generate
# or
npm run prisma:generate

# Push schema changes to your Neon database
npx prisma db push
