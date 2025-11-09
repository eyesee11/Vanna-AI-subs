# Analytics Platform (Rocket Emoji) (Just for an internship)

A full-stack invoice analytics platform with AI-powered data querying capabilities. Features a pixel-perfect dashboard UI, real-time data processing, and natural language SQL generation.

## ✨ Features

### Dashboard

- 📊 Interactive charts and visualizations (Recharts)
- 📈 Real-time financial metrics and KPIs
- 🎨 Pixel-perfect UI with Tailwind CSS
- 🧩 Reusable shadcn UI components
- 📱 Fully responsive design
- 🔍 Searchable, sortable invoice table

### AI Chat

- 💬 Natural language to SQL queries
- 🤖 Powered by Vanna AI + Groq
- 📊 Auto-generate visualizations from query results
- 💾 View and download query results

### Backend

- ⚡ Fast Express.js API
- 🗄️ PostgreSQL with Prisma ORM
- 🔐 RESTful API architecture
- 📦 Fully typed with TypeScript

## 🏗️ Tech Stack

### Frontend

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn UI
- **Charts:** Recharts
- **Icons:** Lucide React

### Backend

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Language:** TypeScript

### AI Layer

- **Framework:** Python FastAPI
- **AI Engine:** Vanna AI
- **LLM Provider:** Groq
- **Vector Store:** ChromaDB

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Python 3.10+ (for AI features)
- npm or pnpm

### ⚠️ IMPORTANT: Before You Begin

**You must have the `Analytics_Test_Data.json` file and place it in the `public/` folder!**

### Installation

**Quick Setup:**

1. **Setup PostgreSQL:**

```bash
# Create database
psql -U postgres
CREATE DATABASE buchhaltung;
\q
```

2. **Setup Backend:**

```bash
cd apps/api
npm install
cp .env.example .env
# Edit .env with your PostgreSQL credentials
npm run db:generate
npm run db:push
npm run db:seed
```

3. **Run Development Servers:**

```bash
# Terminal 1 - Backend
cd apps/api && npm run dev

# Terminal 2 - Frontend
npm run dev
```

4. **Access the application:**

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### 🤖 Optional: Setup AI Chat (Vanna AI)

## 📁 Project Structure

```
Flowbitai/
├── apps/
│   ├── web/                # Next.js frontend
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   └── api/                # Express.js backend
│       ├── src/
│       │   ├── routes/     # API endpoints
│       │   ├── lib/        # Database client
│       │   └── scripts/    # Seeding scripts
│       └── prisma/
│           └── schema.prisma
├── vanna-ai/               # Python FastAPI server
│   ├── main.py
│   └── requirements.txt
├── public/
│   └── Analytics_Test_Data.json  ⚠️ ADD THIS FILE
```

See [PROJECT_STATUS.md](./PROJECT_STATUS.md) for detailed file organization.

## 📊 API Endpoints

| Endpoint          | Method | Description              |
| ----------------- | ------ | ------------------------ |
| `/stats`          | GET    | Overview card statistics |
| `/invoice-trends` | GET    | Monthly invoice trends   |
| `/vendors/top10`  | GET    | Top 10 vendors by spend  |
| `/category-spend` | GET    | Spend by category        |
| `/cash-outflow`   | GET    | Cash outflow forecast    |
| `/invoices`       | GET    | Paginated invoices list  |
| `/chat-with-data` | POST   | Natural language queries |

## � CORS & Browser Troubleshooting

If you ever get 404 errors in the browser for API endpoints (but everything works in Postman or terminal), it's probably just a CORS config or browser cache thing—don't panic!

**Solution:**

Check your Express server's CORS setup in [`apps/api/src/index.ts`](./apps/api/src/index.ts). For local development, make sure you always allow your frontend origin (usually `http://localhost:3000`).

Here's a recommended CORS config:

```typescript
const allowedOrigins = [
  "http://localhost:3000", // Local development
  process.env.FRONTEND_URL || "", // Production URL from env
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        process.env.NODE_ENV === "development"
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
```

- After updating, restart your API server.
- Try clearing your browser cache or using a private window if you still see issues.
- If you deploy to production, set `FRONTEND_URL` in your `.env` to your actual frontend URL.

**TL;DR:**

- 404s in browser = probably CORS or cache.
- Check `index.ts` for CORS config.
- Restart server & clear cache.

## �🗄️ Database Schema

- **vendors** - Vendor information and contacts
- **customers** - Customer details
- **invoices** - Invoice headers with amounts and status
- **line_items** - Individual invoice line items
- **payments** - Payment records and history

## 📚 Documentation

## 🚢 Deployment

### Vercel (Frontend + Backend)

```bash
vercel --prod
```

### Vanna AI (Render/Railway/Fly.io)

Use the provided `vanna-ai/Dockerfile` for containerized deployment.

## 🎯 Current Status

✅ **Phase 1-2 Complete:**

- Monorepo structure
- PostgreSQL schema with Prisma
- All backend API endpoints
- Data seeding functionality

⏳ **Phase 3-5 To Do:**

- Update frontend to use real APIs
- Create chat interface
- Setup Vanna AI integration

See [PROJECT_STATUS.md](./PROJECT_STATUS.md) for details.

## 📝 License

MIT
