# 🚀 Vercel Deployment Guide - IFA Hiring Platform

## ✅ Pre-Deployment Checklist

Your project is **DEPLOYMENT READY**! All necessary configurations are in place.

---

## 📦 Part 1: Deploy Backend (API)

### Step 1: Import Backend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository: `Ajinkyaa2004/IFA-Hiring-Platform`
4. Vercel will detect the repository

### Step 2: Configure Backend Project

When setting up the project:

1. **Project Name**: `ifa-hiring-backend` (or your preferred name)
2. **Framework Preset**: Select **"Other"**
3. **Root Directory**: Click **"Edit"** → Select `backend`
4. **Build Settings**: Leave as default (Vercel will use the `vercel.json` in backend folder)

### Step 3: Environment Variables for Backend

Click **"Environment Variables"** and add these:

```env
# REQUIRED - Database
MONGODB_URI=mongodb+srv://ifa-hiring:pSmdw6aTJzSG22VZ@ifa-cluster.fc0erda.mongodb.net/ifahiring?appName=IFA-Cluster

# REQUIRED - Google OAuth
VITE_GOOGLE_CLIENT_ID=415852681005-l0e7c4khn5qp2lcenouasl3kkbn9v58l.apps.googleusercontent.com

# REQUIRED - Server Config
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app

# OPTIONAL - OpenAI (for chatbot, can skip if not using)
VITE_OPENAI_API_KEY=your_openai_api_key_here

# OPTIONAL - Gmail API (for email sending, can skip if not using)
GMAIL_CLIENT_ID=your-gmail-client-id
GMAIL_CLIENT_SECRET=your-gmail-client-secret
GMAIL_REDIRECT_URI=https://your-backend-url.vercel.app/auth/callback
GMAIL_REFRESH_TOKEN=your-gmail-refresh-token

# OPTIONAL - Twilio WhatsApp (can skip if not using)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# OPTIONAL - Telegram Bot (can skip if not using)
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
```

**⚠️ IMPORTANT**: 
- Set `NODE_ENV` to `production`
- Leave `FRONTEND_URL` empty for now - we'll update it after deploying frontend

### Step 4: Deploy Backend

1. Click **"Deploy"**
2. Wait for deployment to complete (2-3 minutes)
3. Note your backend URL: `https://ifa-hiring-backend.vercel.app`

---

## 🎨 Part 2: Deploy Frontend

### Step 1: Import Frontend to Vercel

1. Go back to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Import the **SAME** GitHub repository: `Ajinkyaa2004/IFA-Hiring-Platform`

### Step 2: Configure Frontend Project

When setting up:

1. **Project Name**: `ifa-hiring-frontend` (or your preferred name)
2. **Framework Preset**: Select **"Vite"** (it should auto-detect)
3. **Root Directory**: Click **"Edit"** → Select `frontend`
4. **Build Settings**: 
   - Build Command: `npm run build`
   - Output Directory: `dist`

### Step 3: Environment Variables for Frontend

Click **"Environment Variables"** and add these **2 REQUIRED** variables:

```env
# REQUIRED - Backend API URL (use your backend URL from Part 1)
VITE_API_URL=https://ifa-hiring-backend.vercel.app/api

# REQUIRED - Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=415852681005-l0e7c4khn5qp2lcenouasl3kkbn9v58l.apps.googleusercontent.com
```

**⚠️ IMPORTANT**: 
- Replace `ifa-hiring-backend` with YOUR actual backend Vercel URL
- Make sure to include `/api` at the end of the backend URL

### Step 4: Deploy Frontend

1. Click **"Deploy"**
2. Wait for deployment to complete (2-3 minutes)
3. Note your frontend URL: `https://ifa-hiring-frontend.vercel.app`

---

## 🔄 Part 3: Update Backend Environment

### Update FRONTEND_URL in Backend

1. Go to your **Backend project** in Vercel Dashboard
2. Go to **"Settings"** → **"Environment Variables"**
3. Find `FRONTEND_URL` and click **"Edit"**
4. Update it to your frontend URL: `https://ifa-hiring-frontend.vercel.app`
5. Click **"Save"**
6. Go to **"Deployments"** tab
7. Click the **"..."** menu on the latest deployment → **"Redeploy"**

---

## 🔐 Part 4: Update Google OAuth (IMPORTANT!)

You need to add your Vercel URLs to Google OAuth:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **"APIs & Services"** → **"Credentials"**
4. Click on your OAuth 2.0 Client ID
5. Under **"Authorized JavaScript origins"**, add:
   ```
   https://ifa-hiring-frontend.vercel.app
   https://your-custom-domain.com (if you have one)
   ```
6. Under **"Authorized redirect URIs"**, add:
   ```
   https://ifa-hiring-frontend.vercel.app
   https://ifa-hiring-frontend.vercel.app/auth/callback
   ```
7. Click **"Save"**

---

## ✅ Part 5: Testing Your Deployment

### Test Checklist:

1. **Frontend loads**: Visit `https://ifa-hiring-frontend.vercel.app`
2. **Google Login works**: Try logging in with Google
3. **Backend API works**: Check if data loads (roles, settings, etc.)
4. **Admin Dashboard**: Login as admin and test adding roles
5. **Applicant Form**: Test filling out the profile form
6. **WhatsApp Links**: Verify role-specific and community links work
7. **Auto-refresh**: Change roles in admin, wait 10 seconds, check if applicant form updates

---

## 🛠️ Troubleshooting

### Issue: "Failed to fetch" or API errors

**Solution**:
1. Check if `VITE_API_URL` in frontend includes `/api` at the end
2. Verify backend is deployed and accessible
3. Check browser console for CORS errors

### Issue: Google Login not working

**Solution**:
1. Verify you added Vercel URLs to Google OAuth (Part 4)
2. Check if `VITE_GOOGLE_CLIENT_ID` is correct in frontend
3. Wait 5-10 minutes for Google OAuth changes to propagate

### Issue: Database connection errors

**Solution**:
1. Verify `MONGODB_URI` is correct in backend environment variables
2. Check MongoDB Atlas network access allows all IPs (0.0.0.0/0)
3. Ensure database user has read/write permissions

### Issue: Environment variables not working

**Solution**:
1. After adding/changing environment variables, **redeploy** the project
2. Vercel requires redeployment for env changes to take effect
3. Clear browser cache and hard refresh (Ctrl+Shift+R)

---

## 📝 Quick Summary

### Backend Environment Variables (Required):
```
MONGODB_URI=<your-mongodb-uri>
VITE_GOOGLE_CLIENT_ID=<your-google-client-id>
PORT=5000
NODE_ENV=production
FRONTEND_URL=<your-frontend-url>
```

### Frontend Environment Variables (Required):
```
VITE_API_URL=<your-backend-url>/api
VITE_GOOGLE_CLIENT_ID=<your-google-client-id>
```

---

## 🎉 Done!

Your IFA Hiring Platform is now live on Vercel!

- **Frontend**: `https://ifa-hiring-frontend.vercel.app`
- **Backend API**: `https://ifa-hiring-backend.vercel.app/api`

### Custom Domain (Optional):

To add a custom domain:
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Update Google OAuth with new domain

---

## 📞 Need Help?

If you encounter any issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify all environment variables are set correctly
4. Ensure MongoDB Atlas allows connections from anywhere
