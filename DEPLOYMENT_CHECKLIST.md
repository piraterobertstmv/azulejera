# ✅ Plesk Deployment Checklist

Use this checklist to ensure smooth deployment to Plesk server.

---

## 🔲 Pre-Deployment (Local)

- [ ] All code changes committed to Git
- [ ] Latest admin panel navigation changes committed
- [ ] Tested locally at `localhost:3004`
- [ ] No console errors in browser
- [ ] Database schema is finalized
- [ ] `.env.example` file exists for reference

---

## 🔲 Plesk Server Setup

- [ ] PostgreSQL database created in Plesk
- [ ] Database user created with proper permissions
- [ ] Database connection string noted
- [ ] Node.js enabled in Plesk (version 18+)
- [ ] Domain configured and pointing to server
- [ ] SSL certificate installed (Let's Encrypt)

---

## 🔲 File Upload

- [ ] Removed `node_modules/` folder
- [ ] Removed `.next/` build cache
- [ ] Removed `prisma/dev.db` SQLite file
- [ ] Removed local `.env` file
- [ ] Created deployment zip file
- [ ] Uploaded to `/httpdocs/` directory
- [ ] Extracted files on server
- [ ] Verified all files present

---

## 🔲 Environment Configuration

- [ ] `.env` file created on server
- [ ] `DATABASE_URL` set to PostgreSQL connection
- [ ] `NEXTAUTH_URL` set to production domain (https://)
- [ ] `NEXTAUTH_SECRET` generated (32+ random characters)
- [ ] `NODE_ENV` set to "production"
- [ ] `OPENAI_API_KEY` added (for chatbot)
- [ ] `.env` file permissions set to 600

---

## 🔲 Server Installation

- [ ] Ran `npm install --production`
- [ ] Ran `npx prisma generate`
- [ ] Ran `npx prisma migrate deploy`
- [ ] Ran database seed script
- [ ] Ran `npm run build`
- [ ] Build completed without errors

---

## 🔲 Plesk Configuration

- [ ] Node.js enabled for domain
- [ ] Application startup file set to `server.js`
- [ ] Application mode set to "Production"
- [ ] Environment variables configured
- [ ] Application started successfully
- [ ] No errors in Plesk Node.js logs

---

## 🔲 Testing

- [ ] Can access `https://yourdomain.com`
- [ ] Login page loads correctly
- [ ] Can login as superadmin
- [ ] Dashboard displays correctly
- [ ] Charts render properly
- [ ] Can view Pedidos list
- [ ] Can create new Pedido
- [ ] Can edit existing Pedido
- [ ] Admin panel accessible
- [ ] AI Chatbot responds (if OpenAI key configured)
- [ ] Sidebar navigation works
- [ ] All pages load without errors

---

## 🔲 Security

- [ ] Default passwords changed
- [ ] SSL/HTTPS enabled and working
- [ ] `.env` file not publicly accessible
- [ ] Database credentials secure
- [ ] Firewall configured (if applicable)
- [ ] Only necessary ports open

---

## 🔲 Post-Deployment

- [ ] Backup configured in Plesk
- [ ] Error monitoring setup
- [ ] Documentation saved
- [ ] Team informed of new credentials
- [ ] Access instructions shared
- [ ] Support contact information available

---

## 🔲 Optional - Data Management

- [ ] Sample data reviewed (100 transactions from seed)
- [ ] Decision made: Keep or remove sample data
- [ ] Real data import process planned (if applicable)
- [ ] Data migration tested

---

## 🎯 Success Criteria

✅ Application loads at production URL  
✅ All users can login  
✅ Dashboard shows data  
✅ Orders can be created/edited  
✅ No console errors  
✅ Performance is acceptable  
✅ SSL certificate valid  
✅ Backups configured  

---

## 📞 Emergency Contacts

**Plesk Support:**
- Control Panel: `https://your-server-ip:8443`
- Documentation: https://docs.plesk.com

**Database Issues:**
- Check Plesk → Databases → phpPgAdmin

**Server SSH:**
- `ssh username@your-server-ip`

---

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Production URL:** _______________  
**Database:** _______________  

---

✅ **All items checked? You're ready to go live!**

