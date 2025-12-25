# Vercel 404 Error - Troubleshooting Guide

## ✅ Changes Made

1. **Added Node.js version specification** to `package.json`
2. **Created `.nvmrc` file** to ensure Vercel uses Node 18.17.0+
3. **Pushed changes to GitHub** - Vercel will auto-deploy

## 🔍 Root Cause Analysis

The 404 error on Vercel is typically caused by:

### 1. **Missing Environment Variables** (MOST COMMON)
Your application requires environment variables that are NOT automatically copied from `.env.local`.

### 2. **Build Failures**
The build might be failing silently, causing Vercel to show a 404 instead of your app.

### 3. **Node.js Version Mismatch**
Next.js 15 requires Node.js 18.17.0 or higher. Older versions will fail.

---

## 🚀 Step-by-Step Fix

### **Step 1: Add Environment Variables to Vercel** ⚠️ CRITICAL

1. Go to [vercel.com](https://vercel.com) → Your Project
2. Click **Settings** → **Environment Variables**
3. Add **ALL** of these variables:

```bash
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://trhfokxznsqlfiskhmxe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyaGZva3h6bnNxbGZpc2tobXhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwMjMwMzcsImV4cCI6MjA4MTU5OTAzN30.a2YWPcsi9RuHSSn1QZDoyBc8X8ifa95SO5m9VpnvXHA
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyaGZva3h6bnNxbGZpc2tobXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjAyMzAzNywiZXhwIjoyMDgxNTk5MDM3fQ.MnfK73MaS4_pxKd6EMzdj7opA_-0xCe-5fBcKdpw3eg

# APIs (REQUIRED)
GOOGLE_SAFE_BROWSING_API_KEY=AIzaSyCXnAbWoxUVuR23TL7YCljgI9qbmCIKzH0
MALWAREBAZAAR_API_KEY=1ffb359b69073cf06859254f536a754f9728f71dbae4837a
ALIENVAULT_API_KEY=bce2e71b85a5922e1fe741f73759c511c757982049c2521e6731acc0cb246945
CRON_SECRET=vajra_threat_intel_secret_2024

# App Config (REQUIRED)
NEXT_PUBLIC_APP_NAME=Vajra
NEXT_PUBLIC_APP_URL=https://your-vercel-url.vercel.app
```

**IMPORTANT:** 
- Select **Production**, **Preview**, AND **Development** for each variable
- Update `NEXT_PUBLIC_APP_URL` with your actual Vercel URL

### **Step 2: Verify Build Settings**

In Vercel → **Settings** → **General**:

- ✅ **Framework Preset**: Next.js
- ✅ **Build Command**: `npm run build`
- ✅ **Output Directory**: `.next`
- ✅ **Install Command**: `npm install`
- ✅ **Node.js Version**: 18.x or 20.x

### **Step 3: Check Build Logs**

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Check the **Build Logs** tab
4. Look for errors like:
   - `Module not found`
   - `Environment variable not defined`
   - `Build exceeded maximum duration`
   - `npm install failed`

### **Step 4: Redeploy**

After adding environment variables:

**Option A: Automatic (Recommended)**
- Push a new commit to GitHub (already done!)
- Vercel will auto-deploy

**Option B: Manual**
- Go to **Deployments** → Click **⋯** → **Redeploy**

**Option C: CLI**
```bash
vercel --prod
```

---

## 🔧 Additional Fixes

### If Build Still Fails:

#### **Fix 1: Clear Vercel Cache**
```bash
vercel --force
```

#### **Fix 2: Check for TypeScript Errors**
```bash
npm run type-check
```

#### **Fix 3: Verify Local Build**
```bash
npm run build
npm start
```

#### **Fix 4: Check Package Dependencies**
```bash
npm audit fix
npm install
```

---

## 📋 Deployment Checklist

- [ ] All environment variables added to Vercel
- [ ] Variables set for Production, Preview, Development
- [ ] Build settings verified (Next.js, Node 18+)
- [ ] Local build successful (`npm run build`)
- [ ] Changes pushed to GitHub
- [ ] Vercel deployment triggered
- [ ] Build logs checked for errors
- [ ] Deployment URL accessible

---

## 🐛 Common Errors & Solutions

### Error: "Module not found: Can't resolve 'X'"
**Solution:** 
```bash
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

### Error: "Environment variable NEXT_PUBLIC_SUPABASE_URL is not defined"
**Solution:** Add the variable in Vercel dashboard (Step 1)

### Error: "Build exceeded maximum duration"
**Solution:** 
- Optimize imports (use dynamic imports for heavy components)
- Upgrade Vercel plan if needed

### Error: "npm install failed"
**Solution:** 
- Check `package.json` for invalid dependencies
- Ensure Node version is 18.17.0+

---

## 🎯 Expected Result

After following these steps, you should see:

1. ✅ Successful build in Vercel dashboard
2. ✅ Deployment URL shows your application
3. ✅ No 404 errors
4. ✅ All features working correctly

---

## 📞 Still Having Issues?

If the 404 persists:

1. **Share the build logs** from Vercel
2. **Check Function Logs** in Vercel dashboard
3. **Verify Supabase connection** is working
4. **Test API routes** individually

### Quick Debug Commands:

```bash
# Test build locally
npm run build

# Check for TypeScript errors
npm run type-check

# Verify environment variables
cat .env.local

# Force redeploy
vercel --force --prod
```

---

## 📚 Resources

- [Vercel Deployment Docs](https://vercel.com/docs/deployments/overview)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)

---

**Last Updated:** December 18, 2024
**Status:** Node.js version fix applied, awaiting Vercel deployment
