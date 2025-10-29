import { redirect } from 'next/navigation';
import { getWorkspaceById, getWorkspaceFolders, getWorkspaceFiles } from '@/lib/supabase/queries';
import { WorkspaceContent } from './components/workspace-content';

type WorkspacePageProps = {
  params: Promise<{ workspaceId: string }>;
};

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { workspaceId } = await params;

  if (!workspaceId) {
    redirect('/dashboard');
  }

  try {
    const [workspace, folders, files] = await Promise.all([
      getWorkspaceById(workspaceId),
      getWorkspaceFolders(workspaceId),
      getWorkspaceFiles(workspaceId),
    ]);

    if (!workspace) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Workspace not found</h2>
            <p className="mt-2 text-muted-foreground">
              The workspace you&apos;re looking for doesn&apos;t exist or has been deleted.
            </p>
          </div>
        </div>
      );
    }

    return <WorkspaceContent workspace={workspace} initialFolders={folders} initialFiles={files} />;
  } catch (err) {
    console.error('Error loading workspace:', err);
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Error loading workspace</h2>
          <p className="mt-2 text-muted-foreground">
            There was an error loading this workspace. Please try again.
          </p>
        </div>
      </div>
    );
  }
}
