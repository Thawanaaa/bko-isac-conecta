import { BadgeCheck, MapPin, MessageCircle } from 'lucide-react';

interface AdCardProps {
  title: string;
  price: number | null;
  category: string;
  location: string;
  contactPhone: string;
  isVerified: boolean;
}

export default function AdCard({
  title,
  price,
  category,
  location,
  contactPhone,
  isVerified,
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
    <article className="flex h-full flex-col rounded-lg border border-stone-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
          {category}
        </span>
        {isVerified && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-800">
            <BadgeCheck aria-hidden="true" size={16} />
            Verificado
          </span>
        )}
      </div>

      <h2 className="text-lg font-bold leading-snug text-slate-900">{title}</h2>
      <p className="mt-2 text-xl font-bold text-emerald-700">{formattedPrice}</p>

      <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
        <MapPin aria-hidden="true" size={16} className="shrink-0" />
        <span>{location}</span>
      </div>

      {phoneNumber && (
        <a
          href={`https://wa.me/${phoneNumber}`}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-emerald-700 px-4 py-2 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          aria-label={`Entrar em contato sobre ${title} pelo WhatsApp`}
        >
          <MessageCircle aria-hidden="true" size={17} />
          Chamar no WhatsApp
        </a>
      )}
    </article>
  );
}