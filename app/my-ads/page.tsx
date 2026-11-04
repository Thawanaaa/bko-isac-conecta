'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import AuthRequired from '../../components/AuthRequired';
import {
  deleteAd,
  getCategories,
  getCategoryName,
  getUserAds,
  updateAd,
  type Ad,
  type AdInput,
  type Category,
} from '../../lib/ads';

function statusLabel(status: Ad['status']) {
  if (status === 'active' || status === 'approved') return 'Aprovado';
  if (status === 'rejected') return 'Recusado';
  return 'Em moderação';
}

function MyAdsContent() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [busyAdId, setBusyAdId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([getUserAds(), getCategories()])
      .then(([userAds, availableCategories]) => {
        if (!active) return;
        setAds(userAds);
        setCategories(availableCategories);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Não foi possível carregar seus anúncios.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleDelete(id: string) {
    setBusyAdId(id);
    setError('');
    setSuccess('');
    try {
      await deleteAd(id);
      setAds((currentAds) => currentAds.filter((ad) => ad.id !== id));
      if (editingAd?.id === id) setEditingAd(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Não foi possível excluir o anúncio.');
    } finally {
      setBusyAdId(null);
    }
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingAd) return;
    const formData = new FormData(event.currentTarget);
    const priceValue = String(formData.get('price') ?? '').trim();
    const input: AdInput = {
      title: String(formData.get('title') ?? ''),
      description: String(formData.get('description') ?? ''),
      price: priceValue ? Number(priceValue) : null,
      category_id: String(formData.get('category_id') ?? ''),
      contact_phone: String(formData.get('contact_phone') ?? ''),
      location: String(formData.get('location') ?? ''),
    };

    setBusyAdId(editingAd.id);
    setError('');
    setSuccess('');
    try {
      const updatedAd = await updateAd(editingAd.id, input);
      setAds((currentAds) => currentAds.map((ad) => ad.id === updatedAd.id ? updatedAd : ad));
      setEditingAd(null);
      setSuccess('Anúncio atualizado com sucesso.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Não foi possível atualizar o anúncio.');
    } finally {
      setBusyAdId(null);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">SUA CONTA</span>
          <h1 className="mt-1 text-3xl font-extrabold text-gray-900">Meus anúncios</h1>
        </div>
        <Link href="/publish" className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700">
          + Novo anúncio
        </Link>
      </div>

      {error && <p role="alert" className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-900">{error}</p>}
      {success && <p role="status" className="mb-4 rounded-md bg-emerald-50 p-4 text-sm text-emerald-900">{success}</p>}
      {isLoading ? (
        <p className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600">Carregando seus anúncios...</p>
      ) : ads.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">Você ainda não publicou nenhum anúncio.</div>
      ) : (
        <div className="space-y-4">
          {ads.map((ad) => (
            <article key={ad.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-base font-bold text-gray-900">{ad.title}</h2>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      ad.status === 'active' || ad.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ad.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                    }`}>{statusLabel(ad.status)}</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {getCategoryName(ad)} &bull; {ad.price === null ? 'Preço a combinar' : ad.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    {' '}&bull; Criado em {new Date(ad.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button type="button" onClick={() => setEditingAd(editingAd?.id === ad.id ? null : ad)} disabled={busyAdId !== null}
                    className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50">
                    {editingAd?.id === ad.id ? 'Cancelar' : 'Editar'}
                  </button>
                  <button type="button" onClick={() => handleDelete(ad.id)} disabled={busyAdId !== null}
                    className="rounded-md border border-red-100 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50">
                    {busyAdId === ad.id ? 'Aguarde...' : 'Excluir'}
                  </button>
                </div>
              </div>

              {editingAd?.id === ad.id && (
                <form onSubmit={handleUpdate} className="mt-5 grid gap-4 border-t border-gray-100 pt-5 sm:grid-cols-2">
                  <label className="text-sm font-semibold text-gray-700">Título
                    <input name="title" defaultValue={ad.title} maxLength={120} required className="mt-1 w-full rounded-md border border-gray-300 p-2.5 font-normal" />
                  </label>
                  <label className="text-sm font-semibold text-gray-700">Categoria
                    <select name="category_id" defaultValue={ad.category_id} required className="mt-1 w-full rounded-md border border-gray-300 p-2.5 font-normal">
                      {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                    </select>
                  </label>
                  <label className="text-sm font-semibold text-gray-700">Preço
                    <input name="price" type="number" min="0" step="0.01" defaultValue={ad.price ?? ''} className="mt-1 w-full rounded-md border border-gray-300 p-2.5 font-normal" />
                  </label>
                  <label className="text-sm font-semibold text-gray-700">Telefone de contato
                    <input name="contact_phone" defaultValue={ad.contact_phone ?? ''} maxLength={30} className="mt-1 w-full rounded-md border border-gray-300 p-2.5 font-normal" />
                  </label>
                  <label className="text-sm font-semibold text-gray-700 sm:col-span-2">Localização
                    <input name="location" defaultValue={ad.location ?? ''} maxLength={160} className="mt-1 w-full rounded-md border border-gray-300 p-2.5 font-normal" />
                  </label>
                  <label className="text-sm font-semibold text-gray-700 sm:col-span-2">Descrição
                    <textarea name="description" defaultValue={ad.description ?? ''} maxLength={2000} rows={4} className="mt-1 w-full rounded-md border border-gray-300 p-2.5 font-normal" />
                  </label>
                  <div className="sm:col-span-2">
                    <button type="submit" disabled={busyAdId !== null} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                      {busyAdId === ad.id ? 'Salvando...' : 'Salvar alterações'}
                    </button>
                  </div>
                </form>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default function MyAdsPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-600 transition-colors hover:text-gray-900">
          <span className="mr-2">&larr;</span> Voltar
        </Link>
        <div className="text-lg font-bold text-gray-900">ISAC Conecta</div>
      </header>
      <AuthRequired><MyAdsContent /></AuthRequired>
    </div>
  );
}
