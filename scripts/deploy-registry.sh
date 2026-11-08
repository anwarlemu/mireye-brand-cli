#!/bin/sh
# Publishes the registry files (apps/www/public/r, built by the registry step) to the public Vercel project named by
# brand.json's registryHost, so shadcn, MCP and HTTP agents can read /r/ while the library site stays behind login.
# Run after the registry build, from the repository root: sh scripts/deploy-registry.sh. VERCEL_SCOPE picks the team.
set -e
cd "$(dirname "$0")/.."
host=$(node -e "const b=JSON.parse(require('fs').readFileSync('brand/brand.json','utf8'));process.stdout.write(b.registryHost||'')")
[ -n "$host" ] || { echo "brand.json has no registryHost: the library site serves /r/ itself."; exit 0; }
[ -f apps/www/public/r/index.json ] || { echo "No apps/www/public/r/index.json: build the registry first."; exit 1; }
project=$(printf '%s' "$host" | sed -E 's#^https?://##; s#\..*##')
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
cp -R apps/www/public/r "$tmp/r"
cat > "$tmp/vercel.json" <<JSON
{
  "cleanUrls": false,
  "headers": [
    { "source": "/r/(.*)", "headers": [
      { "key": "Access-Control-Allow-Origin", "value": "*" },
      { "key": "Cache-Control", "value": "public, max-age=300, must-revalidate" }
    ] }
  ],
  "redirects": [{ "source": "/", "destination": "/r/index.json", "permanent": false }]
}
JSON
cd "$tmp"
vercel link --yes --project "$project" --scope "${VERCEL_SCOPE:-agencidev-dev}" >/dev/null
vercel deploy --prod --yes --scope "${VERCEL_SCOPE:-agencidev-dev}" >/dev/null
echo "Registry published at $host/r/index.json"
