'use client';

import { useCallback } from 'react';
import { DocumentEditor } from '@/components/editor/document-editor';
import { updateFile } from '@/lib/supabase/queries';

type FileEditorProps = {
  file: {
    id: string;
    title: string;
    data: string | null;
    icon_id: string;
  };
};

export function FileEditor({ file }: FileEditorProps) {
  const handleContentChange = useCallback(
    async (content: string) => {
      try {
        await updateFile(file.id, { data: content });
      } catch (err) {
        console.error('Error saving content:', err);
      }
    },
    [file.id]
  );

  const handleTitleChange = useCallback(
    async (title: string) => {
      try {
        await updateFile(file.id, { title });
      } catch (err) {
        console.error('Error saving title:', err);
      }
    },
    [file.id]
  );

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
