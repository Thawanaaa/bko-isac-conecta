'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, BadgeCheck, Check, Clock3, LoaderCircle, MapPin, X } from 'lucide-react';
import { getCategoryName, getPendingAds, moderateAd } from '../../lib/ads';
import type { Ad, ModerationAction } from '../../lib/ads';

export default function ModerationPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let isCurrent = true;
    getPendingAds()
      .then((pendingAds) => {
        if (isCurrent) setAds(pendingAds);
      })
      .catch((requestError: unknown) => {
        if (isCurrent) {
          setLoadError(
            requestError instanceof Error
              ? requestError.message
              : 'Não foi possível carregar a fila de moderação.',
          );
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  async function handleModeration(id: string, action: ModerationAction) {
    setBusyId(id);
    setError('');
    try {
      await moderateAd(id, action);
      setAds((currentAds) => currentAds.filter((ad) => ad.id !== id));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Não foi possível atualizar o anúncio. Tente novamente.',
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 text-slate-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-700 hover:text-emerald-800"
          >
            <ArrowLeft aria-hidden="true" size={18} />
            Vitrine
          </Link>
          <span className="text-sm font-extrabold text-emerald-950">ISAC Conecta</span>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-9 sm:px-6 sm:py-12">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-stone-200 pb-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">
              Painel da equipe
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Fila de moderação</h1>
          </div>
          {!isLoading && <p className="text-sm text-slate-600">{ads.length} pendentes</p>}
        </div>

        {(loadError || error) && (
          <p role="alert" className="mt-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-900">
            {error || loadError}
          </p>
        )}

        {isLoading ? (
          <p className="flex items-center gap-2 py-10 text-sm text-slate-600" role="status">
            <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />
            Carregando anúncios...
          </p>
        ) : loadError ? (
          <p className="py-8 text-sm text-slate-600">A fila não pôde ser carregada.</p>
        ) : ads.length === 0 ? (
          <div className="py-14 text-center">
            <BadgeCheck aria-hidden="true" className="mx-auto text-emerald-800" size={30} />
            <h2 className="mt-3 text-lg font-bold">Fila em dia</h2>
            <p className="mt-1 text-sm text-slate-600">Não há anúncios aguardando revisão.</p>
          </div>
        ) : (
          <ul className="divide-y divide-stone-200">
            {ads.map((ad) => (
              <li key={ad.id} className="grid gap-5 py-6 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                      {getCategoryName(ad)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                      <Clock3 aria-hidden="true" size={14} />
                      Aguardando aprovação
                    </span>
                  </div>
                  <h2 className="mt-2 text-lg font-bold">{ad.title}</h2>
                  {ad.description && (
                    <p className="mt-1 line-clamp-3 text-sm leading-6 text-slate-600">
                      {ad.description}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                    <span className="font-semibold text-emerald-800">
                      {ad.price === null
                        ? 'A combinar'
                        : new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(ad.price)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin aria-hidden="true" size={15} />
                      {ad.location || 'Local não informado'}
                    </span>
                    {ad.contact_phone && <span>{ad.contact_phone}</span>}
                  </div>
                </div>

                <div className="flex gap-2 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => handleModeration(ad.id, 'approve')}
                    disabled={busyId !== null}
                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-emerald-800 px-4 text-sm font-bold text-white transition-colors hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 sm:flex-none"
                  >
                    {busyId === ad.id ? (
                      <LoaderCircle aria-hidden="true" className="animate-spin" size={16} />
                    ) : (
                      <Check aria-hidden="true" size={16} />
                    )}
                    Aprovar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeration(ad.id, 'reject')}
                    disabled={busyId !== null}
                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md border border-red-300 px-4 text-sm font-bold text-red-800 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-800 sm:flex-none"
                  >
                    <X aria-hidden="true" size={16} />
                    Descartar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}