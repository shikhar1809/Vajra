# 🚀 Quick Test - Threat Intelligence System

## ⚠️ IMPORTANT: Restart Dev Server First!

The `.env.local` file was just updated with your API keys. **You MUST restart the dev server** for the changes to take effect.

### Step 1: Restart Dev Server

```powershell
# Press Ctrl+C in the terminal running npm run dev
# Then restart:
npm run dev
```

### Step 2: Test the Threat Intelligence Update

Once the dev server is running on http://localhost:3001, run this command:

```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/cron/update-threats" -Method POST -Headers @{"Authorization"="Bearer vajra_threat_intel_secret_2024"}
```

### Expected Success Response:

```json
{
  "success": true,
  "message": "Threat intelligence updated successfully",
  "timestamp": "2024-12-18T...",
  "totalAdded": 100,
  "totalUpdated": 0,
  "results": [
    {
      "source": "malware_hashes",
      "added": 100,
      "updated": 0,
      "status": "success"
    },
    ...
  ]
}
```

### Step 3: Verify Database

Go to your Supabase SQL Editor and run:

```sql
-- Check malware hashes
SELECT COUNT(*) as total_hashes FROM malware_hashes;

-- View recent malware
SELECT hash, malware_family, threat_level, source 
FROM malware_hashes 
ORDER BY first_seen DESC 
LIMIT 10;

-- Check update logs
SELECT * FROM threat_feed_updates ORDER BY updated_at DESC LIMIT 5;
```

## 🐛 Troubleshooting

### If you get a 500 error:

1. Check the dev server terminal for error messages
2. Verify all environment variables are set in `.env.local`:
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `MALWAREBAZAAR_API_KEY`
   - `ALIENVAULT_API_KEY`
   - `CRON_SECRET`

### If you get a 401 Unauthorized:

- Make sure the `CRON_SECRET` in the command matches the one in `.env.local`

### If the command hangs:

- The API might be fetching data (can take 30-60 seconds for first run)
- Wait for the response

## ✅ Success Indicators

You'll know it worked when:
1. The command returns a JSON response with `"success": true`
2. Your Supabase database has records in `malware_hashes`, `malicious_urls`, and `c2_servers` tables
3. The `threat_feed_updates` table shows successful updates

## 📊 What Happens Next?

After successful setup:
- Threat intelligence updates automatically every 6 hours (when deployed to Vercel)
- Document scanning will use this data to detect malware
- You can manually trigger updates anytime with the PowerShell command above
