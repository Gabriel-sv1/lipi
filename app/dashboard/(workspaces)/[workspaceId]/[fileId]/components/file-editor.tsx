'use client';

import { useCallback, useState } from 'react';
import { DocumentEditor } from '@/components/editor/document-editor';
import { updateFile } from '@/lib/supabase/queries';
import { useRealtimeDocument } from '@/hooks/use-realtime-document';
import { useRealtimePresence } from '@/hooks/use-realtime-presence';
import { PresenceAvatars } from '@/components/presence-avatars';
import { useCurrentUser } from '@/lib/auth-client';

type FileEditorProps = {
  file: {
    id: string;
    title: string;
    data: string | null;
    icon_id: string;
    workspace_id: string;
  };
};

export function FileEditor({ file }: FileEditorProps) {
  const { user: currentUser, loading: userLoading } = useCurrentUser();
  const [localContent, setLocalContent] = useState(file.data || '');
  const [localTitle, setLocalTitle] = useState(file.title);

  const handleRemoteUpdate = useCallback((data: string, title: string) => {
    setLocalContent(data);
    setLocalTitle(title);
  }, []);

  const { markAsLocalUpdate } = useRealtimeDocument(file.id, handleRemoteUpdate);

  const { activeUsers, updateEditingStatus } = useRealtimePresence(
    file.id,
    file.workspace_id,
    currentUser || { id: '', name: null, email: null, image: null }
  );

  const handleContentChange = useCallback(
    async (content: string) => {
      try {
        setLocalContent(content);
        markAsLocalUpdate();
        await updateFile(file.id, { data: content });
        updateEditingStatus(true);
      } catch (err) {
        console.error('Error saving content:', err);
      }
    },
    [file.id, markAsLocalUpdate, updateEditingStatus]
  );

  const handleTitleChange = useCallback(
    async (title: string) => {
      try {
        setLocalTitle(title);
        markAsLocalUpdate();
        await updateFile(file.id, { title });
      } catch (err) {
        console.error('Error saving title:', err);
      }
    },
    [file.id, markAsLocalUpdate]
  );

  if (userLoading || !currentUser) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex size-full flex-col">
      <div className="flex items-center justify-end border-b px-4 py-2">
        <PresenceAvatars activeUsers={activeUsers} />
      </div>
      <DocumentEditor
        fileId={file.id}
        initialContent={localContent}
        title={localTitle}
        onContentChange={handleContentChange}
        onTitleChange={handleTitleChange}
      />
    </div>
  );
}
