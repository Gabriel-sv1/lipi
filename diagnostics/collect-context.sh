#!/bin/bash

echo "# Next.js Context Diagnostics Report" > diagnostics/next-context.md
echo "" >> diagnostics/next-context.md
echo "Generated on: $(date)" >> diagnostics/next-context.md
echo "" >> diagnostics/next-context.md

echo "## Environment Information" >> diagnostics/next-context.md
echo "" >> diagnostics/next-context.md

echo "### Node & Package Manager Versions" >> diagnostics/next-context.md
echo "\`\`\`" >> diagnostics/next-context.md
echo "Node: $(node --version)" >> diagnostics/next-context.md
echo "npm: $(npm --version)" >> diagnostics/next-context.md
echo "\`\`\`" >> diagnostics/next-context.md
echo "" >> diagnostics/next-context.md

echo "### Installed Package Versions" >> diagnostics/next-context.md
echo "\`\`\`" >> diagnostics/next-context.md
npm list next react react-dom next-auth @supabase/supabase-js drizzle-orm --depth=0 2>/dev/null | grep -E "next@|react@|react-dom@|next-auth@|supabase-js@|drizzle-orm@" >> diagnostics/next-context.md
echo "\`\`\`" >> diagnostics/next-context.md
echo "" >> diagnostics/next-context.md

echo "### WebContainer Detection" >> diagnostics/next-context.md
echo "\`\`\`" >> diagnostics/next-context.md
if [ -n "$WEBCONTAINER_ID" ]; then
  echo "Running in WebContainer: YES" >> diagnostics/next-context.md
  echo "WebContainer ID: $WEBCONTAINER_ID" >> diagnostics/next-context.md
else
  echo "Running in WebContainer: NO" >> diagnostics/next-context.md
fi
echo "\`\`\`" >> diagnostics/next-context.md
echo "" >> diagnostics/next-context.md

echo "## Request-Scope API Usage" >> diagnostics/next-context.md
echo "" >> diagnostics/next-context.md

echo "### Files using cookies()" >> diagnostics/next-context.md
echo "\`\`\`" >> diagnostics/next-context.md
grep -r "cookies()" app --include="*.ts" --include="*.tsx" | grep -v node_modules >> diagnostics/next-context.md 2>&1 || echo "None found" >> diagnostics/next-context.md
echo "\`\`\`" >> diagnostics/next-context.md
echo "" >> diagnostics/next-context.md

echo "### Files using headers()" >> diagnostics/next-context.md
echo "\`\`\`" >> diagnostics/next-context.md
grep -r "headers()" app --include="*.ts" --include="*.tsx" | grep -v node_modules >> diagnostics/next-context.md 2>&1 || echo "None found" >> diagnostics/next-context.md
echo "\`\`\`" >> diagnostics/next-context.md
echo "" >> diagnostics/next-context.md

echo "### Files using redirect()" >> diagnostics/next-context.md
echo "\`\`\`" >> diagnostics/next-context.md
grep -r "redirect(" app lib --include="*.ts" --include="*.tsx" | grep -v node_modules | head -20 >> diagnostics/next-context.md 2>&1 || echo "None found" >> diagnostics/next-context.md
echo "\`\`\`" >> diagnostics/next-context.md
echo "" >> diagnostics/next-context.md

echo "### Files using revalidateTag()" >> diagnostics/next-context.md
echo "\`\`\`" >> diagnostics/next-context.md
grep -r "revalidateTag(" lib --include="*.ts" --include="*.tsx" | grep -v node_modules >> diagnostics/next-context.md 2>&1 || echo "None found" >> diagnostics/next-context.md
echo "\`\`\`" >> diagnostics/next-context.md
echo "" >> diagnostics/next-context.md

echo "### Files using unstable_cache()" >> diagnostics/next-context.md
echo "\`\`\`" >> diagnostics/next-context.md
grep -r "unstable_cache" lib --include="*.ts" --include="*.tsx" | grep -v node_modules >> diagnostics/next-context.md 2>&1 || echo "None found" >> diagnostics/next-context.md
echo "\`\`\`" >> diagnostics/next-context.md
echo "" >> diagnostics/next-context.md

echo "## Middleware & Route Handlers" >> diagnostics/next-context.md
echo "" >> diagnostics/next-context.md

echo "### Middleware Files" >> diagnostics/next-context.md
echo "\`\`\`" >> diagnostics/next-context.md
find . -name "middleware.ts" -o -name "middleware.js" | grep -v node_modules >> diagnostics/next-context.md 2>&1 || echo "None found" >> diagnostics/next-context.md
echo "\`\`\`" >> diagnostics/next-context.md
echo "" >> diagnostics/next-context.md

echo "### Route Handlers" >> diagnostics/next-context.md
echo "\`\`\`" >> diagnostics/next-context.md
find app -name "route.ts" -o -name "route.js" | grep -v node_modules >> diagnostics/next-context.md 2>&1 || echo "None found" >> diagnostics/next-context.md
echo "\`\`\`" >> diagnostics/next-context.md
echo "" >> diagnostics/next-context.md

echo "## Server Actions" >> diagnostics/next-context.md
echo "" >> diagnostics/next-context.md

echo "### Files with 'use server' directive" >> diagnostics/next-context.md
echo "\`\`\`" >> diagnostics/next-context.md
grep -r '"use server"' app lib --include="*.ts" --include="*.tsx" | grep -v node_modules >> diagnostics/next-context.md 2>&1 || echo "None found" >> diagnostics/next-context.md
echo "\`\`\`" >> diagnostics/next-context.md
echo "" >> diagnostics/next-context.md

echo "Diagnostics report generated at: diagnostics/next-context.md"
