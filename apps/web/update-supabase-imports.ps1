# Script to update all workspace pages to use new Supabase client

$files = @(
    "app\workspace\[workspaceSlug]\dashboard\page.tsx",
    "app\workspace\[workspaceSlug]\shield\page.tsx",
    "app\workspace\[workspaceSlug]\aegis\page.tsx",
    "app\workspace\[workspaceSlug]\scout\page.tsx",
    "app\workspace\[workspaceSlug]\sentry\page.tsx",
    "app\workspace\[workspaceSlug]\team\page.tsx",
    "app\workspace\[workspaceSlug]\settings\page.tsx",
    "app\workspace\[workspaceSlug]\layout.tsx"
)

foreach ($file in $files) {
    $path = "c:\Users\royal\Desktop\Vajra_AntiGravity\$file"
    if (Test-Path $path) {
        $content = Get-Content $path -Raw
        $content = $content -replace "import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'", "import { getSupabaseClient } from '@/lib/supabase/client'"
        $content = $content -replace "const supabase = createClientComponentClient\(\)", "const supabase = getSupabaseClient()"
        Set-Content $path $content -NoNewline
        Write-Host "Updated: $file"
    }
}

Write-Host "All files updated!"
