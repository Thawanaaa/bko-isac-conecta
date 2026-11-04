'use client';

import Link from 'next/link';
import { useState } from 'react';
import { hasAdminPower, hasModerationPower, signOut as apiSignOut } from '../lib/ads';
import { useCurrentUser } from '../lib/useCurrentUser';

export default function AccountNavigation() {
  const { user, isLoading, error: authError } = useCurrentUser();
  const [error, setError] = useState('');

  async function signOut() {
    setError('');
    try {
      await apiSignOut();
      window.location.reload();
    } catch (signOutError) {
      setError(signOutError instanceof Error ? signOutError.message : 'Não foi possível encerrar a sessão.');
    }
  }

  if (isLoading) return null;
  if (authError) return <span role="alert" className="text-xs text-red-700">{authError}</span>;
  if (!user) {
    return <Link href="/login" className="inline-flex min-h-11 items-center rounded-md px-3 text-sm font-semibold hover:bg-areia">Entrar</Link>;
  }

  return (
    <div className="flex items-center gap-1">
      {hasModerationPower(user) && (
        <Link href="/moderation" className="hidden min-h-11 items-center rounded-md px-2 text-sm font-semibold hover:bg-areia sm:inline-flex">
          Moderação
        </Link>
      )}
      {hasAdminPower(user) && (
        <Link href="/admin/users" className="hidden min-h-11 items-center rounded-md px-2 text-sm font-semibold hover:bg-areia lg:inline-flex">
          Usuários
        </Link>
      )}
      <Link href="/my-ads" className="hidden min-h-11 items-center rounded-md px-2 text-sm font-semibold hover:bg-areia md:inline-flex">Meus anúncios</Link>
      <Link href="/profile" className="hidden min-h-11 items-center rounded-md px-2 text-sm font-semibold hover:bg-areia sm:inline-flex">Perfil</Link>
      <Link href="/shop" className="hidden min-h-11 items-center rounded-md px-2 text-sm font-semibold hover:bg-areia lg:inline-flex">Comércio</Link>
      <button type="button" onClick={signOut} className="inline-flex min-h-11 items-center rounded-md px-2 text-sm font-semibold hover:bg-areia">Sair</button>
      {error && <span role="alert" className="sr-only">{error}</span>}
    </div>
  );
}
