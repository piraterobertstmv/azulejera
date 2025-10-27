# 🚀 Plesk Deployment Guide - Cursor Business Manager

Complete step-by-step guide to deploy your Next.js application to Plesk server.

## 📋 Prerequisites

- Plesk server with Node.js support
- PostgreSQL database access
- SSH/FTP access to server
- Domain configured in Plesk

---

## 🗄️ Step 1: Setup PostgreSQL Database

1. Login to **Plesk Control Panel**
2. Go to **Databases** → **Add Database**
3. Create database:
   - **Database name**: `cursor_business_manager`
   - **Database user**: `cursor_user`
   - **Password**: (generate strong password)
   - **Server**: localhost

4. **Copy your connection string**:
   ```
   postgresql://cursor_user:YOUR_PASSWORD@localhost:5432/cursor_business_manager
   ```

---

## 📁 Step 2: Prepare Files for Upload

### Files to INCLUDE:
```
✅ app/
✅ components/
✅ lib/
✅ prisma/schema.prisma
✅ public/
✅ hooks/
✅ scripts/
✅ data/
✅ package.json
✅ package-lock.json
✅ next.config.js
✅ tailwind.config.ts
✅ tsconfig.json
✅ postcss.config.js
✅ components.json
✅ server.js
✅ .gitignore
```

### Files to EXCLUDE:
```
❌ .next/              (build cache - will be generated on server)
❌ node_modules/       (will be installed on server)
❌ .env                (create separately on server)
❌ prisma/dev.db       (local SQLite database)
❌ prisma/*.db-journal
❌ tsconfig.tsbuildinfo
```

---

## 📦 Step 3: Upload to Server

### Option A: SSH Upload (Recommended)

```bash
# 1. Create deployment package (from your local machine)
cd /Users/antoniomoyavalls/Downloads/azulejera/gestion-pedidos-azulejos/app
zip -r cursor-app.zip . \
  -x "node_modules/*" \
  -x ".next/*" \
  -x "prisma/dev.db*" \
  -x ".env" \
  -x "*.log"

# 2. Upload to Plesk server
scp cursor-app.zip username@your-server-ip:/var/www/vhosts/yourdomain.com/httpdocs/

# 3. SSH into server
ssh username@your-server-ip

# 4. Extract files
cd /var/www/vhosts/yourdomain.com/httpdocs/
unzip cursor-app.zip
rm cursor-app.zip
```

### Option B: Plesk File Manager

1. Go to **Files** → **File Manager**
2. Navigate to `httpdocs/`
3. Delete any existing files (index.html, etc.)
4. Upload `cursor-app.zip`
5. Right-click → **Extract**
6. Delete the zip file

---

## ⚙️ Step 4: Configure Environment Variables

Create `.env` file in `/httpdocs/` directory:

```bash
# Database - Use your Plesk PostgreSQL connection
DATABASE_URL="postgresql://cursor_user:YOUR_PASSWORD@localhost:5432/cursor_business_manager"

# NextAuth - IMPORTANT: Use your actual domain
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="REPLACE_WITH_RANDOM_STRING"

# Node Environment
NODE_ENV="production"

# OpenAI API Key (for AI chatbot)
OPENAI_API_KEY="sk-your-actual-openai-api-key"
```

**Generate NEXTAUTH_SECRET:**
```bash
# Run this command on server or local machine:
openssl rand -base64 32
```

**Set proper permissions:**
```bash
chmod 600 .env
```

---

## 🔧 Step 5: Install Dependencies & Setup Database

SSH into your server:

```bash
cd /var/www/vhosts/yourdomain.com/httpdocs/

# 1. Install Node.js dependencies
npm install --production

# 2. Generate Prisma Client
npx prisma generate

# 3. Run database migrations
npx prisma migrate deploy

# 4. Seed database with initial data (users, catalogs, sample transactions)
npx tsx --require dotenv/config scripts/seed.ts
```

**Expected Output:**
```
✅ Usuarios creados: admin, empleado, superadmin
✅ Proveedores creados
✅ Formatos creados
✅ Estados de pedido creados
✅ Formas de pago creados
✅ Transportistas creados
```

---

## 🏗️ Step 6: Build Application

```bash
npm run build
```

This will:
- Generate Prisma Client
- Build Next.js production bundle
- Optimize assets

**Expected Output:**
```
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

---

## 🎛️ Step 7: Configure Node.js in Plesk

1. Go to **Plesk** → **Domains** → **yourdomain.com**
2. Click **Node.js**
3. Configure settings:
   - **Enable Node.js**: ✅
   - **Node.js Version**: 18.x or higher
   - **Application Mode**: Production
   - **Document Root**: `/httpdocs`
   - **Application Startup File**: `server.js`
   - **Application URL**: `https://yourdomain.com`
   - **Custom Environment Variables**:
     ```
     NODE_ENV=production
     PORT=3000
     ```

4. Click **Enable Node.js**
5. Click **Restart App**

---

## 🔒 Step 8: Configure SSL (HTTPS)

1. Go to **SSL/TLS Certificates**
2. **Let's Encrypt** → Issue Free Certificate
3. Check: ✅ Secure the domain and www subdomain
4. Click **Get it free**

---

## ✅ Step 9: Test Your Deployment

Visit: `https://yourdomain.com`

### Login Credentials (Default):

**Superadmin:**
- Email: `superadmin@cursor.manager`
- Password: `superadmin123`

**Admin:**
- Email: `john@doe.com`
- Password: `johndoe123`

**Employee:**
- Email: `empleado@cursor.manager`
- Password: `empleado123`

---

## 🔧 Troubleshooting

### Issue: "Cannot connect to database"

**Solution:**
```bash
# Check database connection
cd /var/www/vhosts/yourdomain.com/httpdocs/
npx prisma db pull
```

### Issue: "Module not found"

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install --production
npm run build
```

### Issue: "Prisma Client not generated"

**Solution:**
```bash
npx prisma generate
npm run build
```

### Issue: App not restarting

**Solution:**
1. Plesk → Node.js → **Stop App**
2. Wait 10 seconds
3. **Start App**

### Check Application Logs

In Plesk:
- **Logs** → **Error Log**
- Look for Node.js errors

Or via SSH:
```bash
cd /var/www/vhosts/yourdomain.com/httpdocs/
cat logs/nodejs_errors.log
```

---

## 🎯 Step 10: Post-Deployment

### 1. Change Default Passwords

Login and go to **Perfil** → Change passwords for all default users

### 2. Remove Sample Data (Optional)

If you want to start fresh without the 100 dummy transactions:

```bash
# This will keep users and catalogs but remove transactions
cd /var/www/vhosts/yourdomain.com/httpdocs/
npx prisma migrate reset --force
npx tsx --require dotenv/config scripts/seed.ts
```

### 3. Import Real Data (Optional)

If you have real transaction data:

1. Prepare JSON file following format in `data/pedidos-example.json`
2. Upload to `data/` directory
3. Run import:
```bash
npm run import
```

### 4. Setup Backups

In Plesk:
- **Backup Manager** → **Schedule Daily Backups**
- Include: Database + Files

---

## 📊 Database Management

### View Database

In Plesk:
- **Databases** → **phpPgAdmin** or **Adminer**

### Manual Backup

```bash
# Backup database
pg_dump cursor_business_manager > backup_$(date +%Y%m%d).sql

# Restore database
psql cursor_business_manager < backup_20250127.sql
```

---

## 🔄 Updating Your Application

When you make changes:

```bash
# 1. Upload new files (or git pull)
cd /var/www/vhosts/yourdomain.com/httpdocs/
git pull origin main  # If using git

# 2. Install new dependencies (if package.json changed)
npm install --production

# 3. Run migrations (if schema changed)
npx prisma migrate deploy

# 4. Rebuild application
npm run build

# 5. Restart in Plesk
# Plesk → Node.js → Restart App
```

---

## 📞 Support

If you need help:
1. Check Plesk error logs
2. Check Node.js console logs
3. Verify `.env` configuration
4. Test database connection
5. Check file permissions

---

## 🎉 Success!

Your **Cursor Business Manager** should now be running at:
**https://yourdomain.com**

Features available:
- ✅ Dashboard with analytics
- ✅ Order management
- ✅ User management (Superadmin)
- ✅ AI Chatbot assistant
- ✅ Invoice tracking
- ✅ Provider management

---

**Last Updated:** January 2025
**Version:** 1.0.0

