"use client";

import { useLayoutPreferences } from "./layout-provider";
import { ResizableLayout } from "./resizable-layout";

export function ResizableLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { defaultLayout, defaultCollapsed, isLoaded } = useLayoutPreferences();

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <ResizableLayout
      defaultLayout={defaultLayout as number[]}
      defaultCollapsed={defaultCollapsed as boolean}
    >
      {children}
    </ResizableLayout>
  );
}
