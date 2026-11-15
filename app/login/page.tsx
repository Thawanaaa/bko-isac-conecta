'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { signIn, signUp } from '../../lib/ads';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordConfirmationVisible, setIsPasswordConfirmationVisible] = useState(false);
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
    if (mode === 'signup' && (
      password.length < 8
      || !/\p{Lu}/u.test(password)
      || !/\p{N}/u.test(password)
      || !/[^\p{L}\p{N}]/u.test(password)
    )) {
      setError('A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, um número e um caractere especial.');
      return;
    }
    if (mode === 'signup' && password !== passwordConfirmation) {
      setError('As senhas não coincidem.');
      return;
    }
    if (mode === 'login' && password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = mode === 'signup'
        ? await signUp(name.trim(), email.trim(), password)
        : await signIn(email.trim(), password);
      if (mode === 'signup' && result.requiresEmailConfirmation) {
        if (result.confirmationEmailRequested) {
          setMessage('O serviço de autenticação aceitou a solicitação de envio da confirmação. Isso não garante a entrega na caixa de entrada; verifique também spam e lixo eletrônico.');
        } else {
          setError('Não foi possível confirmar uma nova solicitação de envio para este e-mail. Se você já tem uma conta, tente entrar; caso contrário, tente novamente mais tarde.');
        }
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
            <div className="mt-1 flex min-h-11 items-center rounded-md border border-salvia focus-within:outline focus-within:outline-2 focus-within:outline-petroleo">
              <input id="password" type={isPasswordVisible ? 'text' : 'password'} value={password}
                onChange={(event) => setPassword(event.target.value)} minLength={8}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required
                className="min-w-0 flex-1 rounded-md p-3 focus:outline-none" />
              <button type="button" onClick={() => setIsPasswordVisible((visible) => !visible)}
                aria-label={isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={isPasswordVisible}
                className="mr-1 grid size-9 shrink-0 place-items-center rounded text-petroleo hover:bg-areia focus-visible:outline focus-visible:outline-2 focus-visible:outline-petroleo">
                {isPasswordVisible ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
              </button>
            </div>
          </div>
          {mode === 'signup' && (
            <div>
              <label htmlFor="passwordConfirmation" className="block text-sm font-semibold">Confirmação de senha</label>
              <div className="mt-1 flex min-h-11 items-center rounded-md border border-salvia focus-within:outline focus-within:outline-2 focus-within:outline-petroleo">
                <input id="passwordConfirmation" type={isPasswordConfirmationVisible ? 'text' : 'password'}
                  value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)}
                  autoComplete="new-password" required className="min-w-0 flex-1 rounded-md p-3 focus:outline-none" />
                <button type="button" onClick={() => setIsPasswordConfirmationVisible((visible) => !visible)}
                  aria-label={isPasswordConfirmationVisible ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
                  aria-pressed={isPasswordConfirmationVisible}
                  className="mr-1 grid size-9 shrink-0 place-items-center rounded text-petroleo hover:bg-areia focus-visible:outline focus-visible:outline-2 focus-visible:outline-petroleo">
                  {isPasswordConfirmationVisible
                    ? <EyeOff aria-hidden="true" size={18} />
                    : <Eye aria-hidden="true" size={18} />}
                </button>
              </div>
            </div>
          )}
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
