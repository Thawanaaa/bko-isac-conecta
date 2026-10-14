'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, CheckCircle2, LoaderCircle, Send } from 'lucide-react';
import { submitRawMessage } from '../../lib/ads';

export default function PublishPage() {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = message.trim();
    if (!content) {
      setError('Cole uma mensagem antes de enviar.');
      return;
    }

    setIsSubmitting(true);
    setSuccess(false);
    setError('');
    try {
      await submitRawMessage(content);
      setSuccess(true);
      setMessage('');
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Não foi possível processar a mensagem. Tente novamente.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 text-slate-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-3xl items-center px-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-md pr-3 text-sm font-semibold text-slate-700 hover:text-emerald-800"
          >
            <ArrowLeft aria-hidden="true" size={18} />
            Voltar à vitrine
          </Link>
          <span className="ml-auto text-sm font-extrabold text-emerald-950">ISAC Conecta</span>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">
          Compartilhe com o bairro
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Publicar anúncio
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600">
          Cole sua mensagem como você enviaria no WhatsApp. Ela será encaminhada para processamento.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-lg border border-stone-200 bg-white p-5 shadow-sm sm:p-7"
        >
          <label htmlFor="raw-message" className="block text-sm font-bold text-slate-900">
            Texto do anúncio
          </label>
          <textarea
            id="raw-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={7}
            maxLength={5000}
            placeholder="Ex.: Vendo bolo de rolo caseiro, R$ 25, entrego no Centro. Chamar no (81) 99999-9999."
            className="mt-2 min-h-44 w-full resize-y rounded-md border border-stone-300 bg-white p-3 text-base leading-6 text-slate-900 placeholder:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
            aria-describedby="message-count"
            required
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <p id="message-count" className="text-xs text-slate-500">
              {message.length}/5000 caracteres
            </p>
            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-emerald-800 px-5 text-sm font-bold text-white transition-colors hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
            >
              {isSubmitting ? (
                <LoaderCircle aria-hidden="true" className="animate-spin" size={17} />
              ) : (
                <Send aria-hidden="true" size={16} />
              )}
              {isSubmitting ? 'Enviando...' : 'Processar com IA'}
            </button>
          </div>

          {success && (
            <p
              role="status"
              className="mt-5 flex items-center gap-2 rounded-md bg-emerald-50 p-3 text-sm font-semibold text-emerald-900"
            >
              <CheckCircle2 aria-hidden="true" size={18} />
              Mensagem enviada com sucesso.
            </p>
          )}
          {error && (
            <p role="alert" className="mt-5 rounded-md bg-red-50 p-3 text-sm font-medium text-red-900">
              {error}
            </p>
          )}
        </form>
      </section>
    </main>
  );
}