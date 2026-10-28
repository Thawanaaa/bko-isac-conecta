import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowRight, ClipboardList, Store } from 'lucide-react';
import AdCard from '../components/AdCard';
import { getActiveAds, getCategoryName, type Ad } from '../lib/ads';

async function ActiveAds() {
  let ads: Ad[] = [];
  let errorMessage = '';

  try {
    ads = await getActiveAds();
  } catch {
    errorMessage = 'Não foi possível carregar os anúncios. Tente novamente em instantes.';
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-9 sm:px-6 sm:py-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-emerald-800">Anúncios ativos</p>
            <h2 className="mt-1 text-2xl font-bold">Feitos no seu bairro</h2>
          </div>
          {!errorMessage && <p className="text-sm text-slate-600">{ads.length} oportunidades</p>}
        </div>

        {errorMessage ? (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-900">
            {errorMessage}
          </div>
        ) : ads.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ads.map((ad) => (
              <AdCard
                key={ad.id}
                title={ad.title}
                price={ad.price}
                category={getCategoryName(ad)}
                location={ad.location || 'Local não informado'}
                contactPhone={ad.contact_phone || ''}
                isVerified={Boolean(ad.is_verified)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-stone-300 bg-white px-5 py-12 text-center">
            <Store aria-hidden="true" className="mx-auto text-emerald-800" size={28} />
            <h3 className="mt-3 font-bold">Ainda não há anúncios ativos</h3>
            <p className="mt-1 text-sm text-slate-600">
              Volte em breve para ver as novidades da comunidade.
            </p>
          </div>
        )}
    </section>
  );
}

function AdsLoading() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-9 sm:px-6 sm:py-12" aria-live="polite">
      <div className="mb-6 h-8 w-56 animate-pulse rounded bg-stone-200" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-52 animate-pulse rounded-lg border border-stone-200 bg-white" />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-stone-50 text-slate-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-4 px-4 sm:flex-nowrap sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
            <span className="grid size-9 place-items-center rounded-md bg-emerald-800 text-white">
              <Store aria-hidden="true" size={19} />
            </span>
            ISAC Conecta
          </Link>
          <nav
            aria-label="Navegação principal"
            className="flex w-full items-center justify-end gap-1 pb-3 sm:w-auto sm:gap-2 sm:pb-0"
          >
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center rounded-md px-3 text-sm font-semibold text-slate-700 hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="inline-flex min-h-11 items-center rounded-md border border-emerald-800 px-3 text-sm font-semibold text-emerald-900 transition-colors hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
            >
              Criar conta
            </Link>
            <Link
              href="/moderation"
              className="hidden min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-slate-700 hover:bg-stone-100 sm:inline-flex"
            >
              <ClipboardList aria-hidden="true" size={17} />
              Moderação
            </Link>
            <Link
              href="/publish"
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-emerald-800 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
            >
              Publicar
              <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </nav>
        </div>
      </header>

      <section className="border-b border-emerald-950 bg-emerald-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-200">
            Vitrine da comunidade
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-extrabold leading-tight sm:text-4xl">
            O que você procura pode estar aqui perto.
          </h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-emerald-100">
            Produtos, serviços e oportunidades de quem faz a economia do bairro acontecer.
          </p>
        </div>
      </section>

      <Suspense fallback={<AdsLoading />}>
        <ActiveAds />
      </Suspense>
    </main>
  );
}