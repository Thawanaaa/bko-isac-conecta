'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { LoaderCircle, Store } from 'lucide-react';
import { scheduleSessionRefresh, signIn, signUp } from '../lib/auth';

type AuthFormProps = {
  mode: 'login' | 'signup';
};

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const isSignup = mode === 'signup';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setStatusMessage('');

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    try {
      if (isSignup) {
        const name = String(formData.get('name') ?? '').trim();
        const session = await signUp(name, email, password);
        if (session.requiresEmailConfirmation || !session.authenticated) {
          setStatusMessage('Conta criada. Verifique seu e-mail para confirmar o cadastro.');
          return;
        }
        scheduleSessionRefresh(session.expiresAt);
      } else {
        const session = await signIn(email, password);
        scheduleSessionRefresh(session.expiresAt);
      }

      router.replace('/');
      router.refresh();
    } catch (requestError) {
      setErrorMessage(
        requestError instanceof Error
          ? requestError.message
          : 'Não foi possível concluir a autenticação. Tente novamente.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAFAF2] px-4 py-10 text-slate-900 sm:px-6">
      <section className="w-full max-w-md">
        <Link
          href="/"
          className="mx-auto mb-7 flex w-fit min-h-11 items-center gap-2 rounded-md text-lg font-extrabold text-[#315D68] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4A7C8A]"
        >
          <span className="grid size-9 place-items-center rounded-md bg-[#4A7C8A] text-white">
            <Store aria-hidden="true" size={19} />
          </span>
          ISAC Conecta
        </Link>

        <div className="rounded-lg border border-[#E5E4D8] bg-white p-5 shadow-sm sm:p-8">
          <h1 className="text-2xl font-extrabold text-slate-900">
            {isSignup ? 'Crie sua conta' : 'Entre na sua conta'}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {isSignup
              ? 'Conecte-se à comunidade ISAC Conecta.'
              : 'Acesse sua conta para continuar.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            {isSignup && (
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-slate-800">
                  Nome
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  maxLength={100}
                  className="mt-2 min-h-12 w-full rounded-lg border border-stone-300 bg-white px-3 text-base outline-none focus:border-[#4A7C8A] focus:ring-2 focus:ring-[#4A7C8A]/25"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-800">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-2 min-h-12 w-full rounded-lg border border-stone-300 bg-white px-3 text-base outline-none focus:border-[#4A7C8A] focus:ring-2 focus:ring-[#4A7C8A]/25"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-800">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                minLength={6}
                required
                className="mt-2 min-h-12 w-full rounded-lg border border-stone-300 bg-white px-3 text-base outline-none focus:border-[#4A7C8A] focus:ring-2 focus:ring-[#4A7C8A]/25"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#4A7C8A] px-4 text-base font-bold text-white transition-colors hover:bg-[#315D68] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315D68]"
            >
              {isSubmitting && <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />}
              {isSubmitting ? 'Aguarde...' : isSignup ? 'Criar conta' : 'Login'}
            </button>
          </form>

          {errorMessage && (
            <p role="alert" className="mt-5 rounded-md bg-red-50 p-3 text-sm text-red-800">
              {errorMessage}
            </p>
          )}
          {statusMessage && (
            <p role="status" className="mt-5 rounded-md bg-emerald-50 p-3 text-sm text-emerald-900">
              {statusMessage}
            </p>
          )}

          <p className="mt-6 border-t border-stone-200 pt-5 text-center text-sm text-slate-600">
            {isSignup ? 'Já tem uma conta?' : 'Não tem uma conta?'}{' '}
            <Link
              href={isSignup ? '/login' : '/signup'}
              className="font-bold text-[#315D68] underline decoration-[#4A7C8A]/50 underline-offset-4 hover:text-[#4A7C8A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A7C8A]"
            >
              {isSignup ? 'Login' : 'Cadastre-se'}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}