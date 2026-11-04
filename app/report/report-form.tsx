'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, Flag } from 'lucide-react';
import AuthRequired from '../../components/AuthRequired';
import { submitReport, type ReportInput } from '../../lib/ads';

const reportReasons: Array<{ id: ReportInput['reason']; label: string }> = [
  { id: 'spam', label: 'Spam ou anúncio duplicado' },
  { id: 'fraud', label: 'Golpe ou fraude' },
  { id: 'inappropriate', label: 'Conteúdo impróprio' },
  { id: 'expired', label: 'Vendido ou expirado' },
];

function ReportSubmission({ adId }: { adId: string }) {
  const [reason, setReason] = useState<ReportInput['reason'] | ''>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!adId) {
      setError('Não foi possível identificar o anúncio. Volte à vitrine e escolha um anúncio para denunciar.');
      return;
    }
    if (!reason) {
      setError('Selecione um motivo para a denúncia.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await submitReport({ ad_id: adId, reason, description });
      setSuccess(true);
      setDescription('');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Não foi possível enviar a denúncia.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-areia text-petroleo-tinta">
      <header className="border-b border-salvia bg-white">
        <div className="mx-auto flex min-h-16 max-w-2xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="inline-flex min-h-11 items-center gap-2 pr-3 text-sm font-semibold">
            <ArrowLeft aria-hidden="true" size={18} />Voltar à vitrine
          </Link>
          <span className="text-sm font-extrabold">ISAC Conecta</span>
        </div>
      </header>
      <section className="mx-auto max-w-2xl px-4 py-7 sm:px-6 sm:py-10">
        <p className="text-sm font-semibold text-petroleo">Ajude a comunidade</p>
        <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">Denunciar anúncio</h1>
        <p className="mt-2 text-sm leading-6 text-petroleo-tinta/75">Selecione o motivo. Sua denúncia será enviada para análise.</p>

        <form onSubmit={handleSubmit} className="mt-5 rounded-lg border border-salvia bg-white p-4 shadow-sm sm:p-6">
          <fieldset>
            <legend className="text-sm font-bold">Por que deseja denunciar?</legend>
            <div className="mt-3 space-y-2">
              {reportReasons.map((item) => (
                <label key={item.id} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-md border border-salvia px-3 py-2.5 text-sm font-medium hover:bg-areia">
                  <input type="radio" name="reason" value={item.id} checked={reason === item.id} onChange={() => setReason(item.id)} required className="size-4 accent-petroleo" />
                  {item.label}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="mt-5">
            <label htmlFor="report-description" className="block text-sm font-bold">Detalhes (opcional)</label>
            <textarea id="report-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={3} maxLength={140}
              className="mt-2 min-h-24 w-full resize-y rounded-md border border-salvia p-3" />
            <p className="mt-1 text-xs text-petroleo-tinta/65">{description.length}/140 caracteres</p>
          </div>
          {!adId && <p className="mt-4 text-sm text-red-700">Anúncio não identificado. Abra esta página pelo botão “Denunciar” de um anúncio.</p>}
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Link href="/" className="inline-flex min-h-11 items-center justify-center rounded-md border border-salvia px-4 text-sm font-semibold">Cancelar</Link>
            <button type="submit" disabled={!adId || isSubmitting || success} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-petroleo px-4 text-sm font-bold text-white disabled:opacity-55">
              <Flag aria-hidden="true" size={16} />{isSubmitting ? 'Enviando...' : 'Enviar denúncia'}
            </button>
          </div>
          {success && <p role="status" className="mt-4 rounded-md bg-emerald-50 p-3 text-sm font-semibold text-emerald-900">Denúncia registrada para análise.</p>}
          {error && <p role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-sm font-medium text-red-900">{error}</p>}
        </form>
      </section>
    </main>
  );
}

export default function ReportForm() {
  const searchParams = useSearchParams();
  const adId = searchParams.get('adId') ?? '';
  return <AuthRequired><ReportSubmission adId={adId} /></AuthRequired>;
}
