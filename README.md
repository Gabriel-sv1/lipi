<div align=center>

<!-- labels -->

![][ci] ![][views] ![][stars] ![][forks] ![][issues] ![][license] ![][repo-size]

<!-- title -->

# Lipi

### [WIP] 🚀 A SAAS web app, a Notion.so replica, featuring real-time collaboration and customizable workspaces built using ▲ Next.js, shadcn/ui, TailwindCSS

<picture>
  <source media="(prefers-color-scheme: light)" srcset="https://graph.org/file/93d7d38ec83bc4e9ba1d3.png">
  <source media="(prefers-color-scheme: dark)" srcset="https://graph.org/file/ad59213e3b1ece0bdc95e.png">
  <img src="https://graph.org/file/93d7d38ec83bc4e9ba1d3.png" alt="lipi">
</picture>

**[<kbd> <br> &nbsp;**Live Demo**&nbsp; <br> </kbd>][site]**

## Building from Source

</div>

- Fetch latest source code from master branch.

```
git clone https://github.com/rajput-hemant/lipi
cd lipi
```

- Rename **.env.example** => **.env.local**, add your own environment variables.

- Run the app with VS Code or the command line:

```
bun i || pnpm i || npm i || yarn
bun dev || pnpm dev || npm run dev || yarn dev
```

<div align=center>

### Docker and Makefile

</div>

- Build the Docker Image and start the container:

```
make build
make start
```

- Stop the Docker container:

```
make stop
```

<div align=center>

## WebContainers/Bolt Workarounds

</div>

This project has been optimized to work in WebContainer environments (like Bolt). The following changes were made to resolve the `workUnitAsyncStorage` error that occurs with Next.js 15.5.x in WebContainers:

### Changes Applied

1. **Next.js Version Pinned to 15.0.3**: Downgraded from 15.5.6 (canary) to 15.0.3 stable to avoid async storage issues in WebContainers.

2. **Removed Server-Side Cookie Access in Layouts**: Moved resizable panel layout preferences from server-side `cookies()` API to client-side cookie reading to avoid request context issues.
   - Created `useLayoutPreferences()` hook for client-side cookie access
   - Added `ResizableLayoutWrapper` component to handle layout state on the client

3. **Database Client Consolidation**: Replaced Supabase client calls in server components with Drizzle ORM queries to ensure consistent database access patterns.
   - Dashboard page now uses `getRecentWorkspace()` from Drizzle queries
   - All server-side database operations use Drizzle ORM with proper caching

4. **Health Check Endpoint**: Added `/api/health/request-scope` route to validate request context APIs are working correctly.

5. **Diagnostics Tools**: Added `diagnostics/collect-context.sh` script to automatically detect environment and list request-scope API usage.

### Running Diagnostics

**Quick Verification (Recommended):**

```bash
bash diagnostics/verify-dynamic-apis.sh
```

This performs a quick health check:
- Verifies Node.js and Next.js versions
- Checks if Turbopack is enabled
- Detects problematic imports in middleware
- Finds top-level API calls
- Validates Server Actions configuration
- Checks for "use cache" conflicts
- Verifies runtime configuration

**Detailed Report:**

```bash
bash diagnostics/collect-context.sh
```

This generates a comprehensive report at `diagnostics/next-context.md` with:
- Node.js and package versions
- WebContainer detection
- Files using request-scope APIs (cookies, headers, redirect, etc.)
- Middleware and route handlers inventory
- Server actions with "use server" directive

### Health Check

**Simple Health Check (Browser):**

Visit http://localhost:3000/_health

Expected: Page showing "✅ OK" with timestamp

**API Health Check (Request-Scope Validation):**

```bash
curl http://localhost:3000/api/health/request-scope
```

Expected response includes environment information and confirmation that cookies/headers are accessible.

### Known Limitations

- Next.js 15.5.x canary builds may have async storage issues in WebContainer environments
- Server-side cookie access in layouts can cause workUnitAsyncStorage errors
- Edge runtime in middleware works correctly with NextAuth but avoid using Node-specific APIs

### Rollback Instructions

If you need to revert these changes:

1. Restore Next.js version to latest: `"next": "^15.0.4-canary.33"`
2. Restore server-side cookies in workspace layout (see git history)
3. Run `npm install` to update dependencies
4. Clear `.next` cache: `npm run clean`

<div align=center>

### Deploy Your Own

You can deploy your own hosted version of `lipi`. Just click the link below to deploy a ready-to-go version to Vercel.

[![Deploy with Vercel](https://vercel.com/button)][deploy]

## Star History

<a href="https://star-history.com/#rajput-hemant/lipi">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=rajput-hemant/lipi&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=rajput-hemant/lipi" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=rajput-hemant/lipi" />
 </picture>
</a>

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributors:

[![][contributors]][contributors-graph]

_Note: It may take up to 24h for the [contrib.rocks][contrib-rocks] plugin to update because it's refreshed once a day._

</div>

<!----------------------------------{ Labels }--------------------------------->

[views]: https://komarev.com/ghpvc/?username=lipi&label=view%20counter&color=red&style=flat
[repo-size]: https://img.shields.io/github/repo-size/rajput-hemant/lipi
[issues]: https://img.shields.io/github/issues-raw/rajput-hemant/lipi
[license]: https://img.shields.io/github/license/rajput-hemant/lipi
[forks]: https://img.shields.io/github/forks/rajput-hemant/lipi?style=flat
[stars]: https://img.shields.io/github/stars/rajput-hemant/lipi
[contributors]: https://contrib.rocks/image?repo=rajput-hemant/lipi&max=500
[contributors-graph]: https://github.com/rajput-hemant/lipi/graphs/contributors
[contrib-rocks]: https://contrib.rocks/preview?repo=rajput-hemant%2Flipi
[ci]: https://github.com/rajput-hemant/lipi/actions/workflows/ci.yml/badge.svg

<!-----------------------------------{ Links }---------------------------------->

[site]: https://lipi.rajputhemant.me
[deploy]: https://vercel.com/new/clone?repository-url=https://github.com/rajput-hemant/lipi&project-name=lipi&repo-name=lipi&env=SKIP_ENV_VALIDATION,AUTH_SECRET,GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET,GITHUB_CLIENT_ID,GITHUB_CLIENT_SECRET,GITHUB_ACCESS_TOKEN,DATABASE_URL,UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN,ENABLE_RATE_LIMITING,RATE_LIMITING_REQUESTS_PER_SECOND
