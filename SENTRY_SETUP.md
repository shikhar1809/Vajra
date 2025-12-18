# Vajra Sentry - Threat Intelligence Setup Guide

## 🔑 API Keys Configuration

Your API keys have been provided. Follow these steps to set them up:

### Step 1: Create `.env.local` file

```bash
# Copy the example file
cp .env.example .env.local
```

### Step 2: Add your API keys to `.env.local`

```bash
# MalwareBazaar API Key
MALWAREBAZAAR_API_KEY=1ffb359b69073cf06859254f536a754f9728f71dbae4837a

# AlienVault OTX API Key
ALIENVAULT_API_KEY=bce2e71b85a5922e1fe741f73759c511c757982049c2521e6731acc0cb246945

# Generate a random CRON_SECRET
CRON_SECRET=$(openssl rand -hex 32)
```

### Step 3: Add Supabase credentials

Get these from your Supabase project dashboard:
- Project URL
- Anon key
- Service role key

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📊 Database Setup

### Step 1: Run the threat intelligence schema

1. Go to your Supabase project
2. Open SQL Editor
3. Copy and paste the contents of `supabase/threat-intelligence-schema.sql`
4. Click "Run"

### Step 2: Verify tables created

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('malware_hashes', 'malicious_urls', 'c2_servers', 'threat_feed_updates', 'document_scan_history');
```

You should see all 5 tables listed.

## 🔄 Initial Threat Intelligence Sync

### Option 1: Manual trigger (Recommended for first time)

```bash
# Start your dev server
npm run dev

# In another terminal, trigger the update
curl -X POST http://localhost:3001/api/cron/update-threats \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Option 2: Wait for automatic sync

The system will automatically sync every 6 hours once deployed to Vercel.

## ✅ Verification

### Check database was populated

```sql
-- Check malware hashes
SELECT COUNT(*) as total_hashes FROM malware_hashes;

-- Check malicious URLs  
SELECT COUNT(*) as total_urls FROM malicious_urls;

-- Check C2 servers
SELECT COUNT(*) as total_c2 FROM c2_servers;

-- View recent updates
SELECT * FROM threat_feed_updates ORDER BY updated_at DESC LIMIT 5;
```

Expected results:
- `total_hashes`: ~100 (from recent samples)
- `total_urls`: ~100
- `total_c2`: ~50
- Updates should show "success" status

### Test document scanning

1. Navigate to http://localhost:3001/sentry
2. Upload the EICAR test file:
   ```
   X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*
   ```
3. Should detect as malicious

## 🚀 Deployment to Vercel

### Step 1: Add environment variables

In Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.local`
3. Make sure to add them for all environments (Production, Preview, Development)

### Step 2: Deploy

```bash
git add .
git commit -m "Add Sentry threat intelligence system"
git push origin main
```

Vercel will automatically deploy and set up the cron job.

### Step 3: Verify cron job

1. Go to Vercel dashboard → Deployments → Cron Jobs
2. You should see `/api/cron/update-threats` scheduled for every 6 hours
3. Click "Run" to test manually

## 📈 Monitoring

### View update logs

```sql
SELECT 
  source,
  records_added,
  records_updated,
  status,
  updated_at
FROM threat_feed_updates
ORDER BY updated_at DESC
LIMIT 20;
```

### View scan statistics

```sql
SELECT 
  threat_level,
  COUNT(*) as count
FROM document_scan_history
GROUP BY threat_level;
```

## 🔧 Troubleshooting

### API key not working

1. Verify key is correct in `.env.local`
2. Restart dev server: `npm run dev`
3. Check API key validity at https://bazaar.abuse.ch/api/

### Database connection error

1. Check Supabase credentials
2. Verify service role key (not anon key) is used
3. Check Supabase project is active

### Cron job not running

1. Verify `vercel.json` exists
2. Check CRON_SECRET matches in Vercel environment variables
3. Redeploy to Vercel

## 📚 Resources

- MalwareBazaar API Docs: https://bazaar.abuse.ch/api/
- AlienVault OTX: https://otx.alienvault.com/api
- Vercel Cron Jobs: https://vercel.com/docs/cron-jobs
