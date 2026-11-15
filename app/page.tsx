import Link from 'next/link';
import { io } from 'next/cache';
import { Suspense } from 'react';
import { Store } from 'lucide-react';
import SmartVitrine from '../components/SmartVitrine';
import AccountNavigation from '../components/AccountNavigation';
import { getActiveAds, type Ad } from '../lib/ads';

async function ActiveAds() {
  await io();

  let ads: Ad[] = [];
  let errorMessage = '';

  try {
    ads = await getActiveAds();
  } catch {
    errorMessage = 'Não foi possível carregar os anúncios. Tente novamente em instantes.';
  }

  return <SmartVitrine ads={ads} errorMessage={errorMessage} />;
}

function AdsLoading() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10" aria-live="polite">
      <div className="mb-5 h-8 w-56 animate-pulse rounded bg-salvia" />
      <div className="mb-5 h-12 w-full animate-pulse rounded-md bg-white" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-44 animate-pulse rounded-lg border border-salvia bg-white" />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-areia text-petroleo-tinta">
      <header className="border-b border-salvia bg-white">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
            <span className="grid size-9 place-items-center rounded-md bg-petroleo-tinta text-white">
              <Store aria-hidden="true" size={19} />
            </span>
            ISAC Conecta
          </Link>
          <nav aria-label="Navegação principal" className="flex items-center gap-2">
            <AccountNavigation />
          </nav>
        </div>
      </header>

      <Suspense fallback={<AdsLoading />}>
        <ActiveAds />
      </Suspense>
    </main>
  );
}