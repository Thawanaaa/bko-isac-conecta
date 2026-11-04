'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AuthRequired from '../../components/AuthRequired';
import { getCategoryName, getPendingAds, moderateAd, type Ad, type ModerationAction } from '../../lib/ads';

function ModerationQueue() {
  const [pendingAds, setPendingAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getPendingAds()
      .then((ads) => {
        if (active) setPendingAds(ads);
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(requestError instanceof Error ? requestError.message : 'Não foi possível carregar a fila de moderação.');
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleModeration(id: string, action: ModerationAction) {
    setActiveAction(id);
    setError('');
    try {
      await moderateAd(id, action);
      setPendingAds((ads) => ads.filter((ad) => ad.id !== id));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Não foi possível atualizar o anúncio.');
    } finally {
      setActiveAction(null);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">PAINEL DA EQUIPE</span>
          <h1 className="mt-1 text-3xl font-extrabold text-gray-900">Fila de moderação</h1>
        </div>
        <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800">
          {pendingAds.length} pendentes
        </span>
      </div>

      {error && <p role="alert" className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-900">{error}</p>}
      {isLoading ? (
        <p className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600">Carregando fila de moderação...</p>
      ) : pendingAds.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500 shadow-sm">
          <p className="text-base font-semibold text-gray-700">Tudo limpo por aqui!</p>
          <p className="mt-1 text-sm">Nenhum anúncio pendente na fila de moderação.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingAds.map((ad) => {
            const profile = Array.isArray(ad.profiles) ? ad.profiles[0] : ad.profiles;
            return (
              <article key={ad.id} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{ad.title}</h2>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Enviado por <span className="font-medium text-gray-700">{profile?.name || 'Usuário'}</span>
                      {profile?.phone ? ` (${profile.phone})` : ''} &bull; {new Date(ad.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">{getCategoryName(ad)}</span>
                </div>

                <p className="text-sm leading-relaxed text-gray-600">{ad.description || 'Sem descrição.'}</p>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    disabled={activeAction !== null}
                    onClick={() => handleModeration(ad.id, 'reject')}
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                  >
                    {activeAction === ad.id ? 'Salvando...' : 'Recusar'}
                  </button>
                  <button
                    type="button"
                    disabled={activeAction !== null}
                    onClick={() => handleModeration(ad.id, 'approve')}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {activeAction === ad.id ? 'Salvando...' : 'Aprovar anúncio'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default function ModerationPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-600 transition-colors hover:text-gray-900">
          <span className="mr-2">&larr;</span> Vitrine
        </Link>
        <div className="text-lg font-bold text-gray-900">ISAC Conecta</div>
      </header>
      <AuthRequired requiredRole="moderator"><ModerationQueue /></AuthRequired>
    </div>
  );
}
