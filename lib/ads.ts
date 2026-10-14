export interface Ad {
  id: string;
  title: string;
  description?: string | null;
  price: number | null;
  contact_phone?: string | null;
  location?: string | null;
  is_verified?: boolean;
  category?: string | null;
  category_id?: string | null;
  categories?: { name: string } | { name: string }[] | null;
}

export type ModerationAction = 'approve' | 'reject';

const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(
  /\/$/,
  '',
);

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiUrl}${path}`, {
      ...init,
      headers: {
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new Error('Não foi possível conectar à API. Verifique se o serviço está em execução.');
  }

  if (!response.ok) {
    let message = 'Não foi possível concluir a solicitação.';
    try {
      const body = (await response.json()) as { message?: string | string[] };
      message = Array.isArray(body.message)
        ? body.message.join(' ')
        : body.message || message;
    } catch {
      message = 'Não foi possível concluir a solicitação.';
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export function getActiveAds() {
  return apiRequest<Ad[]>('/ads', { cache: 'no-store' });
}

export function getPendingAds() {
  return apiRequest<Ad[]>('/ads/moderation/pending', { cache: 'no-store' });
}

export function submitRawMessage(content: string) {
  return apiRequest<unknown>('/ads/ai-ingestion', {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export function moderateAd(id: string, action: ModerationAction) {
  return apiRequest<Ad>(`/ads/moderation/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ action, isVerified: action === 'approve' }),
  });
}

export function getCategoryName(ad: Ad) {
  if (ad.category) return ad.category;
  if (Array.isArray(ad.categories)) return ad.categories[0]?.name || 'Geral';
  return ad.categories?.name || ad.category_id || 'Geral';
}