'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getWorkspaceById,
  getWorkspaceFolders,
  getWorkspaceFiles,
  createFile,
  createFolder,
} from '@/lib/supabase/queries';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Folder, Plus, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;

  const [workspace, setWorkspace] = useState<{
    id: string;
    title: string;
    icon_id: string;
  } | null>(null);
  const [folders, setFolders] = useState<Array<{
    id: string;
    title: string;
    icon_id: string;
  }>>([]);
  const [files, setFiles] = useState<Array<{
    id: string;
    title: string;
    icon_id: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFileDialog, setShowFileDialog] = useState(false);
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    async function loadWorkspace() {
      try {
        setIsLoading(true);
        const [workspaceData, foldersData, filesData] = await Promise.all([
          getWorkspaceById(workspaceId),
          getWorkspaceFolders(workspaceId),
          getWorkspaceFiles(workspaceId),
        ]);

        setWorkspace(workspaceData);
        setFolders(foldersData);
        setFiles(filesData);
      } catch (err) {
        console.error('Error loading workspace:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (workspaceId) {
      loadWorkspace();
    }
  }, [workspaceId]);

  const handleCreateFile = async () => {
    if (!newFileName.trim()) return;

    try {
      const newFile = await createFile({
        title: newFileName,
        iconId: '📄',
        workspaceId,
        data: '',
      });

      setFiles([...files, newFile]);
      setNewFileName('');
      setShowFileDialog(false);

      router.push(`/dashboard/${workspaceId}/${newFile.id}`);
    } catch (err) {
      console.error('Error creating file:', err);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const newFolder = await createFolder({
        title: newFolderName,
        iconId: '📁',
        workspaceId,
        data: '',
      });

      setFolders([...folders, newFolder]);
      setNewFolderName('');
      setShowFolderDialog(false);
    } catch (err) {
      console.error('Error creating folder:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">{workspace.title}</h1>
          <p className="mt-2 text-muted-foreground">
            Organize your documents with folders and files
          </p>
        </div>

        <div className="mb-6 flex gap-2">
          <Dialog open={showFolderDialog} onOpenChange={setShowFolderDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 size-4" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="folder-name">Folder Name</Label>
                  <Input
                    id="folder-name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Enter folder name"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateFolder();
                      }
                    }}
                  />
                </div>
                <Button onClick={handleCreateFolder} className="w-full">
                  Create Folder
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showFileDialog} onOpenChange={setShowFileDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 size-4" />
                New Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file-name">Document Name</Label>
                  <Input
                    id="file-name"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="Enter document name"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateFile();
                      }
                    }}
                  />
                </div>
                <Button onClick={handleCreateFile} className="w-full">
                  Create Document
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {folders.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Folders</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {folders.map((folder) => (
                <Card
                  key={folder.id}
                  className="cursor-pointer transition-colors hover:bg-accent"
                  onClick={() => router.push(`/dashboard/${workspaceId}/${folder.id}`)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Folder className="size-5" />
                      {folder.title}
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {files.length > 0 && (
          <div>
            <h2 className="mb-4 text-2xl font-semibold">Documents</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {files.map((file) => (
                <Card
                  key={file.id}
                  className="cursor-pointer transition-colors hover:bg-accent"
                  onClick={() => router.push(`/dashboard/${workspaceId}/${file.id}`)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="size-5" />
                      {file.title}
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {folders.length === 0 && files.length === 0 && (
          <div className="mt-16 text-center">
            <FileText className="mx-auto size-16 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">No content yet</h3>
            <p className="mt-2 text-muted-foreground">
              Create your first folder or document to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
