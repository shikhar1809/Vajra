# Supabase Database Deployment Instructions

## Step 1: Deploy Schema to Supabase

### Option A: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://supabase.com/dashboard/project/trhfokxznsqlfiskhmxe
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of `enhanced-security-schema.sql`
5. Paste into the SQL editor
6. Click **Run** (or press Ctrl+Enter)
7. Wait for confirmation: "Success. No rows returned"

### Option B: Via Supabase CLI

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref trhfokxznsqlfiskhmxe

# Run the migration
supabase db push
```

## Step 2: Create Missing Base Tables

The schema references some tables that need to be created first. Run this SQL:

```sql
-- Create vendors table (referenced by vendor_risk_scores)
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    domain TEXT NOT NULL UNIQUE,
    security_score INTEGER DEFAULT 0 CHECK (security_score >= 0 AND security_score <= 100),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    compliance_certifications TEXT[] DEFAULT '{}',
    last_assessment TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_vendors_domain ON vendors(domain);
```

## Step 3: Enable Row Level Security (RLS)

After authentication is set up, enable RLS on all tables:

```sql
-- Enable RLS on all tables
ALTER TABLE security_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE attack_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE crowdsec_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE threat_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE phishing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE phishing_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_security_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vsi_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (after auth is set up)
-- For now, allow all authenticated users (will be refined later)
CREATE POLICY "Allow authenticated users" ON vendors
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users" ON vendor_risk_scores
    FOR ALL USING (auth.role() = 'authenticated');

-- Repeat for other tables...
```

## Step 4: Verify Deployment

Run this query to check all tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected tables:
- attack_paths
- bot_detections
- code_scans
- crowdsec_cache
- employee_security_scores
- phishing_campaigns
- phishing_results
- security_alerts
- security_entities
- security_relationships
- threat_analyses
- vendor_monitoring
- vendor_risk_scores
- vendors
- vsi_history

## Step 5: Test Database Connection

Update your `.env.local` with Supabase credentials (already done):

```env
NEXT_PUBLIC_SUPABASE_URL=https://trhfokxznsqlfiskhmxe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Test connection:

```typescript
// Test in app/api/test-db/route.ts
import { createClient } from '@supabase/supabase-js';

export async function GET() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { data, error } = await supabase.from('vendors').select('count');
    
    return Response.json({ success: !error, data, error });
}
```

## Troubleshooting

### Error: "relation does not exist"
- Make sure you ran the schema SQL
- Check table names are correct (lowercase, underscores)

### Error: "permission denied"
- RLS is enabled but no policies exist
- Temporarily disable RLS or add permissive policies

### Error: "foreign key violation"
- Create the `vendors` table first before running the main schema

## Next Steps

After database is deployed:
1. ✅ Set up authentication (Phase 1.2)
2. ✅ Update API routes to use real database
3. ✅ Test all CRUD operations
