# Cursor Business Manager

A modern web application for business management built with Next.js, TypeScript, and Prisma. Powered by Cursor AI.

## 🚀 Features

- 📦 **Complete order management** - Advanced order system with multi-line materials
- 🏢 **Customer administration** - Full customer and supplier control
- 🚚 **Shipping and logistics** - Multiple transporters per order
- 📊 **Dashboard with metrics** - Real-time data visualization with interactive charts
- 💰 **Commission system** - Automatic commission calculations by payment method
- 🤖 **AI-powered chat assistant** - Intelligent chatbot that queries your database
- 🎨 **Modern UI** - Dark theme with glassmorphism and smooth animations
- 🔐 **Secure authentication** - Role-based access (superadmin, admin, employee)

## 🛠 Technologies

- **Frontend**: Next.js 14.2, React 18, TypeScript 5
- **Styling**: Tailwind CSS, shadcn/ui, Framer Motion
- **Database**: PostgreSQL (production) / SQLite (local dev)
- **ORM**: Prisma 6.7
- **Authentication**: NextAuth.js 4.24
- **AI**: OpenAI GPT-4, Vercel AI SDK
- **Charts**: Recharts, Chart.js
- **Deployment**: Vercel (optimized)

## 📦 Quick Start - Local Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/piraterobertstmv/azulejera.git
   cd azulejera
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file:
   ```bash
   # For local development with SQLite
   DATABASE_URL="file:./dev.db"
   DIRECT_URL="file:./dev.db"
   
   NEXTAUTH_URL="http://localhost:3004"
   NEXTAUTH_SECRET="your-secret-key-here"
   NODE_ENV="development"
   OPENAI_API_KEY="sk-your-openai-key"
   ```

4. **Initialize database**
   ```bash
   npx prisma generate
   npx prisma db push
   npm run seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Access the app**
   - Open http://localhost:3004
   - Login: `superadmin@cursor.manager` / `superadmin123`

## 🚀 Production Deployment

Ready to deploy to Vercel? See our comprehensive guide:

**👉 [DEPLOYMENT.md](./DEPLOYMENT.md)** for detailed instructions

Quick summary:
1. Set up PostgreSQL (Vercel Postgres, Neon, or Supabase)
2. Configure environment variables in Vercel
3. Push to GitHub (auto-deploys)
4. Run database migrations
5. You're live! 🎉

## 📂 Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── pedidos/           # Orders pages
│   ├── admin/             # Admin panel
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── admin/            # Admin components
│   ├── dashboard.tsx     # Main dashboard
│   ├── sidebar.tsx       # Navigation sidebar
│   └── chat-widget.tsx   # AI chatbot
├── lib/                   # Utilities
│   ├── auth.ts           # NextAuth config
│   ├── db.ts             # Prisma client
│   └── types.ts          # TypeScript types
├── prisma/               # Database
│   ├── schema.prisma     # Database schema
│   └── dev.db           # SQLite (local only)
├── scripts/              # Utility scripts
│   ├── seed.ts          # Database seeding
│   └── import-pedidos.ts # Bulk import
└── public/               # Static files
```

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 3004) |
| `npm run build` | Build for production (includes Prisma generate & migrate) |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run seed` | Seed database with initial data |
| `npm run import` | Bulk import orders from JSON |

## 🔐 Default Users (After Seeding)

| Email | Password | Role |
|-------|----------|------|
| `superadmin@cursor.manager` | `superadmin123` | superadmin |
| `empleado@cursor.manager` | `empleado123` | empleado |

**⚠️ Change passwords immediately in production!**

## 🎨 Key Features

### AI Chatbot
- Natural language queries to your database
- Ask "¿Cuántos pedidos tenemos?" or "¿Qué proveedores tenemos?"
- Powered by OpenAI GPT-4
- Always responds in Spanish

### Dashboard Analytics
- Real-time revenue calculations
- Interactive charts (Bar, Pie)
- Date range filters
- Order state distribution

### Multi-line Orders
- Support for multiple materials per order
- Individual pricing per line
- Separate transport costs
- Flexible material grouping

### Vertical Admin Panel
- Modern vertical navigation
- Manage suppliers, formats, payment methods
- Configure order states and incidents
- User management with role-based access

## 🔒 Security

- ✅ Passwords hashed with bcrypt
- ✅ JWT session tokens
- ✅ Role-based access control (RBAC)
- ✅ Environment variables for secrets
- ✅ SQL injection protection via Prisma
- ✅ HTTPS enforced in production

## 🐛 Troubleshooting

**Port already in use?**
```bash
lsof -ti:3004 | xargs kill
npm run dev
```

**Prisma errors?**
```bash
npx prisma generate
npx prisma db push
```

**Chatbot not working?**
- Verify `OPENAI_API_KEY` is set
- Check API key has credits
- Ensure key starts with `sk-`

**Vercel deployment fails?**
- See [DEPLOYMENT.md](./DEPLOYMENT.md)
- Verify PostgreSQL is configured
- Check environment variables

## 📄 License

Private - All rights reserved

---

**Built with ❤️ using [Cursor AI](https://cursor.sh)**

*Powered by Next.js • Vercel • PostgreSQL • OpenAI*
