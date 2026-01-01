# MedReminder Backend Deployment Guide

## Option 1: Deploy to Railway (Recommended - Free Tier)

### Prerequisites
- GitHub account
- Railway account (sign up at https://railway.app)

### Steps:

1. **Push your code to GitHub** (already done ✅)

2. **Sign up for Railway**
   - Go to https://railway.app
   - Click "Login" and sign in with GitHub
   - Authorize Railway to access your repositories

3. **Create a New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository: `Gowtham-gangster/WebReminder`
   - Railway will detect the Node.js project

4. **Add MySQL Database**
   - In your Railway project, click "New"
   - Select "Database" → "Add MySQL"
   - Railway will provision a MySQL database

5. **Configure Environment Variables**
   Click on your service → "Variables" tab and add:
   ```
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=your_secure_random_string_here_change_this
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=https://gowtham-nine.vercel.app
   CORS_ORIGIN=https://gowtham-nine.vercel.app
   ```

   Railway will automatically provide these MySQL variables:
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
   - `MYSQLDATABASE`

6. **Update Database Configuration**
   Railway uses different variable names. The `config/database.js` already handles this.

7. **Set Root Directory**
   - Go to Settings → "Root Directory"
   - Set to: `server`
   - This tells Railway to deploy only the server folder

8. **Deploy**
   - Railway will automatically deploy
   - Wait for deployment to complete
   - You'll get a URL like: `https://your-app.railway.app`

9. **Initialize Database**
   - Go to your Railway project
   - Click on your service → "Deployments"
   - Click on the latest deployment → "View Logs"
   - The database schema will be created automatically on first run

10. **Test Your API**
    ```bash
    curl https://your-app.railway.app/health
    ```

---

## Option 2: Deploy to Render (Free Tier)

### Steps:

1. **Sign up for Render**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - Name: `medreminder-backend`
     - Root Directory: `server`
     - Environment: `Node`
     - Build Command: `npm install`
     - Start Command: `npm start`

3. **Create MySQL Database**
   - Render doesn't offer free MySQL
   - Use external service like:
     - **PlanetScale** (free tier): https://planetscale.com
     - **Railway MySQL** (free tier): https://railway.app
     - **Aiven** (free tier): https://aiven.io

4. **Add Environment Variables**
   ```
   NODE_ENV=production
   PORT=3001
   DB_HOST=your_mysql_host
   DB_PORT=3306
   DB_USER=your_mysql_user
   DB_PASSWORD=your_mysql_password
   DB_NAME=medreminder
   JWT_SECRET=your_secure_random_string
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=https://gowtham-nine.vercel.app
   CORS_ORIGIN=https://gowtham-nine.vercel.app
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment

---

## Option 3: Deploy to Vercel (Serverless)

**Note**: Vercel is designed for frontend. For backend, use Railway or Render.

However, if you want to try:

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Create `vercel.json` in server folder:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "server.js"
       }
     ]
   }
   ```

3. Deploy:
   ```bash
   cd server
   vercel
   ```

**Limitation**: You'll need an external MySQL database (PlanetScale, Railway, etc.)

---

## After Deployment

### Update Frontend Environment Variables

1. **Update `.env` file**:
   ```env
   VITE_API_BASE_URL=https://your-backend-url.railway.app
   ```

2. **Redeploy Frontend to Vercel**:
   ```bash
   git add .
   git commit -m "Update API URL for production"
   git push
   ```

3. **Or update Vercel Environment Variables**:
   - Go to Vercel Dashboard
   - Select your project
   - Settings → Environment Variables
   - Add: `VITE_API_BASE_URL` = `https://your-backend-url.railway.app`
   - Redeploy

---

## Troubleshooting

### CORS Errors
- Make sure `FRONTEND_URL` and `CORS_ORIGIN` are set correctly
- Check that your Vercel URL matches exactly (with https://)

### Database Connection Errors
- Verify all database environment variables are set
- Check database is accessible from Railway/Render
- Review deployment logs

### 502 Bad Gateway
- Check if the server is starting correctly
- Review logs for errors
- Ensure PORT is set correctly

---

## Security Checklist

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Use strong database password
- [ ] Enable HTTPS (automatic on Railway/Render)
- [ ] Review CORS settings
- [ ] Set up database backups
- [ ] Monitor error logs

---

## Cost Estimate

### Railway (Recommended)
- **Free Tier**: $5 credit/month
- **Estimated Usage**: 
  - Web Service: ~$3-4/month
  - MySQL Database: ~$1-2/month
- **Total**: Free for small projects

### Render
- **Web Service**: Free (with limitations)
- **MySQL**: Need external service
- **Total**: Free + external DB cost

---

## Next Steps

1. Choose a deployment platform (Railway recommended)
2. Follow the steps above
3. Update frontend `.env` with new API URL
4. Test the production deployment
5. Monitor logs and performance

Good luck! 🚀
