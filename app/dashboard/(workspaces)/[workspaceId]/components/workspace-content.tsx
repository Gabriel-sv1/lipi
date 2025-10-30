'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Folder, Plus } from 'lucide-react';
import { useRealtimeSidebar } from '@/hooks/use-realtime-sidebar';
import { getWorkspaceFolders, getWorkspaceFiles } from '@/lib/supabase/queries';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createFile, createFolder } from '@/lib/supabase/queries';

type WorkspaceContentProps = {
  workspace: {
    id: string;
    title: string;
    icon_id: string;
  };
  initialFolders: Array<{
    id: string;
    title: string;
    icon_id: string;
  }>;
  initialFiles: Array<{
    id: string;
    title: string;
    icon_id: string;
  }>;
};

export function WorkspaceContent({
  workspace,
  initialFolders,
  initialFiles,
}: WorkspaceContentProps) {
  const router = useRouter();
  const [folders, setFolders] = useState(initialFolders);
  const [files, setFiles] = useState(initialFiles);
  const [showFileDialog, setShowFileDialog] = useState(false);
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');

  const { foldersChanged, filesChanged } = useRealtimeSidebar(workspace.id);

  useEffect(() => {
    const refreshFolders = async () => {
      const updatedFolders = await getWorkspaceFolders(workspace.id);
      setFolders(updatedFolders);
    };
    refreshFolders();
  }, [foldersChanged, workspace.id]);

  useEffect(() => {
    const refreshFiles = async () => {
      const updatedFiles = await getWorkspaceFiles(workspace.id);
      setFiles(updatedFiles);
    };
    refreshFiles();
  }, [filesChanged, workspace.id]);

  const handleCreateFile = async () => {
    if (!newFileName.trim()) return;

    try {
      const newFile = await createFile({
        title: newFileName,
        iconId: '📄',
        workspaceId: workspace.id,
        data: '',
      });

      setFiles([...files, newFile]);
      setNewFileName('');
      setShowFileDialog(false);

      router.push(`/dashboard/${workspace.id}/${newFile.id}`);
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
        workspaceId: workspace.id,
        data: '',
      });

      setFolders([...folders, newFolder]);
      setNewFolderName('');
      setShowFolderDialog(false);
    } catch (err) {
      console.error('Error creating folder:', err);
    }
  };

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
                  onClick={() => router.push(`/dashboard/${workspace.id}/${folder.id}`)}
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
                  onClick={() => router.push(`/dashboard/${workspace.id}/${file.id}`)}
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
