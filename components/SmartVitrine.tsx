'use client';

import { useMemo, useState } from 'react';
import { Search, Store } from 'lucide-react';
import AdCard from './AdCard';
import { getCategoryName, type Ad } from '../lib/ads';

const categoryFilters = [
  { id: 'all', label: 'Tudo' },
  { id: 'products', label: 'Produtos' },
  { id: 'services', label: 'Serviços' },
  { id: 'jobs', label: 'Vagas' },
  { id: 'rentals', label: 'Aluguéis' },
] as const;

type CategoryFilter = (typeof categoryFilters)[number]['id'];

const categoryTerms: Record<Exclude<CategoryFilter, 'all'>, string[]> = {
  products: ['produto', 'venda', 'mercadoria'],
  services: ['servico'],
  jobs: ['vaga', 'emprego', 'trabalho'],
  rentals: ['aluguel', 'locacao', 'imovel'],
};

interface SmartVitrineProps {
  ads: Ad[];
  errorMessage: string;
}

function normalizeSearchText(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
}

function matchesCategory(ad: Ad, filter: CategoryFilter) {
  if (filter === 'all') return true;

  const category = normalizeSearchText(getCategoryName(ad));
  return categoryTerms[filter].some((term) => category.includes(term));
}

export default function SmartVitrine({ ads, errorMessage }: SmartVitrineProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const normalizedQuery = normalizeSearchText(query.trim());

  const filteredAds = useMemo(
    () =>
      ads.filter((ad) => {
        const matchesSearch =
          !normalizedQuery ||
          [ad.title, ad.description, getCategoryName(ad), ad.location, ad.contact_phone]
            .filter(Boolean)
            .some((value) => normalizeSearchText(value ?? '').includes(normalizedQuery));

        return matchesSearch && matchesCategory(ad, category);
      }),
    [ads, category, normalizedQuery],
  );

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-9">
      <div className="mb-5">
        <p className="text-sm font-semibold text-petroleo">Vitrine da comunidade</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
          O que você procura por perto?
        </h1>
      </div>

      <label htmlFor="listing-search" className="sr-only">
        Buscar anúncios
      </label>
      <div className="flex min-h-12 items-center gap-3 rounded-md border border-salvia bg-white px-3 focus-within:border-petroleo focus-within:outline focus-within:outline-2 focus-within:outline-petroleo">
        <Search aria-hidden="true" className="shrink-0 text-petroleo" size={19} />
        <input
          id="listing-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar produto, serviço, bairro..."
          className="min-w-0 flex-1 bg-transparent py-2 text-base text-petroleo-tinta placeholder:text-petroleo-tinta/55 focus:outline-none"
        />
      </div>

      <div
        role="group"
        aria-label="Filtrar por categoria"
        className="mt-3 flex gap-2 overflow-x-auto pb-1"
      >
        {categoryFilters.map((filter) => {
          const isSelected = category === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setCategory(filter.id)}
              className={`min-h-10 shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo ${
                isSelected
                  ? 'border-petroleo bg-petroleo text-white'
                  : 'border-salvia bg-white text-petroleo-tinta hover:bg-creme'
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="mb-3 mt-5 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold">Anúncios do bairro</h2>
        {!errorMessage && (
          <p className="text-sm text-petroleo-tinta/70" aria-live="polite">
            {filteredAds.length} {filteredAds.length === 1 ? 'resultado' : 'resultados'}
          </p>
        )}
      </div>

      {errorMessage ? (
        <div role="alert" className="rounded-lg border border-coral bg-white p-4 text-petroleo-tinta">
          {errorMessage}
        </div>
      ) : filteredAds.length ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAds.map((ad) => (
            <AdCard
              key={ad.id}
              title={ad.title}
              description={ad.description}
              price={ad.price}
              category={getCategoryName(ad)}
              location={ad.location || 'Local não informado'}
              contactPhone={ad.contact_phone || ''}
              isVerified={Boolean(ad.is_verified)}
              reportHref={`/report?adId=${encodeURIComponent(ad.id)}`}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-salvia bg-white px-5 py-10 text-center">
          <Store aria-hidden="true" className="mx-auto text-petroleo" size={26} />
          <h3 className="mt-3 font-bold">
            {ads.length ? 'Nenhum anúncio encontrado' : 'Ainda não há anúncios ativos'}
          </h3>
          <p className="mt-1 text-sm text-petroleo-tinta/70">
            {ads.length
              ? 'Tente outra busca ou escolha uma categoria diferente.'
              : 'Volte em breve para ver as novidades da comunidade.'}
          </p>
        </div>
      )}
    </section>
  );
}
