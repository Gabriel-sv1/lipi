'use client';

import { useEffect, useState, useCallback } from 'react';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

type WorkspaceItem = {
  id: string;
  title: string;
  icon_id: string;
  workspace_id: string | null;
  folder_id?: string | null;
  created_at: string;
  updated_at?: string;
  in_trash: boolean;
};

export function useRealtimeSidebar(workspaceId: string) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [foldersChanged, setFoldersChanged] = useState<number>(0);
  const [filesChanged, setFilesChanged] = useState<number>(0);

  const triggerFoldersRefresh = useCallback(() => {
    setFoldersChanged((prev) => prev + 1);
  }, []);

  const triggerFilesRefresh = useCallback(() => {
    setFilesChanged((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!workspaceId) return;

    const channelName = `workspace-changes:${workspaceId}`;

    const realtimeChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'folders',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload: RealtimePostgresChangesPayload<WorkspaceItem>) => {
          triggerFoldersRefresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'files',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload: RealtimePostgresChangesPayload<WorkspaceItem>) => {
          triggerFilesRefresh();
        }
      )
      .subscribe();

    setChannel(realtimeChannel);

    return () => {
      realtimeChannel.unsubscribe();
    };
  }, [workspaceId, triggerFoldersRefresh, triggerFilesRefresh]);

  return {
    channel,
    foldersChanged,
    filesChanged,
  };
}
