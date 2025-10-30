import React from "react";
import { redirect } from "next/navigation";

import { AppStateProvider } from "@/components/app-state-provider";
import { getCurrentUser } from "@/lib/auth";
import { getFiles, getFolders } from "@/lib/db/queries";
import { ResizableLayoutWrapper } from "../components/resizable-layout-wrapper";

export const WorkspaceLayout: React.FCC<{
  params: Promise<{ workspaceId: string }>;
}> = async ({ params, children }) => {
  const { workspaceId } = await params;

  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const [files, folders] = await Promise.all([
    getFiles(workspaceId),
    getFolders(workspaceId),
  ]);

  return (
    <AppStateProvider user={user} files={files!} folders={folders!}>
      <ResizableLayoutWrapper>
        {children}
      </ResizableLayoutWrapper>
    </AppStateProvider>
  );
};

export default WorkspaceLayout;
