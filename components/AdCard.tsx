import Link from 'next/link';
import { BadgeCheck, Flag, MapPin, MessageCircle } from 'lucide-react';

interface AdCardProps {
  title: string;
  description?: string | null;
  price: number | null;
  category: string;
  location: string;
  contactPhone: string;
  isVerified: boolean;
  reportHref?: string;
}

export default function AdCard({
  title,
  description,
  price,
  category,
  location,
  contactPhone,
  isVerified,
  reportHref,
}: AdCardProps) {
  const phoneNumber = contactPhone.replace(/\D/g, '');
  const formattedPrice =
    price === null
      ? 'A combinar'
      : new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(price);

  return (
    <article className="flex h-full flex-col rounded-lg border border-salvia bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="rounded-md bg-creme px-2.5 py-1 text-xs font-semibold text-petroleo-tinta">
          {category}
        </span>
        {isVerified && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-oliva-profundo">
            <BadgeCheck aria-hidden="true" size={16} />
            Verificado
          </span>
        )}
      </div>

      <h3 className="text-base font-bold leading-snug text-petroleo-tinta">{title}</h3>
      {description && <p className="mt-1 line-clamp-2 text-sm leading-5 text-petroleo-tinta/75">{description}</p>}
      <p className="mt-2 text-lg font-bold text-petroleo-escuro">{formattedPrice}</p>

      <div className="mt-3 flex items-center gap-2 text-sm text-petroleo-tinta/75">
        <MapPin aria-hidden="true" size={16} className="shrink-0" />
        <span>{location}</span>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
        {phoneNumber && (
          <a
            href={`https://wa.me/${phoneNumber}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-md border border-petroleo px-3 text-sm font-semibold text-petroleo-tinta transition-colors hover:bg-areia focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo"
            aria-label={`Entrar em contato sobre ${title} pelo WhatsApp`}
          >
            <MessageCircle aria-hidden="true" size={16} />
            Contato
          </a>
        )}
        {reportHref && (
          <Link
            href={reportHref}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold text-petroleo-tinta/75 transition-colors hover:bg-areia hover:text-petroleo-tinta focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo"
            aria-label={`Denunciar o anúncio: ${title}`}
          >
            <Flag aria-hidden="true" size={15} />
            Denunciar
          </Link>
        )}
      </div>
    </article>
  );
}