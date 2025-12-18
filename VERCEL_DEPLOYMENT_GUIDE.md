# Vercel Deployment Guide for Vajra

## Error: 404: NOT_FOUND

This error typically occurs when Vercel cannot build or find your application. Here are the solutions:

## ✅ Solution 1: Configure Environment Variables

Your application requires these environment variables to be set in Vercel:

### Required Environment Variables:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
MALWAREBAZAAR_API_KEY=your_malwarebazaar_api_key_here
ALIENVAULT_API_KEY=your_alienvault_api_key_here
CRON_SECRET=your_random_secret_here
THREAT_FEED_UPDATE_INTERVAL=6
```

**Important:** Make sure to add these for all environments (Production, Preview, Development)

## ✅ Solution 2: Check Build Settings

Ensure your Vercel build settings are correct:

1. **Framework Preset**: Next.js
2. **Build Command**: `npm run build` or `next build`
3. **Output Directory**: `.next` (default)
4. **Install Command**: `npm install`
5. **Node Version**: 18.x or higher

## ✅ Solution 3: Update next.config.js

Your current `next.config.js` uses deprecated `domains` config. Update it to use `remotePatterns`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'trhfokxznsqlfiskhmxe.supabase.co',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
        ],
    },
    webpack: (config, { isServer }) => {
        config.module.rules.push({
            test: /\.(glb|gltf)$/,
            type: 'asset/resource',
        });

        config.module.rules.push({
            test: /lanyard\.png$/,
            type: 'asset/resource',
        });

        return config;
    },
}

module.exports = nextConfig
```

## ✅ Solution 4: Check Build Logs

1. Go to your Vercel deployment
2. Click on the failed deployment
3. Check the **Build Logs** tab
4. Look for specific error messages

Common build errors:
- Missing dependencies
- TypeScript errors
- Environment variable issues
- Module not found errors

## ✅ Solution 5: Verify Package.json Scripts

Ensure your `package.json` has the correct scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

## ✅ Solution 6: Test Build Locally

Before deploying, test the build locally:

```bash
npm run build
npm start
```

If the build fails locally, fix those errors first.

## 🔍 Debugging Steps

1. **Check Vercel Dashboard**:
   - Go to your project on Vercel
   - Look at the deployment logs
   - Check for specific error messages

2. **Verify Git Repository**:
   - Ensure all files are committed
   - Check that `.env.local` is in `.gitignore`
   - Verify `node_modules` is in `.gitignore`

3. **Check Function Logs**:
   - If the build succeeds but runtime fails
   - Check the Function Logs in Vercel
   - Look for API route errors

## 📝 Quick Checklist

- [ ] All environment variables added to Vercel
- [ ] Build command is correct (`next build`)
- [ ] Node version is 18.x or higher
- [ ] All dependencies are in `package.json`
- [ ] Local build works (`npm run build`)
- [ ] `.env.local` is not committed to Git
- [ ] `next.config.js` is properly configured

## 🚀 Redeploy

After making changes:

1. Push your changes to Git
2. Vercel will automatically redeploy
3. Or manually trigger a redeploy from the Vercel dashboard

## 💡 Common Issues

### Issue: "Module not found"
**Solution**: Ensure all imports use correct paths and all dependencies are installed

### Issue: "Build exceeded maximum duration"
**Solution**: Optimize build process or upgrade Vercel plan

### Issue: "Environment variable not defined"
**Solution**: Add missing variables in Vercel dashboard

### Issue: "Image optimization error"
**Solution**: Update `next.config.js` with correct image domains

## 📞 Still Having Issues?

If you're still seeing the 404 error:

1. Share the **complete build logs** from Vercel
2. Check if there are any TypeScript errors
3. Verify all API routes are properly structured
4. Ensure Supabase credentials are correct
