'use client';

import { useState } from 'react';
import Link from 'next/link';

interface PendingAd {
  id: string;
  title: string;
  category: string;
  author: string;
  phone: string;
  description: string;
  date: string;
}

export default function ModerationPage() {
  const [pendingAds, setPendingAds] = useState<PendingAd[]>([
    {
      id: '1',
      title: 'Aulas particulares de matemática',
      category: 'Serviços',
      author: 'João Silva',
      phone: '(81) 98888-0000',
      description: 'Aulas de reforço para ensino fundamental e médio. Atendimento a domicílio no bairro.',
      date: '21/10/2026',
    },
    {
      id: '2',
      title: 'Marmita caseira tradicional',
      category: 'Alimentação',
      author: 'Maria do Carmo',
      phone: '(81) 97777-1111',
      description: 'Marmitas feitas na hora com tempero caseiro. Entrega grátis na região.',
      date: '21/10/2026',
    },
  ]);

  const handleApprove = (id: string) => {
    setPendingAds((prev) => prev.filter((ad) => ad.id !== id));
  };

  const handleReject = (id: string) => {
    setPendingAds((prev) => prev.filter((ad) => ad.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Cabeçalho */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <span className="mr-2">&larr;</span> Vitrine
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
              PAINEL DA EQUIPE
            </span>
            <h1 className="text-3xl font-extrabold text-gray-900 mt-1">
              Fila de moderação
            </h1>
          </div>
          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-full">
            {pendingAds.length} pendentes
          </span>
        </div>

        {/* Fila de Anúncios Pendentes */}
        <div className="space-y-4">
          {pendingAds.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-500 shadow-sm">
              <p className="text-base font-semibold text-gray-700">Tudo limpo por aqui!</p>
              <p className="text-sm mt-1">Nenhum anúncio pendente na fila de moderação.</p>
            </div>
          ) : (
            pendingAds.map((ad) => (
              <div
                key={ad.id}
                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{ad.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Enviado por <span className="font-medium text-gray-700">{ad.author}</span> ({ad.phone}) &bull; {ad.date}
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-gray-100 text-gray-700">
                    {ad.category}
                  </span>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed">
                  {ad.description}
                </p>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => handleReject(ad.id)}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Recusar
                  </button>
                  <button
                    onClick={() => handleApprove(ad.id)}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-colors"
                  >
                    Aprovar anúncio
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