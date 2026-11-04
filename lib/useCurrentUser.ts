'use client';

import { useEffect, useState } from 'react';
import { ApiRequestError } from './api';
import { getCurrentUser, type CurrentUser } from './ads';

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getCurrentUser()
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        if (requestError instanceof ApiRequestError && requestError.status === 401) {
          setUser(null);
          return;
        }
        setError(requestError instanceof Error ? requestError.message : 'Não foi possível validar sua sessão.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { user, isLoading, error };
}
