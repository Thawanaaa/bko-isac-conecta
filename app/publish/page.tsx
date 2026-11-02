'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  Send,
} from 'lucide-react';
import { submitRawMessage } from '../../lib/ads';

interface ExtractedAd {
  name: string;
  category: string;
  price: string;
  description: string;
  contact: string;
}

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isExtractedAd(value: unknown): value is ExtractedAd {
  return (
    isRecord(value) &&
    ['name', 'category', 'price', 'description', 'contact'].every(
      (field) => field in value && typeof value[field] === 'string',
    )
  );
}

export default function PublishPage() {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  function handleImageChange(file: File | undefined) {
    setError('');
    setSuccess(false);
    if (!file) {
      setImage(null);
      return;
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImage(null);
      setError('Envie uma imagem JPG, PNG ou WEBP.');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setImage(null);
      setError('A imagem deve ter no máximo 10 MB.');
      return;
    }
    setImage(file);
  }

  async function handleImageExtraction() {
    if (!image) return;

    setIsExtracting(true);
    setSuccess(false);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', image);
      const response = await fetch('/api/ads/process-image', {
        method: 'POST',
        body: formData,
      });
      let result: unknown;
      try {
        result = await response.json();
      } catch {
        throw new Error('Não foi possível ler a resposta da extração. Tente novamente.');
      }
      if (!response.ok) {
        const requestError =
          typeof result === 'object' &&
          result !== null &&
          'message' in result &&
          typeof result.message === 'string'
            ? result.message
            : 'Não foi possível extrair os dados da imagem.';
        throw new Error(requestError);
      }

      if (!isExtractedAd(result)) {
        throw new Error('O serviço de extração retornou dados inválidos.');
      }

      const ad = result;
      setMessage(
        [
          `Nome: ${ad.name}`,
          `Categoria: ${ad.category}`,
          `Preço: ${ad.price || 'Não informado'}`,
          `Descrição: ${ad.description}`,
          ...(ad.contact ? [`Contato: ${ad.contact}`] : []),
        ].join('\n'),
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Não foi possível extrair os dados da imagem. Tente novamente.',
      );
    } finally {
      setIsExtracting(false);
    }
  }

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
          Envie uma foto para extrair os dados do anúncio ou cole uma mensagem como você enviaria
          no WhatsApp.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-lg border border-stone-200 bg-white p-5 shadow-sm sm:p-7"
        >
          <label htmlFor="ad-image" className="block text-sm font-bold text-slate-900">
            Foto do anúncio
          </label>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <label
              htmlFor="ad-image"
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-stone-300 px-4 text-sm font-semibold text-slate-700 hover:bg-stone-50 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-emerald-800"
            >
              <ImagePlus aria-hidden="true" size={17} />
              Escolher imagem
            </label>
            <input
              id="ad-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => {
                handleImageChange(event.target.files?.[0]);
                event.currentTarget.value = '';
              }}
            />
            {image && (
              <span className="max-w-full truncate text-sm text-slate-600">{image.name}</span>
            )}
            <button
              type="button"
              onClick={handleImageExtraction}
              disabled={!image || isExtracting || isSubmitting}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-emerald-800 px-4 text-sm font-bold text-white transition-colors hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
            >
              {isExtracting ? (
                <LoaderCircle aria-hidden="true" className="animate-spin" size={17} />
              ) : (
                <ImagePlus aria-hidden="true" size={16} />
              )}
              {isExtracting ? 'Extraindo...' : 'Extrair dados da imagem'}
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500">JPG, PNG ou WEBP, até 10 MB.</p>

          <label htmlFor="raw-message" className="mt-6 block text-sm font-bold text-slate-900">
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
              disabled={isSubmitting || isExtracting || !message.trim()}
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