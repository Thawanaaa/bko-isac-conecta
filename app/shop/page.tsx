'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import AuthRequired from '../../components/AuthRequired';
import { getCategories, getShop, updateShop, type Category, type Shop } from '../../lib/ads';

function ShopForm() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [shopName, setShopName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([getShop(), getCategories()])
      .then(([currentShop, availableCategories]) => {
        if (!active) return;
        setShop(currentShop);
        setCategories(availableCategories);
        setShopName(currentShop?.name ?? '');
        setCategoryId(currentShop?.category_id ?? '');
        setDescription(currentShop?.description ?? '');
        setPhone(currentShop?.phone ?? '');
        setAddress(currentShop?.address ?? '');
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Não foi possível carregar os dados do comércio.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      const savedShop = await updateShop({
        name: shopName,
        category_id: categoryId || null,
        description: description || null,
        phone: phone || null,
        address: address || null,
      });
      setShop(savedShop);
      setSuccess('Dados do comércio atualizados com sucesso.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Não foi possível salvar os dados do comércio.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">SEU NEGÓCIO</span>
      <h1 className="mt-1 mb-2 text-3xl font-extrabold text-gray-900">Dados do comércio</h1>
      <p className="mb-8 text-gray-600">Gerencie as informações do seu comércio aqui.</p>

      {error && <p role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
      {success && <p role="status" className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{success}</p>}
      {isLoading ? (
        <p className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600">Carregando dados do comércio...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <label htmlFor="shop-name" className="mb-2 block text-sm font-semibold text-gray-800">Nome do comércio / estabelecimento</label>
            <input id="shop-name" type="text" value={shopName} onChange={(event) => setShopName(event.target.value)} maxLength={120} required
              className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="shop-category" className="mb-2 block text-sm font-semibold text-gray-800">Categoria principal</label>
            <select id="shop-category" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-emerald-600 focus:outline-none">
              <option value="">Selecione uma categoria</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="shop-description" className="mb-2 block text-sm font-semibold text-gray-800">Descrição do negócio</label>
            <textarea id="shop-description" rows={4} value={description} onChange={(event) => setDescription(event.target.value)} maxLength={2000}
              className="w-full resize-none rounded-lg border border-gray-300 p-3 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="shop-phone" className="mb-2 block text-sm font-semibold text-gray-800">WhatsApp para atendimento</label>
            <input id="shop-phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} maxLength={30}
              className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="shop-address" className="mb-2 block text-sm font-semibold text-gray-800">Endereço / Localização no bairro</label>
            <input id="shop-address" type="text" value={address} onChange={(event) => setAddress(event.target.value)} maxLength={200}
              className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-emerald-600 focus:outline-none" />
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={isSaving} className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-50">
              {isSaving ? 'Salvando...' : shop ? 'Salvar dados do comércio' : 'Cadastrar comércio'}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-600 transition-colors hover:text-gray-900">
          <span className="mr-2">&larr;</span> Voltar
        </Link>
        <div className="text-lg font-bold text-gray-900">ISAC Conecta</div>
      </header>
      <AuthRequired><ShopForm /></AuthRequired>
    </div>
  );
}
