'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const [name, setName] = useState('Suedson Fernando');
  const [phone, setPhone] = useState('(81) 99999-9999');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Topbar Navigation */}
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

      {/* Main Container */}
      <main className="max-w-2xl mx-auto px-4 py-10">
        <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
          SUA CONTA
        </span>
        <h1 className="text-3xl font-extrabold text-gray-900 mt-1 mb-2">
          Seu perfil
        </h1>
        <p className="text-gray-600 mb-8">
          Atualize suas informações pessoais aqui.
        </p>

        {isSaved && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm">
            Alterações guardadas com sucesso!
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Nome completo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Telefone / WhatsApp
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-colors"
            >
              Guardar alterações
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}