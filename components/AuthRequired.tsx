'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useCurrentUser } from '../lib/useCurrentUser';

export default function AuthRequired({ children }: { children: ReactNode }) {
  const { user, isLoading, error } = useCurrentUser();

  if (isLoading) {
    return <p className="p-8 text-center text-sm text-slate-600">Validando sua sessão...</p>;
  }
  if (error) {
    return <p role="alert" className="m-6 rounded-md bg-red-50 p-4 text-sm text-red-900">{error}</p>;
  }
  if (!user) {
    return (
      <div className="m-6 rounded-lg border border-salvia bg-white p-6 text-center">
        <p className="font-semibold">Entre na sua conta para acessar esta página.</p>
        <Link href="/login" className="mt-3 inline-block font-semibold text-petroleo underline">
          Entrar ou criar conta
        </Link>
      </div>
    );
  }
  return children;
}
