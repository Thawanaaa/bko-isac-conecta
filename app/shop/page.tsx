'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ShopPage() {
  const [shopName, setShopName] = useState('Padaria da Vila');
  const [category, setCategory] = useState('Alimentação');
  const [description, setDescription] = useState('Pães frescos, bolos e produtos regionais para o seu dia a dia.');
  const [whatsapp, setWhatsapp] = useState('(81) 98888-7777');
  const [address, setAddress] = useState('Rua Principal, 123 - Centro');
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

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

      {/* Conteúdo */}
      <main className="max-w-2xl mx-auto px-4 py-10">
        <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
          SEU NEGÓCIO
        </span>
        <h1 className="text-3xl font-extrabold text-gray-900 mt-1 mb-2">
          Dados do comércio
        </h1>
        <p className="text-gray-600 mb-8">
          Gerencie as informações do seu comércio aqui.
        </p>

        {isSaved && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm">
            Dados do comércio atualizados com sucesso!
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Nome do comércio / estabelecimento
            </label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Categoria principal
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
            >
              <option value="Alimentação">Alimentação</option>
              <option value="Serviços">Serviços</option>
              <option value="Vestuário">Vestuário</option>
              <option value="Artesanato">Artesanato</option>
              <option value="Outros">Outros</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Descrição do negócio
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              WhatsApp para atendimento
            </label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Endereço / Localização no bairro
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-colors"
            >
              Salvar dados do comércio
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}