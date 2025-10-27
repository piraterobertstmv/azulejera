# 🚀 Deployment Guide - Cursor Business Manager

## Prerequisites
- GitHub account
- Vercel account (sign up at https://vercel.com)

## 🎯 Quick Deployment Steps

### 1. Set Up PostgreSQL Database

Choose one of these options:

#### Option A: Vercel Postgres (Recommended)
1. Go to https://vercel.com/dashboard
2. Select your project
3. Click **Storage** tab
4. Click **Create Database**
5. Select **Postgres**
6. Click **Create**
7. Vercel automatically adds `DATABASE_URL` and `POSTGRES_URL` to your environment variables

#### Option B: Neon (Free Tier)
1. Sign up at https://neon.tech
2. Create a new project
3. Copy the connection string
4. Add to Vercel environment variables

#### Option C: Supabase (Free Tier)
1. Sign up at https://supabase.com
2. Create a new project
3. Go to Settings → Database → Connection string
4. Copy the **Direct connection** string
5. Add to Vercel environment variables

---

### 2. Configure Environment Variables in Vercel

Go to your Vercel project → **Settings** → **Environment Variables** and add:

| Variable Name | Value | Required |
|---------------|-------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ Yes |
| `DIRECT_URL` | PostgreSQL direct connection string (same as DATABASE_URL for most providers) | ✅ Yes |
| `NEXTAUTH_URL` | Your Vercel domain (e.g., `https://your-app.vercel.app`) | ✅ Yes |
| `NEXTAUTH_SECRET` | Random 32-character string ([generate here](https://generate-secret.vercel.app/32)) | ✅ Yes |
| `OPENAI_API_KEY` | Your OpenAI API key (starts with `sk-`) | ✅ Yes (for AI chatbot) |
| `NODE_ENV` | `production` | ✅ Yes |

**Example values:**
```bash
DATABASE_URL="postgresql://user:password@host.region.postgres.vercel.app:5432/verceldb?sslmode=require"
DIRECT_URL="postgresql://user:password@host.region.postgres.vercel.app:5432/verceldb?sslmode=require"
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="your-random-32-character-secret-key"
OPENAI_API_KEY="sk-proj-your-openai-api-key"
NODE_ENV="production"
```

---

### 3. Deploy to Vercel

#### Method 1: Automatic (From GitHub)
1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Fix(deployment): configure for Vercel with PostgreSQL"
   git push origin main
   ```

2. Go to https://vercel.com/new
3. Select your GitHub repository
4. Vercel will auto-detect Next.js and deploy
5. Wait for deployment to complete (3-5 minutes)

#### Method 2: Manual (Vercel CLI)
```bash
npm i -g vercel
vercel login
vercel --prod
```

---

### 4. Initialize Database

After first deployment, you need to create the database tables:

#### Option A: Using Vercel CLI
```bash
# Connect to your production database
DATABASE_URL="your-vercel-postgres-url" npx prisma migrate deploy
```

#### Option B: Using Prisma Studio
```bash
# In your local terminal with DATABASE_URL set
DATABASE_URL="your-production-url" npx prisma studio
```

#### Option C: Run Seed Script (Recommended)
```bash
# Create initial data (admin user, states, etc.)
DATABASE_URL="your-production-url" npm run seed
```

This will create:
- ✅ Default admin user: `superadmin@cursor.manager` / `superadmin123`
- ✅ Default employee user: `empleado@cursor.manager` / `empleado123`
- ✅ Initial order states
- ✅ Sample payment methods

---

### 5. Verify Deployment

1. Visit your Vercel URL (e.g., `https://your-app.vercel.app`)
2. You should see the login page
3. Login with: `superadmin@cursor.manager` / `superadmin123`
4. Test creating a new order

---

## 🐛 Troubleshooting

### Build Fails with "Prisma Client not generated"
**Solution:** Ensure `postinstall` script is in `package.json`:
```json
"postinstall": "prisma generate"
```

### Database Connection Error
**Solution:** Check that:
- `DATABASE_URL` is correctly set in Vercel environment variables
- Connection string includes `?sslmode=require`
- Database is accessible from Vercel's IP ranges

### NextAuth Error: "NEXTAUTH_URL Required"
**Solution:** Set `NEXTAUTH_URL` in Vercel to your full domain:
```
https://your-app.vercel.app
```

### OpenAI API Error
**Solution:** Verify your `OPENAI_API_KEY` is:
- Valid and active
- Starts with `sk-proj-` or `sk-`
- Has sufficient credits

### Migration Fails
**Solution:** Run migrations manually:
```bash
DATABASE_URL="your-url" npx prisma migrate deploy
```

---

## 📊 Database Schema

The app uses Prisma ORM with PostgreSQL. Schema includes:
- User management (admin, employee, superadmin roles)
- Order management (Pedido)
- Material lines (LineaMaterial)
- Suppliers (Proveedor)
- Formats (Formato)
- Payment methods (FormaPago)
- Order states (EstadoPedido)
- Incidents (Incidencia)
- Transporters (Transportista)

---

## 🔄 Updating the App

When you make changes:
1. Commit to GitHub: `git push origin main`
2. Vercel auto-deploys within 1-2 minutes
3. Check deployment status at https://vercel.com/dashboard

---

## 🔒 Security Checklist

- ✅ Never commit `.env` file
- ✅ Use strong `NEXTAUTH_SECRET` (32+ characters)
- ✅ Rotate API keys regularly
- ✅ Keep dependencies updated: `npm audit`
- ✅ Enable Vercel's security headers
- ✅ Use PostgreSQL with SSL (`sslmode=require`)

---

## 💡 Performance Tips

1. **Enable Caching:** Vercel automatically caches static assets
2. **Database Connection Pooling:** Use connection pooler URLs (e.g., Neon, Supabase)
3. **Image Optimization:** Already configured in `next.config.js`
4. **Edge Functions:** Consider moving API routes to Edge Runtime for faster response

---

## 📞 Support

For issues, check:
- Vercel deployment logs: https://vercel.com/dashboard
- Prisma docs: https://www.prisma.io/docs
- Next.js docs: https://nextjs.org/docs

---

Built with ❤️ using Cursor AI

