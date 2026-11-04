'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import AuthRequired from '../../../components/AuthRequired';
import { getAdminUsers, updateAdminUser, type UserProfile } from '../../../lib/ads';

type ManagedRole = 'member' | 'moderator' | 'admin';

function isManagedRole(role: string): role is ManagedRole {
  return ['member', 'moderator', 'admin'].includes(role);
}

function UserManager() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;
    getAdminUsers()
      .then((profiles) => {
        if (active) setUsers(profiles);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Não foi possível carregar os usuários.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleSave(event: FormEvent<HTMLFormElement>, user: UserProfile) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const role = String(formData.get('role') ?? '');
    if (!isManagedRole(role)) {
      setError('Selecione um papel válido para o usuário.');
      return;
    }

    setSavingUserId(user.id);
    setError('');
    setSuccess('');
    try {
      const updatedUser = await updateAdminUser(user.id, {
        name: String(formData.get('name') ?? ''),
        phone: String(formData.get('phone') ?? '') || null,
        bio: String(formData.get('bio') ?? '') || null,
        role,
      });
      setUsers((currentUsers) => currentUsers.map((currentUser) =>
        currentUser.id === updatedUser.id ? updatedUser : currentUser,
      ));
      setEditingUserId(null);
      setSuccess(`Perfil de ${updatedUser.name} atualizado.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Não foi possível atualizar o perfil.');
    } finally {
      setSavingUserId(null);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">ADMINISTRAÇÃO</span>
        <h1 className="mt-1 text-3xl font-extrabold text-gray-900">Gerenciar usuários</h1>
        <p className="mt-2 text-sm text-gray-600">Edite perfis e controle o acesso de cada conta.</p>
      </div>

      {error && <p role="alert" className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-900">{error}</p>}
      {success && <p role="status" className="mb-4 rounded-md bg-emerald-50 p-4 text-sm text-emerald-900">{success}</p>}
      {isLoading ? (
        <p className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600">Carregando usuários...</p>
      ) : users.length === 0 ? (
        <p className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600">Nenhum perfil cadastrado.</p>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <article key={user.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold text-gray-900">{user.name || 'Sem nome'}</h2>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Papel: {user.role} &bull; Criado em {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={savingUserId !== null}
                  onClick={() => {
                    setEditingUserId(editingUserId === user.id ? null : user.id);
                    setError('');
                    setSuccess('');
                  }}
                  className="min-h-10 rounded-md border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {editingUserId === user.id ? 'Cancelar' : 'Editar perfil'}
                </button>
              </div>

              {editingUserId === user.id && (
                <form onSubmit={(event) => handleSave(event, user)} className="mt-5 grid gap-4 border-t border-gray-100 pt-5 sm:grid-cols-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Nome
                    <input name="name" defaultValue={user.name} maxLength={120} required className="mt-1 w-full rounded-md border border-gray-300 p-2.5 font-normal" />
                  </label>
                  <label className="text-sm font-semibold text-gray-700">
                    E-mail
                    <input value={user.email} readOnly className="mt-1 w-full rounded-md border border-gray-200 bg-gray-50 p-2.5 font-normal text-gray-500" />
                  </label>
                  <label className="text-sm font-semibold text-gray-700">
                    Telefone
                    <input name="phone" type="tel" defaultValue={user.phone ?? ''} maxLength={30} className="mt-1 w-full rounded-md border border-gray-300 p-2.5 font-normal" />
                  </label>
                  <label className="text-sm font-semibold text-gray-700">
                    Papel
                    <select name="role" defaultValue={isManagedRole(user.role) ? user.role : 'member'} className="mt-1 w-full rounded-md border border-gray-300 p-2.5 font-normal">
                      <option value="member">Membro</option>
                      <option value="moderator">Moderador</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </label>
                  <label className="text-sm font-semibold text-gray-700 sm:col-span-2">
                    Biografia
                    <textarea name="bio" defaultValue={user.bio ?? ''} maxLength={500} rows={3} className="mt-1 w-full rounded-md border border-gray-300 p-2.5 font-normal" />
                  </label>
                  <div className="sm:col-span-2">
                    <button type="submit" disabled={savingUserId !== null} className="min-h-10 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
                      {savingUserId === user.id ? 'Salvando...' : 'Salvar alterações'}
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

export default function AdminUsersPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-600 transition-colors hover:text-gray-900">
          <span className="mr-2">&larr;</span> Vitrine
        </Link>
        <div className="text-lg font-bold text-gray-900">ISAC Conecta</div>
      </header>
      <AuthRequired requiredRole="admin"><UserManager /></AuthRequired>
    </div>
  );
}
