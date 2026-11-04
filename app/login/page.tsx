'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signUp } from '../../lib/ads';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    if (mode === 'signup' && name.trim().length < 2) {
      setError('Informe seu nome completo.');
      return;
    }
    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = mode === 'signup'
        ? await signUp(name.trim(), email.trim(), password)
        : await signIn(email.trim(), password);
      if (mode === 'signup' && result.requiresEmailConfirmation) {
        setMessage('Conta criada. Confirme seu e-mail antes de entrar.');
      } else {
        router.replace('/');
        router.refresh();
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Não foi possível autenticar.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-areia px-4 py-10 text-petroleo-tinta">
      <section className="mx-auto max-w-md rounded-lg border border-salvia bg-white p-6 shadow-sm sm:p-8">
        <Link href="/" className="text-sm font-semibold text-petroleo underline">Voltar à vitrine</Link>
        <h1 className="mt-5 text-2xl font-extrabold">{mode === 'login' ? 'Entrar' : 'Criar conta'}</h1>
        <p className="mt-2 text-sm text-petroleo-tinta/75">
          A autenticação protege seu perfil e seus anúncios.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === 'signup' && (
            <div>
              <label htmlFor="name" className="block text-sm font-semibold">Nome completo</label>
              <input id="name" value={name} onChange={(event) => setName(event.target.value)} maxLength={120} required
                className="mt-1 min-h-11 w-full rounded-md border border-salvia p-3" />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold">E-mail</label>
            <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required
              className="mt-1 min-h-11 w-full rounded-md border border-salvia p-3" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold">Senha</label>
            <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required
              className="mt-1 min-h-11 w-full rounded-md border border-salvia p-3" />
          </div>
          <button type="submit" disabled={isSubmitting}
            className="min-h-11 w-full rounded-md bg-petroleo px-4 font-bold text-white disabled:opacity-60">
            {isSubmitting ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        {message && <p role="status" className="mt-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-900">{message}</p>}
        {error && <p role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-900">{error}</p>}
        <p className="mt-5 text-center text-sm">
          {mode === 'login' ? 'Ainda não tem conta?' : 'Já tem uma conta?'}{' '}
          <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage(''); }}
            className="font-semibold text-petroleo underline">
            {mode === 'login' ? 'Criar conta' : 'Entrar'}
          </button>
        </p>
      </section>
    </main>
  );
}
