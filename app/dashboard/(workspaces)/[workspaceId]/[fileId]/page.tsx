'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { DocumentEditor } from '@/components/editor/document-editor';
import { getFileById, updateFile } from '@/lib/supabase/queries';
import { Loader2 } from 'lucide-react';

export default function FilePage() {
  const params = useParams();
  const fileId = params.fileId as string;

  const [file, setFile] = useState<{
    id: string;
    title: string;
    data: string | null;
    icon_id: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFile() {
      try {
        setIsLoading(true);
        const fileData = await getFileById(fileId);

        if (!fileData) {
          setError('File not found');
          return;
        }

        setFile(fileData);
      } catch (err) {
        console.error('Error loading file:', err);
        setError('Failed to load file');
      } finally {
        setIsLoading(false);
      }
    }

    if (fileId) {
      loadFile();
    }
  }, [fileId]);

  const handleContentChange = useCallback(
    async (content: string) => {
      if (!file) return;

      try {
        await updateFile(fileId, { data: content });
      } catch (err) {
        console.error('Error saving content:', err);
      }
    },
    [fileId, file]
  );

  const handleTitleChange = useCallback(
    async (title: string) => {
      if (!file) return;

      try {
        await updateFile(fileId, { title });
        setFile({ ...file, title });
      } catch (err) {
        console.error('Error saving title:', err);
      }
    },
    [fileId, file]
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">{error || 'File not found'}</h2>
          <p className="mt-2 text-muted-foreground">
            The file you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <DocumentEditor
      fileId={file.id}
      initialContent={file.data || ''}
      title={file.title}
      onContentChange={handleContentChange}
      onTitleChange={handleTitleChange}
    />
  );
}
