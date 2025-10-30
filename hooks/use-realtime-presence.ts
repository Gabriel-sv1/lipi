'use client';

import { useEffect, useState, useCallback } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

export type PresenceUser = {
  userId: string;
  userName: string;
  userEmail: string;
  userImage?: string;
  userColor: string;
  cursorPosition?: {
    x: number;
    y: number;
  };
  isEditing: boolean;
  lastSeenAt: string;
};

type PresenceState = {
  [userId: string]: PresenceUser;
};

export function useRealtimePresence(fileId: string, workspaceId: string, currentUser: {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}) {
  const [presenceState, setPresenceState] = useState<PresenceState>({});
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const generateUserColor = useCallback(() => {
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
      '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
      '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
      '#ec4899', '#f43f5e'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  useEffect(() => {
    if (!fileId || !workspaceId || !currentUser.id) return;

    const userColor = generateUserColor();
    const channelName = `presence:file:${fileId}`;

    const presenceChannel = supabase.channel(channelName, {
      config: {
        presence: {
          key: currentUser.id,
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState<PresenceUser>();
        const formattedState: PresenceState = {};

        Object.keys(state).forEach((userId) => {
          const presences = state[userId];
          if (presences && presences.length > 0) {
            formattedState[userId] = presences[0];
          }
        });

        setPresenceState(formattedState);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        setPresenceState((prev) => {
          const updated = { ...prev };
          if (newPresences && newPresences.length > 0) {
            updated[key] = newPresences[0] as unknown as PresenceUser;
          }
          return updated;
        });
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setPresenceState((prev) => {
          const updated = { ...prev };
          delete updated[key];
          return updated;
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            userId: currentUser.id,
            userName: currentUser.name || 'Anonymous',
            userEmail: currentUser.email || '',
            userImage: currentUser.image || undefined,
            userColor,
            isEditing: false,
            lastSeenAt: new Date().toISOString(),
          } as PresenceUser);
        }
      });

    setChannel(presenceChannel);

    return () => {
      presenceChannel.unsubscribe();
    };
  }, [fileId, workspaceId, currentUser, generateUserColor]);

  const updateCursorPosition = useCallback(
    async (position: { x: number; y: number }) => {
      if (!channel) return;

      await channel.track({
        userId: currentUser.id,
        userName: currentUser.name || 'Anonymous',
        userEmail: currentUser.email || '',
        userImage: currentUser.image || undefined,
        userColor: presenceState[currentUser.id]?.userColor || '#6366f1',
        cursorPosition: position,
        isEditing: true,
        lastSeenAt: new Date().toISOString(),
      } as PresenceUser);
    },
    [channel, currentUser, presenceState]
  );

  const updateEditingStatus = useCallback(
    async (isEditing: boolean) => {
      if (!channel) return;

      await channel.track({
        userId: currentUser.id,
        userName: currentUser.name || 'Anonymous',
        userEmail: currentUser.email || '',
        userImage: currentUser.image || undefined,
        userColor: presenceState[currentUser.id]?.userColor || '#6366f1',
        isEditing,
        lastSeenAt: new Date().toISOString(),
      } as PresenceUser);
    },
    [channel, currentUser, presenceState]
  );

  const activeUsers = Object.values(presenceState).filter(
    (user) => user.userId !== currentUser.id
  );

  return {
    activeUsers,
    presenceState,
    updateCursorPosition,
    updateEditingStatus,
  };
}
