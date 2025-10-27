# Cursor Business Manager

A modern web application for business management built with Next.js, TypeScript, and Prisma. Powered by Cursor AI.

## Features

- 📦 Complete order management
- 🏢 Customer administration
- 🚚 Shipping and logistics control
- 📊 Dashboard with real-time metrics
- 💰 Commission system
- 🤖 AI-powered chat assistant
- 🎨 Modern UI with Tailwind CSS

## Technologies

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: Prisma ORM (SQLite/PostgreSQL)
- **Authentication**: NextAuth.js
- **AI**: OpenAI GPT-4 integration

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (copy `.env.example` to `.env`)
4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Seed the database:
   ```bash
   npx prisma db seed
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linter
- `npm run import` - Import bulk data from JSON

## Deployment

### Plesk Server

For production deployment to Plesk, follow these steps:

1. **Prepare deployment package:**
   ```bash
   ./prepare-deployment.sh
   ```

2. **Upload to your server** (SSH or Plesk File Manager)

3. **Follow the complete guide:**
   - 📖 [DEPLOYMENT_PLESK.md](./DEPLOYMENT_PLESK.md) - Full deployment guide
   - ✅ [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Deployment checklist

### Quick Deployment Steps

```bash
# 1. Create PostgreSQL database in Plesk
# 2. Upload files to /httpdocs/
# 3. SSH into server:
ssh username@your-server-ip

# 4. Install and build:
cd /var/www/vhosts/yourdomain.com/httpdocs/
npm install --production
npx prisma generate
npx prisma migrate deploy
npx tsx --require dotenv/config scripts/seed.ts
npm run build

# 5. Configure Node.js in Plesk:
#    - Startup file: server.js
#    - Application mode: Production
#    - Restart App
```

### Default Login Credentials

After deployment, login with:

- **Superadmin**: `superadmin@cursor.manager` / `superadmin123`
- **Admin**: `john@doe.com` / `johndoe123`

⚠️ **Change these passwords immediately after first login!**

## Project Structure

```
├── app/                 # Next.js App Router
├── components/          # Reusable components
├── lib/                # Utilities and configurations
├── prisma/             # Database schemas
├── scripts/            # Utility scripts
└── public/             # Static files
```

## Environment Variables

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
NODE_ENV="development"
OPENAI_API_KEY="your-openai-api-key"
```

## License

MIT

---

Built with ❤️ using Cursor AI
