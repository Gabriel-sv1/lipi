# Next.js Context Diagnostics Report

Generated on: Thu Oct 30 19:22:48 UTC 2025

## Environment Information

### Node & Package Manager Versions
```
Node: v22.21.1
npm: 10.9.4
```

### Installed Package Versions
```
+-- @supabase/supabase-js@2.77.0
+-- drizzle-orm@0.36.4
+-- next-auth@5.0.0-beta.25
+-- next@15.5.6
+-- react-dom@18.3.1
`-- react@18.3.1
```

### WebContainer Detection
```
Running in WebContainer: NO
```

## Request-Scope API Usage

### Files using cookies()
```
app/dashboard/(workspaces)/[workspaceId]/layout.tsx:  const cookieStore = await cookies();
```

### Files using headers()
```
None found
```

### Files using redirect()
```
app/dashboard/page.tsx:    redirect('/login');
app/dashboard/page.tsx:    redirect('/dashboard/new-workspace');
app/dashboard/page.tsx:  redirect(`/dashboard/${workspace.id}`);
app/dashboard/(workspaces)/[workspaceId]/[fileId]/page.tsx:    redirect('/dashboard');
app/dashboard/(workspaces)/[workspaceId]/layout.tsx:  if (!user) redirect("/login");
app/dashboard/(workspaces)/[workspaceId]/page.tsx:    redirect('/dashboard');
app/dashboard/layout.tsx:  if (!user) redirect("/login");
lib/auth.ts:  if (!session) redirect("/login");
lib/actions.ts:  redirect("/");
lib/actions.ts:  redirect("/login");
```

### Files using revalidateTag()
```
lib/db/queries/file.ts:    revalidateTag("get_files");
lib/db/queries/file.ts:    revalidateTag("get_files");
lib/db/queries/folder.ts:    revalidateTag("get_folders");
lib/db/queries/folder.ts:    revalidateTag("get_folders");
lib/db/queries/workspace.ts:    revalidateTag("get_private_workspaces");
lib/db/queries/workspace.ts:    revalidateTag("get_collaborating_workspaces");
lib/db/queries/workspace.ts:    revalidateTag("get_shared_workspaces");
```

### Files using unstable_cache()
```
lib/db/queries/file.ts:import { unstable_cache as cache, revalidateTag } from "next/cache";
lib/db/queries/folder.ts:import { unstable_cache as cache, revalidateTag } from "next/cache";
lib/db/queries/workspace.ts:import { unstable_cache as cache, revalidateTag } from "next/cache";
```

## Middleware & Route Handlers

### Middleware Files
```
./middleware.ts
```

### Route Handlers
```
app/api/auth/[...nextauth]/route.ts
```

## Server Actions

### Files with 'use server' directive
```
lib/db/queries/file.ts:"use server";
lib/db/queries/folder.ts:"use server";
lib/db/queries/workspace.ts:"use server";
lib/db/queries/subscription.ts:"use server";
lib/actions.ts:"use server";
```

