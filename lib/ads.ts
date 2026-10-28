export interface Advertisement {
  id: string;
  title: string;
  description: string;
  price?: number;
  category: string;
  contact: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

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

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  created_at?: string;
}

export interface Shop {
  id: string;
  name: string;
  description?: string | null;
  cnpj?: string | null;
  address?: string | null;
  phone?: string | null;
  logo_url?: string | null;
  user_id?: string;
}

export type ModerationAction = 'approve' | 'reject';

export const MAX_RAW_MESSAGE_LENGTH = 5000;

const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(
  /\/$/,
  '',
);

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiUrl}${path}`, {
      ...init,
      credentials: 'include',
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
    const responseText = await response.text();
    if (responseText) {
      try {
        const body: unknown = JSON.parse(responseText);
        if (typeof body === 'object' && body !== null && 'message' in body) {
          const apiMessage = body.message;
          if (typeof apiMessage === 'string' && apiMessage.trim()) {
            message = apiMessage;
          } else if (
            Array.isArray(apiMessage) &&
            apiMessage.every((item): item is string => typeof item === 'string')
          ) {
            message = apiMessage.join(' ') || message;
          }
        } else {
          message = responseText;
        }
      } catch {
        message = responseText;
      }
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
  const normalizedContent = content.trim();
  if (!normalizedContent) {
    throw new Error('Cole uma mensagem antes de enviar.');
  }
  if (normalizedContent.length > MAX_RAW_MESSAGE_LENGTH) {
    throw new Error(`A mensagem deve ter no máximo ${MAX_RAW_MESSAGE_LENGTH} caracteres.`);
  }

  return apiRequest<Ad>('/ads/ai-ingestion', {
    method: 'POST',
    body: JSON.stringify({ content: normalizedContent }),
  });
}

export function moderateAd(id: string, action: ModerationAction) {
  return apiRequest<Ad>(`/ads/moderation/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ action, isVerified: action === 'approve' }),
  });
}

export function getUserAds() {
  return apiRequest<Ad[]>('/ads/my-ads', { cache: 'no-store' });
}

export function deleteAd(id: string) {
  return apiRequest<{ success: boolean }>(`/ads/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export function getUserProfile() {
  return apiRequest<UserProfile>('/users/profile', { cache: 'no-store' });
}

export function updateUserProfile(data: Partial<UserProfile>) {
  return apiRequest<UserProfile>('/users/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function getShop() {
  return apiRequest<Shop>('/shops/my-shop', { cache: 'no-store' });
}

export function updateShop(data: Partial<Shop>) {
  return apiRequest<Shop>('/shops/my-shop', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function getCategoryName(ad: Ad) {
  const categoryName = ad.category?.trim();
  if (categoryName) return categoryName;

  const relatedCategoryName = Array.isArray(ad.categories)
    ? ad.categories[0]?.name
    : ad.categories?.name;
  return relatedCategoryName?.trim() || 'Geral';
}

export async function processAdText(rawText: string): Promise<Partial<Advertisement>> {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return {
    title: rawText.slice(0, 30) || 'Anúncio sem título',
    description: rawText,
    category: 'Geral',
    contact: '(81) 99999-9999',
    status: 'pending',
  };
}