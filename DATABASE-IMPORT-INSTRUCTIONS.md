# 🗄️ COMPLETE DATABASE IMPORT INSTRUCTIONS

## 📋 What You Have

A complete PostgreSQL script that includes:
- ✅ **Complete database schema** (11 tables)
- ✅ **All your data** (105 orders + all master data)
- ✅ **3 users** with login credentials
- ✅ **34 suppliers**
- ✅ **115+ product formats**
- ✅ **Payment methods with commissions**
- ✅ **Order states, incidents, and shippers**

**File:** `COMPLETE-POSTGRESQL-DATABASE.sql` (708 lines)

---

## 🔑 LOGIN CREDENTIALS

### **Main Admin Account**
- **Email:** `superadmin@cursor.manager`
- **Password:** `superadmin123`
- **Role:** Super Administrator (full access)

### **Employee Account**
- **Email:** `empleado@cursor.manager`
- **Password:** `empleado123`
- **Role:** Employee (limited access)

### **Test Account**
- **Email:** `john@doe.com`
- **Password:** (hash included - use "Test@1234" if you reset it)
- **Role:** Admin

⚠️ **IMPORTANT:** Change these passwords immediately after first login in production!

---

## 🚀 HOW TO IMPORT TO POSTGRESQL

### **Option 1: Using pgAdmin (GUI)**

1. **Open pgAdmin** and connect to your PostgreSQL server
2. **Create a new database** (or use existing one)
   - Right-click "Databases" → "Create" → "Database"
   - Name it: `cursor_business_manager`
3. **Open Query Tool**
   - Right-click on your database → "Query Tool"
4. **Copy & Paste the entire script**
   - Open `COMPLETE-POSTGRESQL-DATABASE.sql` in a text editor
   - Select ALL text (Ctrl+A / Cmd+A)
   - Copy (Ctrl+C / Cmd+C)
   - Paste into Query Tool (Ctrl+V / Cmd+V)
5. **Execute the script**
   - Click the "Execute" button (⚡ lightning bolt icon)
   - Wait for completion (~5-10 seconds)
6. **Verify import**
   - Refresh the database tree
   - You should see 11 tables with data

### **Option 2: Using Command Line (psql)**

1. **Connect to PostgreSQL**
   ```bash
   psql -U postgres
   ```

2. **Create database** (if needed)
   ```sql
   CREATE DATABASE cursor_business_manager;
   \c cursor_business_manager
   ```

3. **Import the script**
   ```bash
   \i /path/to/COMPLETE-POSTGRESQL-DATABASE.sql
   ```
   
   Or from outside psql:
   ```bash
   psql -U postgres -d cursor_business_manager -f COMPLETE-POSTGRESQL-DATABASE.sql
   ```

4. **Verify import**
   ```sql
   \dt
   SELECT COUNT(*) FROM "Pedido";
   SELECT * FROM "User";
   ```

### **Option 3: For Neon/Vercel Postgres (Online)**

1. **Get your DATABASE_URL** from Neon/Vercel dashboard
2. **Use psql with connection string**
   ```bash
   psql "postgresql://user:password@host/dbname?sslmode=require" -f COMPLETE-POSTGRESQL-DATABASE.sql
   ```

3. **Or copy-paste in their web SQL editor**
   - Open Neon SQL Editor or Vercel Postgres Query tab
   - Paste the entire script
   - Execute

---

## 📊 WHAT WILL BE IMPORTED

### **Master Data**
- **Users:** 3 accounts (superadmin, empleado, john)
- **Proveedores (Suppliers):** 34 companies
- **Formatos (Formats):** 115+ product formats (sizes)
- **Formas de Pago (Payment Methods):** 9 methods with commission configurations
- **Estados de Pedido (Order States):** 8 states (Pendiente, Entregado, etc.)
- **Incidencias (Incidents):** 11 incident types
- **Transportistas (Shippers):** 5 shipping companies

### **Transaction Data**
- **Pedidos (Orders):** 105 complete orders with:
  - Client information
  - Dates, invoices, states
  - Material details
  - Pricing and profit calculations
  - Commission data
- **Líneas de Material:** Multiple material lines per order
- **Pedido-Transportista relationships:** Multiple shippers per order

---

## ✅ VERIFY IMPORT SUCCESS

After importing, run these queries to verify:

```sql
-- Check table counts
SELECT 'Users' as table_name, COUNT(*) as records FROM "User"
UNION ALL
SELECT 'Proveedores', COUNT(*) FROM "Proveedor"
UNION ALL
SELECT 'Formatos', COUNT(*) FROM "Formato"
UNION ALL
SELECT 'Formas de Pago', COUNT(*) FROM "FormaPago"
UNION ALL
SELECT 'Estados', COUNT(*) FROM "EstadoPedido"
UNION ALL
SELECT 'Incidencias', COUNT(*) FROM "Incidencia"
UNION ALL
SELECT 'Transportistas', COUNT(*) FROM "Transportista"
UNION ALL
SELECT 'Pedidos', COUNT(*) FROM "Pedido"
UNION ALL
SELECT 'Líneas Material', COUNT(*) FROM "LineaMaterial";

-- Expected results:
-- Users: 3
-- Proveedores: 34
-- Formatos: 115+
-- Formas de Pago: 9
-- Estados: 8
-- Incidencias: 11
-- Transportistas: 5
-- Pedidos: 105
-- Líneas Material: varies

-- Check first order
SELECT 
    p."numeroPedido",
    p.cliente,
    p."fechaPedido",
    p."pvpTotalPedido",
    p.beneficio,
    e.nombre as estado
FROM "Pedido" p
LEFT JOIN "EstadoPedido" e ON p."estadoPedidoId" = e.id
ORDER BY p."fechaPedido" DESC
LIMIT 5;
```

---

## 🔧 TROUBLESHOOTING

### **Error: "database already exists"**
**Solution:** Either:
1. Use the existing database
2. Drop it first: `DROP DATABASE cursor_business_manager;`
3. Choose a different name

### **Error: "relation already exists"**
**Solution:** The script already includes `DROP TABLE IF EXISTS` statements at the beginning. If you still get this error:
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```
Then run the script again.

### **Error: "permission denied"**
**Solution:** Make sure you're connected as a superuser or database owner:
```sql
GRANT ALL PRIVILEGES ON DATABASE cursor_business_manager TO your_user;
```

### **Import seems stuck**
**Solution:** The script has 708 lines and might take 10-30 seconds. Be patient!

### **Some data missing**
**Solution:** Check if the script was copied completely. The file should be ~70KB.

---

## 🎯 NEXT STEPS

After successful import:

1. **Update your `.env` file** with the new DATABASE_URL
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/cursor_business_manager?sslmode=require"
   DIRECT_URL="postgresql://user:password@host:5432/cursor_business_manager?sslmode=require"
   ```

2. **Test the connection**
   ```bash
   npx prisma db pull
   ```

3. **Login to your app**
   - URL: `https://your-app-url.vercel.app` or `http://localhost:3004`
   - Email: `superadmin@cursor.manager`
   - Password: `superadmin123`

4. **Change passwords!**
   - Go to "Perfil" → "Cambiar Contraseña"
   - Update all default passwords

5. **Configure Vercel environment variables** (if deploying)
   - Add `DATABASE_URL`
   - Add `DIRECT_URL`
   - Add `NEXTAUTH_URL`
   - Add `NEXTAUTH_SECRET`
   - Add `OPENAI_API_KEY`

---

## 📞 SUPPORT

If you encounter any issues:
1. Check the error message carefully
2. Verify your PostgreSQL version (should be 12+)
3. Make sure you have CREATE TABLE permissions
4. Check if the database encoding is UTF-8

---

## 📁 FILE CONTENTS SUMMARY

```
COMPLETE-POSTGRESQL-DATABASE.sql
├── DROP TABLES (clean slate)
├── CREATE TABLES (schema)
│   ├── User
│   ├── Account, Session, VerificationToken (NextAuth)
│   ├── Proveedor
│   ├── Formato
│   ├── FormaPago
│   ├── EstadoPedido
│   ├── Incidencia
│   ├── Transportista
│   ├── ConfiguracionColumnas
│   ├── Pedido
│   ├── LineaMaterial
│   └── PedidoTransportista
├── CREATE INDEXES (performance)
└── INSERT DATA (all your records)
    ├── 3 users
    ├── 34 proveedores
    ├── 115+ formatos
    ├── 9 formas de pago
    ├── 8 estados
    ├── 11 incidencias
    ├── 5 transportistas
    └── 105 pedidos + líneas material
```

---

**🎉 You're ready to import! Just copy & paste the SQL file into PostgreSQL!**

