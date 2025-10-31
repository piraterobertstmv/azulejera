# 🚀 Migration Guide: SQLite → PostgreSQL on Vercel

## ✅ Data Export Complete!

Your SQLite data has been exported:
- **File:** `data/pedidos-export-2025-10-27T16-36-53-131Z.json`
- **Records:** 105 pedidos

---

## 📋 Step-by-Step Migration

### **Step 1: Create PostgreSQL Database (FREE)**

I recommend **Neon** (free tier, perfect for this):

1. Go to: https://neon.tech/
2. Sign up with GitHub
3. Create new project:
   - **Project name:** `cursor-business-manager`
   - **Region:** US East (same as Vercel)
   - **Postgres version:** 16
4. Copy the connection strings:
   - **DATABASE_URL** (Pooled connection)
   - **DIRECT_URL** (Direct connection)

Example:
```
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

---

### **Step 2: Configure Vercel Environment Variables**

1. Go to: https://vercel.com/piraterobertstmv/azulejera/settings/environment-variables
2. Add these variables (one by one):

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon pooled connection string |
| `DIRECT_URL` | Your Neon direct connection string |
| `NEXTAUTH_SECRET` | `bAZuv89H3xTfAnSYLJPyFG25QhuDB22J` |
| `NEXTAUTH_URL` | `https://azulejera-4kpya93lb-piraterobertstmv-projects.vercel.app` |
| `NODE_ENV` | `production` |
| `OPENAI_API_KEY` | Your OpenAI API key (get from: https://platform.openai.com/api-keys) |

**Important:** Select "Production, Preview, and Development" for all variables!

---

### **Step 3: Update Local .env for PostgreSQL**

Update your local `.env` file:

```bash
# Production PostgreSQL (paste your Neon URLs)
DATABASE_URL="postgresql://your-neon-url-here"
DIRECT_URL="postgresql://your-neon-direct-url-here"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="bAZuv89H3xTfAnSYLJPyFG25QhuDB22J"
NODE_ENV="development"

# AI Chatbot
OPENAI_API_KEY="sk-your-key-here"
```

---

### **Step 4: Run Database Migrations**

Push the Prisma schema to PostgreSQL:

```bash
npx prisma migrate deploy
# or if that doesn't work:
npx prisma db push
```

This creates all tables in your PostgreSQL database.

---

### **Step 5: Seed Users**

Create superadmin and employee users:

```bash
npx prisma db seed
```

**Credentials created:**
- **Superadmin:** `superadmin@cursor.manager` / `superadmin123`
- **Employee:** `empleado@cursor.manager` / `empleado123`

---

### **Step 6: Import Your Data**

Import the 105 pedidos we exported:

```bash
npm run import data/pedidos-export-2025-10-27T16-36-53-131Z.json
```

This will:
- Create all pedidos
- Link to proveedores, formatos, estados
- Calculate all beneficios
- Preserve all relationships

---

### **Step 7: Redeploy on Vercel**

Trigger a new deployment to use the new env variables:

```bash
git commit --allow-empty -m "Trigger redeploy with database configured"
git push origin main
```

Or go to Vercel Dashboard → Deployments → Click "Redeploy"

---

## ✅ Testing

Once deployed:

1. Visit: https://azulejera-4kpya93lb-piraterobertstmv-projects.vercel.app/login
2. Login with: `superadmin@cursor.manager` / `superadmin123`
3. Check dashboard shows all 105 pedidos
4. Test AI chatbot (purple floating button)

---

## 🔧 Troubleshooting

**"Cannot connect to database"**
- Check DATABASE_URL and DIRECT_URL are correct
- Make sure Neon database is running (free tier may pause after inactivity)

**"User not found"**
- Run seed again: `npx prisma db seed`
- Check you're using `@cursor.manager` email, not `@azulejos.com`

**"No data showing"**
- Run import again: `npm run import data/pedidos-export-2025-10-27T16-36-53-131Z.json`
- Check Neon dashboard → Tables to verify data exists

---

## 📊 Database Access

View your data directly:
1. Go to Neon Dashboard
2. Click "SQL Editor"
3. Run queries like:
   ```sql
   SELECT COUNT(*) FROM "Pedido";
   SELECT * FROM "User";
   ```

---

## 🎉 You're Done!

Your app will be fully migrated with:
- ✅ 105 pedidos
- ✅ All users (superadmin + employee)
- ✅ All relationships (proveedores, formatos, estados)
- ✅ AI chatbot working
- ✅ Production-ready on Vercel

---

**Need help?** Share any error messages and I'll help debug!



