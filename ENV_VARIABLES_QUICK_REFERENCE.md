# 🔐 Environment Variables Reference for Vercel Deployment

## Backend Environment Variables

Copy and paste these into Vercel Backend Project → Settings → Environment Variables:

```
MONGODB_URI=mongodb+srv://ifa-hiring:pSmdw6aTJzSG22VZ@ifa-cluster.fc0erda.mongodb.net/ifahiring?appName=IFA-Cluster
VITE_GOOGLE_CLIENT_ID=415852681005-l0e7c4khn5qp2lcenouasl3kkbn9v58l.apps.googleusercontent.com
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://YOUR-FRONTEND-URL.vercel.app
```

**⚠️ Replace `YOUR-FRONTEND-URL` with your actual frontend URL after deploying frontend!**

---

## Frontend Environment Variables

Copy and paste these into Vercel Frontend Project → Settings → Environment Variables:

```
VITE_API_URL=https://YOUR-BACKEND-URL.vercel.app/api
VITE_GOOGLE_CLIENT_ID=415852681005-l0e7c4khn5qp2lcenouasl3kkbn9v58l.apps.googleusercontent.com
```

**⚠️ Replace `YOUR-BACKEND-URL` with your actual backend URL after deploying backend!**

---

## Deployment Order

1. ✅ Deploy **Backend** first → Get backend URL
2. ✅ Deploy **Frontend** with backend URL → Get frontend URL  
3. ✅ Update **Backend** `FRONTEND_URL` with frontend URL → Redeploy backend
4. ✅ Update **Google OAuth** with both URLs

---

## Quick Commands for Each Step

### Step 1: Add Backend Environment Variables
```
Name: MONGODB_URI
Value: mongodb+srv://ifa-hiring:pSmdw6aTJzSG22VZ@ifa-cluster.fc0erda.mongodb.net/ifahiring?appName=IFA-Cluster

Name: VITE_GOOGLE_CLIENT_ID
Value: 415852681005-l0e7c4khn5qp2lcenouasl3kkbn9v58l.apps.googleusercontent.com

Name: PORT
Value: 5000

Name: NODE_ENV
Value: production

Name: FRONTEND_URL
Value: (leave empty for now, update after frontend deployment)
```

### Step 2: Add Frontend Environment Variables
```
Name: VITE_API_URL
Value: https://YOUR-BACKEND-URL.vercel.app/api

Name: VITE_GOOGLE_CLIENT_ID
Value: 415852681005-l0e7c4khn5qp2lcenouasl3kkbn9v58l.apps.googleusercontent.com
```

---

## ⚠️ Important Notes

1. **Always include `/api` at the end of backend URL in frontend**
2. **Redeploy backend after updating FRONTEND_URL**
3. **Update Google OAuth Console with Vercel URLs**
4. **Both projects must be from the same GitHub repo but different root directories**

---

## Testing After Deployment

Visit your frontend URL and test:
- ✅ Page loads
- ✅ Google login works
- ✅ Roles appear in applicant form
- ✅ Admin can add/remove roles
- ✅ Changes sync within 10 seconds

If anything doesn't work, check:
1. Environment variables are correct
2. Google OAuth has Vercel URLs added
3. Backend is deployed and responding
4. Clear browser cache and try again
