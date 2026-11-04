'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import AuthRequired from '../../components/AuthRequired';
import { getUserProfile, updateUserProfile } from '../../lib/ads';

function ProfileForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;
    getUserProfile()
      .then((profile) => {
        if (!active) return;
        setName(profile.name);
        setPhone(profile.phone ?? '');
        setBio(profile.bio ?? '');
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Não foi possível carregar seu perfil.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      const profile = await updateUserProfile({ name, phone: phone || null, bio: bio || null });
      setName(profile.name);
      setPhone(profile.phone ?? '');
      setBio(profile.bio ?? '');
      setSuccess('Alterações salvas com sucesso.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Não foi possível salvar seu perfil.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">SUA CONTA</span>
      <h1 className="mt-1 mb-2 text-3xl font-extrabold text-gray-900">Seu perfil</h1>
      <p className="mb-8 text-gray-600">Atualize suas informações pessoais aqui.</p>

      {error && <p role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
      {success && <p role="status" className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{success}</p>}
      {isLoading ? (
        <p className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600">Carregando perfil...</p>
      ) : (
        <form onSubmit={handleSave} className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <label htmlFor="profile-name" className="mb-2 block text-sm font-semibold text-gray-800">Nome completo</label>
            <input id="profile-name" type="text" value={name} onChange={(event) => setName(event.target.value)} maxLength={120} required
              className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="profile-phone" className="mb-2 block text-sm font-semibold text-gray-800">Telefone / WhatsApp</label>
            <input id="profile-phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} maxLength={30}
              className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="profile-bio" className="mb-2 block text-sm font-semibold text-gray-800">Sobre você</label>
            <textarea id="profile-bio" value={bio} onChange={(event) => setBio(event.target.value)} maxLength={500} rows={4}
              className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-emerald-600 focus:outline-none" />
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={isSaving} className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-50">
              {isSaving ? 'Salvando...' : 'Guardar alterações'}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-600 transition-colors hover:text-gray-900">
          <span className="mr-2">&larr;</span> Voltar
        </Link>
        <div className="text-lg font-bold text-gray-900">ISAC Conecta</div>
      </header>
      <AuthRequired><ProfileForm /></AuthRequired>
    </div>
  );
}
