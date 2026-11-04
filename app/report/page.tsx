import Link from 'next/link';
import { ArrowLeft, Flag } from 'lucide-react';

const reportReasons = [
  { id: 'spam', label: 'Spam ou anúncio duplicado' },
  { id: 'fraud', label: 'Golpe ou fraude' },
  { id: 'inappropriate', label: 'Conteúdo impróprio' },
  { id: 'expired', label: 'Vendido ou expirado' },
];

export default function ReportPage() {
  return (
    <main className="min-h-screen bg-areia text-petroleo-tinta">
      <header className="border-b border-salvia bg-white">
        <div className="mx-auto flex min-h-16 max-w-2xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-md pr-3 text-sm font-semibold text-petroleo-tinta transition-colors hover:text-petroleo focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo"
          >
            <ArrowLeft aria-hidden="true" size={18} />
            Voltar à vitrine
          </Link>
          <span className="text-sm font-extrabold text-petroleo-tinta">ISAC Conecta</span>
        </div>
      </header>

      <section className="mx-auto max-w-2xl px-4 py-7 sm:px-6 sm:py-10">
        <div className="mb-5">
          <p className="text-sm font-semibold text-petroleo">Ajude a comunidade</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Denunciar anúncio
          </h1>
          <p className="mt-2 text-sm leading-6 text-petroleo-tinta/75">
            Selecione o motivo. Sua denúncia ajuda a manter o bairro seguro.
          </p>
        </div>

        <form className="rounded-lg border border-salvia bg-white p-4 shadow-sm sm:p-6">
          <fieldset>
            <legend className="text-sm font-bold">Por que deseja denunciar?</legend>
            <div className="mt-3 space-y-2">
              {reportReasons.map((reason) => (
                <label
                  key={reason.id}
                  className="flex min-h-12 cursor-pointer items-center gap-3 rounded-md border border-salvia px-3 py-2.5 text-sm font-medium transition-colors hover:bg-areia has-[:checked]:border-petroleo has-[:checked]:bg-areia"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason.id}
                    required
                    className="size-4 shrink-0 accent-petroleo focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo"
                  />
                  {reason.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-5">
            <label htmlFor="report-description" className="block text-sm font-bold">
              Detalhes <span className="font-normal text-petroleo-tinta/65">(opcional)</span>
            </label>
            <textarea
              id="report-description"
              name="description"
              rows={3}
              maxLength={140}
              placeholder="Conte um pouco mais, se quiser."
              className="mt-2 min-h-24 w-full resize-y rounded-md border border-salvia bg-white p-3 text-base leading-6 text-petroleo-tinta placeholder:text-petroleo-tinta/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo"
              aria-describedby="description-limit"
            />
            <p id="description-limit" className="mt-1 text-xs text-petroleo-tinta/65">
              Até 140 caracteres
            </p>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-salvia px-4 text-sm font-semibold text-petroleo-tinta transition-colors hover:bg-areia focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo"
            >
              Cancelar
            </Link>
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-petroleo px-4 text-sm font-bold text-white transition-colors hover:bg-petroleo-escuro focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo"
            >
              <Flag aria-hidden="true" size={16} />
              Enviar denúncia
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
