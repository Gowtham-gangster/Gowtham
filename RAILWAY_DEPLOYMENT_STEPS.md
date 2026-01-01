# 🚀 Deploy MedReminder Backend to Railway - Step by Step

## ✅ Prerequisites Complete
- [x] Code pushed to GitHub
- [x] Backend configured for production
- [x] Railway configuration files created

---

## 📋 Deployment Steps

### Step 1: Sign Up for Railway

1. Go to **https://railway.app**
2. Click **"Login"** (top right)
3. Select **"Login with GitHub"**
4. Authorize Railway to access your GitHub account

---

### Step 2: Create New Project

1. Click **"New Project"** button
2. Select **"Deploy from GitHub repo"**
3. Choose your repository: **`Gowtham-gangster/WebReminder`**
4. Railway will start analyzing your repository

---

### Step 3: Configure Service Settings

1. After Railway detects your project, click on the service
2. Go to **Settings** tab
3. Set **Root Directory** to: `server`
   - This tells Railway to deploy only the backend folder
4. Click **"Save Changes"**

---

### Step 4: Add MySQL Database

1. In your Railway project dashboard, click **"New"**
2. Select **"Database"**
3. Choose **"Add MySQL"**
4. Railway will provision a MySQL database automatically
5. Wait for the database to be ready (green status)

---

### Step 5: Configure Environment Variables

1. Click on your **web service** (not the database)
2. Go to **"Variables"** tab
3. Click **"New Variable"** and add these one by one:

```
NODE_ENV=production
PORT=3001
JWT_SECRET=MedReminder_Super_Secret_Key_2025_Change_This_In_Production
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://gowtham-nine.vercel.app
CORS_ORIGIN=https://gowtham-nine.vercel.app
```

**Important**: Railway automatically provides these MySQL variables (don't add them):
- `MYSQLHOST`
- `MYSQLPORT`
- `MYSQLUSER`
- `MYSQLPASSWORD`
- `MYSQLDATABASE`

4. Click **"Add"** for each variable

---

### Step 6: Deploy

1. Railway will automatically start deploying
2. Watch the **"Deployments"** tab for progress
3. Wait for deployment to complete (usually 2-3 minutes)
4. Look for **"Success"** status

---

### Step 7: Get Your Backend URL

1. Go to **"Settings"** tab
2. Scroll to **"Domains"** section
3. Click **"Generate Domain"**
4. Railway will give you a URL like: `https://webreminder-production-xxxx.up.railway.app`
5. **Copy this URL** - you'll need it for the frontend!

---

### Step 8: Test Your Backend

1. Open a new browser tab
2. Go to: `https://your-railway-url.up.railway.app/health`
3. You should see:
   ```json
   {
     "status": "ok",
     "message": "MedReminder API is running",
     "timestamp": "2025-01-01T..."
   }
   ```

If you see this, **congratulations! Your backend is live!** 🎉

---

### Step 9: Update Frontend Environment Variables

Now we need to tell your Vercel frontend to use the new backend URL.

#### Option A: Update via Vercel Dashboard (Recommended)

1. Go to **https://vercel.com/dashboard**
2. Select your project: **gowtham-nine**
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://your-railway-url.up.railway.app` (your Railway URL from Step 7)
   - **Environment**: Select all (Production, Preview, Development)
5. Click **"Save"**
6. Go to **Deployments** tab
7. Click **"..."** on the latest deployment → **"Redeploy"**

#### Option B: Update via Git (Alternative)

1. Update your local `.env` file:
   ```env
   VITE_API_BASE_URL=https://your-railway-url.up.railway.app
   ```

2. Commit and push:
   ```bash
   git add .env
   git commit -m "Update API URL for production"
   git push
   ```

3. Vercel will automatically redeploy

---

### Step 10: Test Your Full Application

1. Go to **https://gowtham-nine.vercel.app**
2. Click **"Sign up"** and create a new account
3. Try logging in
4. Add a medicine
5. Everything should work! 🎉

---

## 🔍 Troubleshooting

### Issue: "Network error" when logging in

**Solution**: 
- Check that `VITE_API_BASE_URL` is set correctly in Vercel
- Make sure you redeployed after adding the variable
- Clear browser cache (Ctrl+Shift+Delete)

### Issue: CORS error

**Solution**:
- Verify `FRONTEND_URL` and `CORS_ORIGIN` in Railway match your Vercel URL exactly
- Make sure it's `https://gowtham-nine.vercel.app` (no trailing slash)
- Redeploy Railway service after changing variables

### Issue: Database connection error

**Solution**:
- Check Railway logs: Click service → Deployments → View Logs
- Verify MySQL database is running (green status)
- Make sure you didn't manually add MySQL variables (Railway provides them automatically)

### Issue: 502 Bad Gateway

**Solution**:
- Check Railway logs for errors
- Verify `PORT` is set to `3001`
- Make sure `NODE_ENV=production`

---

## 📊 Monitor Your Deployment

### View Logs
1. Go to Railway dashboard
2. Click on your service
3. Click **"Deployments"**
4. Click on latest deployment
5. Click **"View Logs"**

### Check Database
1. Click on MySQL database in Railway
2. Go to **"Data"** tab
3. You can see your tables and data

### Monitor Usage
1. Go to Railway dashboard
2. Click **"Usage"** tab
3. See your monthly usage and costs

---

## 💰 Cost Information

**Railway Free Tier**:
- $5 credit per month
- Estimated usage:
  - Web Service: ~$3-4/month
  - MySQL Database: ~$1-2/month
- **Total**: Should stay within free tier for small projects

**Tips to stay within free tier**:
- Use sleep mode for development (Railway auto-sleeps inactive services)
- Monitor usage regularly
- Optimize database queries

---

## 🎉 Success Checklist

- [ ] Railway account created
- [ ] Project deployed from GitHub
- [ ] MySQL database added
- [ ] Environment variables configured
- [ ] Backend URL generated
- [ ] Backend health check passes
- [ ] Frontend updated with new API URL
- [ ] Frontend redeployed on Vercel
- [ ] Can sign up and login successfully
- [ ] All features working

---

## 📞 Need Help?

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Check Logs**: Railway Dashboard → Service → Deployments → View Logs

---

## 🚀 Next Steps

After successful deployment:

1. **Change JWT_SECRET** to a more secure random string
2. **Set up database backups** (Railway Settings → Backups)
3. **Monitor error logs** regularly
4. **Set up custom domain** (optional)
5. **Enable Railway notifications** for deployment status

---

**Your backend is now live and ready for production use!** 🎊

Repository: https://github.com/Gowtham-gangster/WebReminder
