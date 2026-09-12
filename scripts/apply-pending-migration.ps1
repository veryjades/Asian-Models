# Apply pending Supabase migrations to the live dev project.
# Requires one of:
#   - SUPABASE_ACCESS_TOKEN (from `npx supabase login`) + linked project
#   - SUPABASE_DB_URL (postgres connection string from Supabase Dashboard > Settings > Database)

param(
  [string]$MigrationFile = "supabase/migrations/20260818140000_news_media_storage_policy.sql"
)

$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

if (-not (Test-Path $MigrationFile)) {
  Write-Error "Migration file not found: $MigrationFile"
}

if ($env:SUPABASE_DB_URL) {
  Write-Host "Applying migration via psql..."
  $sql = Get-Content $MigrationFile -Raw
  if (Get-Command psql -ErrorAction SilentlyContinue) {
    $sql | psql $env:SUPABASE_DB_URL
    Write-Host "Done."
    exit 0
  }
  Write-Host "psql not found. Trying npx supabase db push..."
  npx supabase db push --db-url $env:SUPABASE_DB_URL
  exit $LASTEXITCODE
}

if ($env:SUPABASE_ACCESS_TOKEN) {
  Write-Host "Pushing migrations via Supabase CLI..."
  npx supabase link --project-ref jkhxtuwqmmdetjqymzso
  npx supabase db push
  exit $LASTEXITCODE
}

Write-Host @"

Migration NOT applied — no credentials found.

Option A (recommended): Supabase Dashboard SQL Editor
  1. Open https://supabase.com/dashboard/project/jkhxtuwqmmdetjqymzso/sql/new
  2. Paste contents of: $MigrationFile
  3. Run

Option B: CLI with access token
  `$env:SUPABASE_ACCESS_TOKEN = '<token from supabase login>'
  .\scripts\apply-pending-migration.ps1

Option C: Direct psql
  `$env:SUPABASE_DB_URL = 'postgresql://postgres.[ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres'
  .\scripts\apply-pending-migration.ps1

Verify after apply:
  SELECT column_name FROM information_schema.columns
  WHERE table_name = 'news_posts' AND column_name = 'body_blocks';

"@
exit 1
