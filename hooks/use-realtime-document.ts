'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

type FileUpdate = {
  id: string;
  title: string;
  data: string | null;
  updated_at: string;
};

export function useRealtimeDocument(fileId: string, onRemoteUpdate: (data: string, title: string) => void) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const lastUpdateTime = useRef<number>(0);
  const isLocalUpdate = useRef<boolean>(false);

  useEffect(() => {
    if (!fileId) return;

    const channelName = `file-changes:${fileId}`;

    const realtimeChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'files',
          filter: `id=eq.${fileId}`,
        },
        (payload: RealtimePostgresChangesPayload<FileUpdate>) => {
          const now = Date.now();

          if (isLocalUpdate.current && now - lastUpdateTime.current < 1000) {
            isLocalUpdate.current = false;
            return;
          }

          const newData = payload.new as FileUpdate;
          if (newData && newData.data !== null && newData.data !== undefined) {
            onRemoteUpdate(newData.data, newData.title);
          }
        }
      )
      .subscribe();

    setChannel(realtimeChannel);

    return () => {
      realtimeChannel.unsubscribe();
    };
  }, [fileId, onRemoteUpdate]);

  const markAsLocalUpdate = useCallback(() => {
    isLocalUpdate.current = true;
    lastUpdateTime.current = Date.now();
  }, []);

  return {
    channel,
    markAsLocalUpdate,
  };
}
