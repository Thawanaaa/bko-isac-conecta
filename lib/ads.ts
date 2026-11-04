import { apiRequest } from './api';

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Ad {
  id: string;
  user_id?: string;
  title: string;
  description: string | null;
  price: number | null;
  contact_phone: string | null;
  location: string | null;
  is_verified?: boolean;
  is_highlighted?: boolean;
  category_id: string;
  categories?: { name: string } | { name: string }[] | null;
  profiles?: { name: string; phone: string | null } | { name: string; phone: string | null }[] | null;
  status: 'pending' | 'active' | 'approved' | 'rejected';
  created_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: 'member' | 'moderator' | 'admin' | 'user';
  created_at: string;
}

export interface CurrentUser {
  id: string;
  email?: string;
  role: string;
}

export function hasModerationPower(user: CurrentUser | null) {
  return user !== null && ['moderator', 'admin'].includes(user.role.toLocaleLowerCase());
}

export interface Shop {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category_id: string | null;
  cnpj: string | null;
  address: string | null;
  phone: string | null;
  logo_url: string | null;
}

export interface AdInput {
  title: string;
  description: string;
  price: number | null;
  category_id: string;
  contact_phone: string;
  location: string;
}

export interface ReportInput {
  ad_id: string;
  reason: 'spam' | 'fraud' | 'inappropriate' | 'expired';
  description: string;
}

export interface Report {
  id: string;
  ad_id: string;
  reporter_id: string;
  reason: ReportInput['reason'];
  description: string | null;
  status: 'pending' | 'reviewed' | 'dismissed';
  created_at: string;
  ads?: { title: string } | { title: string }[] | null;
  profiles?: { name: string } | { name: string }[] | null;
}

export type ReportStatus = Report['status'];
export type ModerationAction = 'approve' | 'reject';

export const MAX_AD_TEXT_LENGTH = 5000;

function validateAd(input: AdInput) {
  if (!input.title.trim() || input.title.trim().length > 120) {
    throw new Error('O título deve ter entre 1 e 120 caracteres.');
  }
  if (input.description.trim().length > 2000) {
    throw new Error('A descrição deve ter no máximo 2000 caracteres.');
  }
  if (input.price !== null && (!Number.isFinite(input.price) || input.price < 0)) {
    throw new Error('Informe um preço válido, maior ou igual a zero.');
  }
  if (!input.category_id) throw new Error('Selecione uma categoria cadastrada.');
  if (input.contact_phone.trim().length > 30 || input.location.trim().length > 160) {
    throw new Error('O telefone ou a localização excede o limite permitido.');
  }
}

export function getCurrentUser() {
  return apiRequest<CurrentUser>('/auth/me');
}

export function signIn(email: string, password: string) {
  return apiRequest<{ authenticated: boolean; requiresEmailConfirmation?: boolean; user: CurrentUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function signUp(name: string, email: string, password: string) {
  return apiRequest<{ authenticated: boolean; requiresEmailConfirmation: boolean; user: CurrentUser }>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export function signOut() {
  return apiRequest<{ authenticated: boolean }>('/auth/logout', { method: 'POST' });
}

export function getActiveAds() {
  return apiRequest<Ad[]>('/ads');
}

export function getCategories() {
  return apiRequest<Category[]>('/categories');
}

export function getPendingAds() {
  return apiRequest<Ad[]>('/ads/moderation/pending');
}

export function createAd(input: AdInput) {
  validateAd(input);
  return apiRequest<Ad>('/ads', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateAd(id: string, input: AdInput) {
  validateAd(input);
  return apiRequest<Ad>(`/ads/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function moderateAd(id: string, action: ModerationAction) {
  return apiRequest<Ad>(`/ads/moderation/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ action, isVerified: action === 'approve' }),
  });
}

export function getUserAds() {
  return apiRequest<Ad[]>('/ads/my-ads');
}

export function deleteAd(id: string) {
  return apiRequest<{ success: boolean }>(`/ads/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function getUserProfile() {
  return apiRequest<UserProfile>('/users/profile');
}

export function updateUserProfile(input: Pick<UserProfile, 'name' | 'phone' | 'bio'>) {
  if (input.name.trim().length < 2 || input.name.trim().length > 120) {
    throw new Error('O nome deve ter entre 2 e 120 caracteres.');
  }
  if ((input.phone?.length ?? 0) > 30 || (input.bio?.length ?? 0) > 500) {
    throw new Error('O telefone ou a biografia excede o limite permitido.');
  }
  return apiRequest<UserProfile>('/users/profile', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function getShop() {
  return apiRequest<Shop | null>('/shops/my-shop');
}

export function updateShop(input: Pick<Shop, 'name' | 'description' | 'category_id' | 'phone' | 'address'>) {
  if (input.name.trim().length < 2 || input.name.trim().length > 120) {
    throw new Error('O nome do comércio deve ter entre 2 e 120 caracteres.');
  }
  if ((input.description?.length ?? 0) > 2000 || (input.address?.length ?? 0) > 200) {
    throw new Error('A descrição ou o endereço excede o limite permitido.');
  }
  if ((input.phone?.length ?? 0) > 30) throw new Error('O telefone excede o limite permitido.');
  return apiRequest<Shop>('/shops/my-shop', {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function deleteShop() {
  return apiRequest<{ success: boolean }>('/shops/my-shop', { method: 'DELETE' });
}

export function submitReport(input: ReportInput) {
  if (!input.ad_id) throw new Error('O anúncio da denúncia não foi identificado.');
  if (!['spam', 'fraud', 'inappropriate', 'expired'].includes(input.reason)) {
    throw new Error('Selecione um motivo válido para a denúncia.');
  }
  if (input.description.trim().length > 140) {
    throw new Error('Os detalhes devem ter no máximo 140 caracteres.');
  }
  return apiRequest<Report>('/reports', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function submitRawMessage(content: string) {
  const normalizedContent = content.trim();
  if (!normalizedContent) throw new Error('Informe a mensagem do anúncio.');
  if (normalizedContent.length > MAX_AD_TEXT_LENGTH) {
    throw new Error(`A mensagem deve ter no máximo ${MAX_AD_TEXT_LENGTH} caracteres.`);
  }
  return apiRequest<{ id: string; status: 'pending'; created_at: string }>('/ads/raw-messages', {
    method: 'POST',
    body: JSON.stringify({ content: normalizedContent }),
  });
}

export function getReports() {
  return apiRequest<Report[]>('/reports');
}

export function updateReportStatus(id: string, status: ReportStatus) {
  return apiRequest<Report>(`/reports/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function deleteReport(id: string) {
  return apiRequest<{ success: boolean }>(`/reports/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function createCategory(name: string) {
  return apiRequest<Category>('/categories', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export function updateCategory(id: string, name: string) {
  return apiRequest<Category>(`/categories/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
}

export function deleteCategory(id: string) {
  return apiRequest<{ success: boolean }>(`/categories/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export function getCategoryName(ad: Ad) {
  const relatedCategoryName = Array.isArray(ad.categories)
    ? ad.categories[0]?.name
    : ad.categories?.name;
  return relatedCategoryName?.trim() || 'Categoria indisponível';
}
