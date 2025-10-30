'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { PresenceUser } from '@/hooks/use-realtime-presence';

type PresenceAvatarsProps = {
  activeUsers: PresenceUser[];
  maxDisplay?: number;
};

export function PresenceAvatars({ activeUsers, maxDisplay = 5 }: PresenceAvatarsProps) {
  const displayedUsers = activeUsers.slice(0, maxDisplay);
  const extraCount = Math.max(0, activeUsers.length - maxDisplay);

  if (activeUsers.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="flex items-center -space-x-2">
        {displayedUsers.map((user) => (
          <Tooltip key={user.userId}>
            <TooltipTrigger asChild>
              <div
                className="relative inline-block"
                style={{
                  outline: `2px solid ${user.userColor}`,
                  outlineOffset: '1px',
                  borderRadius: '50%',
                }}
              >
                <Avatar className="size-8 border-2 border-background">
                  <AvatarImage src={user.userImage} alt={user.userName} />
                  <AvatarFallback
                    style={{ backgroundColor: user.userColor }}
                    className="text-xs text-white"
                  >
                    {user.userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {user.isEditing && (
                  <span
                    className="absolute bottom-0 right-0 size-2 rounded-full border-2 border-background"
                    style={{ backgroundColor: user.userColor }}
                  />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">{user.userName}</p>
              <p className="text-xs text-muted-foreground">
                {user.isEditing ? 'Editing' : 'Viewing'}
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
        {extraCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative inline-block">
                <Avatar className="size-8 border-2 border-background">
                  <AvatarFallback className="bg-muted text-xs">
                    +{extraCount}
                  </AvatarFallback>
                </Avatar>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{extraCount} more viewing</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
