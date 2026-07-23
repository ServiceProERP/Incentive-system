# Servyn — Technician Incentive System

A standalone web app for CST (Customer Service Team) to manually enter job data and auto-calculate technician incentive payouts based on the Servyn point framework.

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend + API | Next.js 14 (App Router) |
| Database | Supabase (PostgreSQL) |
| ORM | Prisma |
| Deployment | Vercel |
| Styling | Tailwind CSS |

---

## Folder structure

```
servyn-incentive/
├── prisma/
│   ├── schema.prisma        # All DB models
│   └── seed.ts              # Sample technicians
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── jobs/        # GET list, POST create, PATCH/DELETE by id
│   │   │   ├── technicians/ # GET list, POST create
│   │   │   ├── months/      # POST compute rollup, GET summaries
│   │   │   │   └── [id]/approve/  # POST approve
│   │   │   └── dashboard/   # GET stats for current month
│   │   ├── dashboard/       # Overview page
│   │   ├── jobs/
│   │   │   └── new/         # Add job form (main CST data-entry screen)
│   │   ├── technicians/     # Manage technician roster
│   │   └── months/          # Month-end compute + approve payouts
│   ├── components/
│   │   └── ui/
│   │       └── Sidebar.tsx
│   ├── lib/
│   │   ├── prisma.ts        # Singleton Prisma client
│   │   └── scoring.ts       # ⭐ Core scoring engine — all point logic here
│   └── types/
│       └── index.ts
├── .env.example
├── vercel.json
└── README.md
```

---

## Local setup

### 1. Clone and install

```bash
git clone <your-repo>
cd servyn-incentive
npm install
```

### 2. Create Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. Note your project password
3. Go to **Settings → Database → Connection strings**
4. Copy the **Transaction pooler** string (port 6543) → `DATABASE_URL`
5. Copy the **Session pooler** string (port 5432) → `DIRECT_URL`

### 3. Set env variables

```bash
cp .env.example .env.local
# Edit .env.local with your Supabase strings
```

### 4. Push schema to Supabase

```bash
npm run db:push
```

### 5. Seed sample data (optional)

```bash
npm run db:seed
```

### 6. Run locally

```bash
npm run dev
# Open http://localhost:3000
```

---

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init && git add . && git commit -m "init"
gh repo create servyn-incentive --private --source=. --push
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) → Add New → Project
2. Import your GitHub repo
3. Add environment variables:
   - `DATABASE_URL` — Transaction pooler from Supabase
   - `DIRECT_URL` — Session pooler from Supabase
4. Deploy

---

## How the scoring works

All scoring logic lives in `src/lib/scoring.ts` — pure TypeScript, no DB calls.

### Per-job scoring

| Parameter | What it measures |
|-----------|-----------------|
| Deadline performance | Met / missed / early (bonus) |
| Parts used | Low cost = more pts (rewards smart diagnosis) |
| Fix attempt | First time fix beats rework |
| Acceptance speed | Auto-bonus for fast job pickup |
| Volume bonus | +5 per extra job after 3rd in a day |
| No waste bonus | +8 if parts ordered = parts used |
| Reopen penalty | −15 if job reopened within 72h |

**Floor rule:** A single job total can never go below 0.

### Month-end rollup

1. Sum all job points
2. Cap deductions at 30% of gross points
3. Determine tier → multiplier
4. `Incentive = netPoints × ₹rate × multiplier`

| Tier | Net Points | Multiplier |
|------|-----------|------------|
| No incentive | < 200 | — |
| Standard | 200–499 | 1.0× |
| High Performer | 500–799 | 1.2× |
| Star Performer | 800+ | 1.5× |

---

## CST workflow (day-to-day)

1. **Add technicians** once in `/technicians`
2. **Add job** in `/jobs/new` after each job is completed — see live score preview as you fill the form
3. **End of month** → go to `/months`, set ₹ rate, click **Compute**
4. Review each row → click **Approve** → incentive is locked for payroll

---

## Customising point values

All point tables are in `src/lib/scoring.ts` as plain objects — change numbers there and the whole app updates.

```ts
const PARTS_POINTS = {
  A: { LOW: 20, MEDIUM: 12, HIGH: 5 },  // ← edit here
  ...
}
```
