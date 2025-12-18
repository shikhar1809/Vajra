# Vercel Deployment Checklist

## ✅ Completed
- [x] Fixed next.config.js (updated to use remotePatterns)
- [x] Added Unsplash domain for images
- [x] Added outputFileTracingRoot to silence warnings
- [x] Verified local build works successfully

## 🔴 Action Required (Do This Now!)

### Step 1: Add Environment Variables to Vercel
1. Go to https://vercel.com/dashboard
2. Select your Vajra project
3. Go to **Settings** → **Environment Variables**
4. Add these variables (copy values from your `.env.local` file):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
MALWAREBAZAAR_API_KEY
ALIENVAULT_API_KEY
CRON_SECRET
THREAT_FEED_UPDATE_INTERVAL
```

5. Make sure to select **All** environments (Production, Preview, Development)
6. Click **Save**

### Step 2: Redeploy
After adding environment variables:
- Option A: Push this commit to trigger auto-deploy
- Option B: Go to Deployments → Click ⋯ → Redeploy

### Step 3: Verify
- Wait for deployment to complete
- Visit your Vercel URL
- Check if the site loads properly

## 📝 Commit These Changes

Run these commands to commit the fixes:

```bash
git add next.config.js VERCEL_FIX.md VERCEL_DEPLOYMENT_GUIDE.md VERCEL_CHECKLIST.md
git commit -m "Fix Vercel deployment: Update next.config.js and add deployment guides"
git push
```

## 🎯 Expected Outcome

After completing these steps:
- ✅ Build will succeed on Vercel
- ✅ Application will be accessible
- ✅ All routes will work
- ✅ Images will load properly

## ❌ If Still Not Working

1. Check Vercel build logs for specific errors
2. Verify all environment variables are set correctly
3. Ensure Node.js version is 18.x or 20.x
4. Check that all values in environment variables are correct (no typos)

## 💡 Pro Tips

- Environment variables are the #1 cause of Vercel 404 errors
- Always test `npm run build` locally before deploying
- Check Vercel build logs for detailed error messages
- Make sure your Supabase URL and keys are correct
