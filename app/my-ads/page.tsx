'use client';

import { useState } from 'react';
import Link from 'next/link';

interface MyAd {
  id: string;
  title: string;
  category: string;
  price: string;
  status: 'Aprovado' | 'Em moderação' | 'Recusado';
  date: string;
}

export default function MyAdsPage() {
  const [ads] = useState<MyAd[]>([
    {
      id: '1',
      title: 'Bolo de rolo caseiro',
      category: 'Alimentação',
      price: 'R$ 25,00',
      status: 'Aprovado',
      date: '21/10/2026',
    },
    {
      id: '2',
      title: 'Aulas particulares de matemática',
      category: 'Serviços',
      price: 'R$ 50,00',
      status: 'Em moderação',
      date: '20/10/2026',
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Cabeçalho */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <span className="mr-2">&larr;</span> Voltar
        </Link>
        <div className="font-bold text-lg text-gray-900">
          ISAC Conecta
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
              SUA CONTA
            </span>
            <h1 className="text-3xl font-extrabold text-gray-900 mt-1">
              Meus anúncios
            </h1>
          </div>
          <Link
            href="/publish"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-colors shadow-sm"
          >
            + Novo anúncio
          </Link>
        </div>

        {/* Lista de Anúncios */}
        <div className="space-y-4">
          {ads.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
              Você ainda não publicou nenhum anúncio.
            </div>
          ) : (
            ads.map((ad) => (
              <div
                key={ad.id}
                className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between shadow-sm hover:border-gray-300 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-gray-900 text-base">{ad.title}</h3>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        ad.status === 'Aprovado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ad.status === 'Em moderação'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {ad.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {ad.category} &bull; {ad.price} &bull; Criado em {ad.date}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button className="text-xs font-semibold text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors">
                    Editar
                  </button>
                  <button className="text-xs font-semibold text-red-600 hover:text-red-700 px-3 py-1.5 rounded-md border border-red-100 hover:bg-red-50 transition-colors">
                    Excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}