"use client";

import { useEffect, useState } from "react";

export function useLayoutPreferences() {
  const [defaultLayout, setDefaultLayout] = useState<number[] | undefined>(undefined);
  const [defaultCollapsed, setDefaultCollapsed] = useState<boolean | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const layoutCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("react-resizable-panels:layout="));
    const collapsedCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("react-resizable-panels:collapsed="));

    if (layoutCookie) {
      try {
        const layoutValue = decodeURIComponent(layoutCookie.split("=")[1]);
        const parsed = JSON.parse(layoutValue);
        if (Array.isArray(parsed)) {
          setDefaultLayout(parsed as number[]);
        }
      } catch (e) {
        console.error("Failed to parse layout cookie:", e);
      }
    }

    if (collapsedCookie) {
      try {
        const collapsedValue = decodeURIComponent(collapsedCookie.split("=")[1]);
        const parsed = JSON.parse(collapsedValue);
        if (typeof parsed === "boolean") {
          setDefaultCollapsed(parsed);
        }
      } catch (e) {
        console.error("Failed to parse collapsed cookie:", e);
      }
    }

    setIsLoaded(true);
  }, []);

  return { defaultLayout, defaultCollapsed, isLoaded };
}
