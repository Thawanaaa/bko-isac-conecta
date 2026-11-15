'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
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

  if (isLoading) {
    return <span role="status" className="text-sm text-petroleo-tinta/70">Verificando acesso...</span>;
  }
  if (authError) {
    return (
      <>
        <span role="alert" className="sr-only">{authError}</span>
        <Link href="/login" className="inline-flex min-h-11 items-center rounded-md px-3 text-sm font-semibold hover:bg-areia">
          Entrar
        </Link>
      </>
    );
  }
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
      <Link
        href="/publish"
        className="inline-flex min-h-11 items-center gap-2 rounded-md bg-petroleo px-4 text-sm font-semibold text-white transition-colors hover:bg-petroleo-escuro focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo"
      >
        Publicar
        <ArrowRight aria-hidden="true" size={16} />
      </Link>
      <Link href="/my-ads" className="hidden min-h-11 items-center rounded-md px-2 text-sm font-semibold hover:bg-areia md:inline-flex">Meus anúncios</Link>
      <Link href="/profile" className="hidden min-h-11 items-center rounded-md px-2 text-sm font-semibold hover:bg-areia sm:inline-flex">Perfil</Link>
      <Link href="/shop" className="hidden min-h-11 items-center rounded-md px-2 text-sm font-semibold hover:bg-areia lg:inline-flex">Comércio</Link>
      <button type="button" onClick={signOut} className="inline-flex min-h-11 items-center rounded-md px-2 text-sm font-semibold hover:bg-areia">Sair</button>
      {error && <span role="alert" className="sr-only">{error}</span>}
    </div>
  );
}
