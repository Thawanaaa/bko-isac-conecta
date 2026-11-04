'use client';

import { useEffect, useState } from 'react';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { getSupabaseClient } from './supabase';

export function useCurrentUser() {
  const [supabaseState] = useState<{ client: SupabaseClient | null; error: string }>(() => {
    try {
      return { client: getSupabaseClient(), error: '' };
    } catch (clientError) {
      return {
        client: null,
        error: clientError instanceof Error ? clientError.message : 'Não foi possível inicializar o Supabase.',
      };
    }
  });
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(supabaseState.client));
  const [error, setError] = useState(supabaseState.error);

  useEffect(() => {
    const supabase = supabaseState.client;
    if (!supabase) return;
    let active = true;

    supabase.auth.getUser().then(({ data, error: authError }) => {
      if (!active) return;
      if (authError) setError(`Não foi possível validar sua sessão: ${authError.message}`);
      setUser(data.user);
      setIsLoading(false);
    }).catch((authError: unknown) => {
      if (!active) return;
      setError(authError instanceof Error ? authError.message : 'Não foi possível validar sua sessão.');
      setIsLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ?? null);
      setError('');
      setIsLoading(false);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [supabaseState.client]);

  return { user, isLoading, error };
}
