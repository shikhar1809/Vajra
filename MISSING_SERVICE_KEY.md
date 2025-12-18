# ⚠️ IMPORTANT: Missing Environment Variable

## Issue
The threat intelligence update is failing because `SUPABASE_SERVICE_ROLE_KEY` is missing from `.env.local`.

## Solution

### Step 1: Get your Supabase Service Role Key

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/trhfokxznsqlfiskhmxe
2. Click on "Settings" (gear icon) in the left sidebar
3. Click on "API"
4. Scroll down to "Project API keys"
5. Copy the **`service_role`** key (NOT the anon key)
   - It's labeled as "service_role" and has a warning that it should be kept secret

### Step 2: Add to `.env.local`

Add this line to your `.env.local` file:

```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 3: Restart dev server

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

### Step 4: Test again

```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/cron/update-threats" -Method POST -Headers @{"Authorization"="Bearer your_random_secret_here"} | Select-Object -ExpandProperty Content
```

## Why is this needed?

The service role key is required to:
- Insert/update records in Supabase tables
- Bypass Row Level Security (RLS) policies
- Perform administrative operations

The anon key you already have is for client-side operations only.

## Security Note

⚠️ **NEVER commit the service role key to git!**
- It's already in `.gitignore` as `.env.local`
- This key has full database access
- Only use it in server-side code
