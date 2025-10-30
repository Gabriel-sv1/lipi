'use client';

import { useEffect, useState } from 'react';

export type ClientUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export function useCurrentUser() {
  const [user, setUser] = useState<ClientUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data: unknown) => {
        const sessionData = data as { user?: ClientUser };
        if (sessionData.user) {
          setUser(sessionData.user);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching user:', err);
        setLoading(false);
      });
  }, []);

  return { user, loading };
}
