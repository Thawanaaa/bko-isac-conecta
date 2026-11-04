'use client';

import type { User } from '@supabase/supabase-js';
import { getSupabaseClient } from './supabase';

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Ad {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number | null;
  contact_phone: string | null;
  location: string | null;
  is_verified: boolean;
  category_id: string;
  categories?: { name: string } | { name: string }[] | null;
  profiles?: { name: string; phone: string | null } | { name: string; phone: string | null }[] | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: 'member' | 'moderator' | 'admin';
  created_at: string;
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

async function requireUser(): Promise<User> {
  const { data, error } = await getSupabaseClient().auth.getUser();
  if (error) throw new Error(`Não foi possível validar sua sessão: ${error.message}`);
  if (!data.user) throw new Error('Entre na sua conta para continuar.');
  return data.user;
}

function throwDatabaseError(error: { message: string; code?: string }): never {
  throw new Error(`Erro ao acessar o banco de dados: ${error.message}`);
}

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

export async function getActiveAds(): Promise<Ad[]> {
  const { data, error } = await getSupabaseClient()
    .from('ads')
    .select('*, categories(name)')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });
  if (error) throwDatabaseError(error);
  return data;
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await getSupabaseClient()
    .from('categories')
    .select('id, name, slug')
    .order('name');
  if (error) throwDatabaseError(error);
  return data;
}

export async function getPendingAds(): Promise<Ad[]> {
  await requireUser();
  const { data, error } = await getSupabaseClient()
    .from('ads')
    .select('*, categories(name), profiles(name, phone)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });
  if (error) throwDatabaseError(error);
  return data;
}

export async function createAd(input: AdInput): Promise<Ad> {
  validateAd(input);
  const user = await requireUser();
  const { data, error } = await getSupabaseClient()
    .from('ads')
    .insert({
      ...input,
      title: input.title.trim(),
      description: input.description.trim() || null,
      contact_phone: input.contact_phone.trim() || null,
      location: input.location.trim() || null,
      user_id: user.id,
      status: 'pending',
      is_verified: false,
    })
    .select('*, categories(name)')
    .single();
  if (error) throwDatabaseError(error);
  return data;
}

export async function updateAd(id: string, input: AdInput): Promise<Ad> {
  validateAd(input);
  const user = await requireUser();
  const { data, error } = await getSupabaseClient()
    .from('ads')
    .update({
      ...input,
      title: input.title.trim(),
      description: input.description.trim() || null,
      contact_phone: input.contact_phone.trim() || null,
      location: input.location.trim() || null,
      status: 'pending',
      is_verified: false,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*, categories(name)')
    .single();
  if (error) throwDatabaseError(error);
  return data;
}

export async function moderateAd(id: string, action: ModerationAction): Promise<Ad> {
  await requireUser();
  const { data, error } = await getSupabaseClient()
    .from('ads')
    .update({
      status: action === 'approve' ? 'approved' : 'rejected',
      is_verified: action === 'approve',
    })
    .eq('id', id)
    .eq('status', 'pending')
    .select('*, categories(name)')
    .single();
  if (error) throwDatabaseError(error);
  return data;
}

export async function getUserAds(): Promise<Ad[]> {
  const user = await requireUser();
  const { data, error } = await getSupabaseClient()
    .from('ads')
    .select('*, categories(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throwDatabaseError(error);
  return data;
}

export async function deleteAd(id: string): Promise<void> {
  const user = await requireUser();
  const { error } = await getSupabaseClient()
    .from('ads')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
    .select('id')
    .single();
  if (error) throwDatabaseError(error);
}

export async function getUserProfile(): Promise<UserProfile> {
  const user = await requireUser();
  const { data, error } = await getSupabaseClient()
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  if (error) throwDatabaseError(error);
  return data;
}

export async function updateUserProfile(input: Pick<UserProfile, 'name' | 'phone' | 'bio'>) {
  const user = await requireUser();
  if (input.name.trim().length < 2 || input.name.trim().length > 120) {
    throw new Error('O nome deve ter entre 2 e 120 caracteres.');
  }
  if ((input.phone?.length ?? 0) > 30 || (input.bio?.length ?? 0) > 500) {
    throw new Error('O telefone ou a biografia excede o limite permitido.');
  }

  const { data, error } = await getSupabaseClient()
    .from('profiles')
    .update({ email: user.email ?? '', ...input, name: input.name.trim() })
    .eq('id', user.id)
    .select('*')
    .single();
  if (error) throwDatabaseError(error);
  return data as UserProfile;
}

export async function getShop(): Promise<Shop | null> {
  const user = await requireUser();
  const { data, error } = await getSupabaseClient()
    .from('shops')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) throwDatabaseError(error);
  return data;
}

export async function updateShop(input: Pick<Shop, 'name' | 'description' | 'category_id' | 'phone' | 'address'>) {
  const user = await requireUser();
  if (input.name.trim().length < 2 || input.name.trim().length > 120) {
    throw new Error('O nome do comércio deve ter entre 2 e 120 caracteres.');
  }
  if ((input.description?.length ?? 0) > 2000 || (input.address?.length ?? 0) > 200) {
    throw new Error('A descrição ou o endereço excede o limite permitido.');
  }
  if ((input.phone?.length ?? 0) > 30) throw new Error('O telefone excede o limite permitido.');

  const { data, error } = await getSupabaseClient()
    .from('shops')
    .upsert(
      { ...input, name: input.name.trim(), user_id: user.id },
      { onConflict: 'user_id' },
    )
    .select('*')
    .single();
  if (error) throwDatabaseError(error);
  return data as Shop;
}

export async function deleteShop(): Promise<void> {
  const user = await requireUser();
  const { error } = await getSupabaseClient()
    .from('shops')
    .delete()
    .eq('user_id', user.id)
    .select('id')
    .single();
  if (error) throwDatabaseError(error);
}

export async function submitReport(input: ReportInput): Promise<void> {
  const user = await requireUser();
  if (!input.ad_id) throw new Error('O anúncio da denúncia não foi identificado.');
  if (!['spam', 'fraud', 'inappropriate', 'expired'].includes(input.reason)) {
    throw new Error('Selecione um motivo válido para a denúncia.');
  }
  if (input.description.trim().length > 140) {
    throw new Error('Os detalhes devem ter no máximo 140 caracteres.');
  }

  const { error } = await getSupabaseClient().from('reports').insert({
    ad_id: input.ad_id,
    reporter_id: user.id,
    reason: input.reason,
    description: input.description.trim() || null,
  });
  if (error) throwDatabaseError(error);
}

export async function getReports(): Promise<Report[]> {
  await requireUser();
  const { data, error } = await getSupabaseClient()
    .from('reports')
    .select('*, ads(title), profiles(name)')
    .order('created_at', { ascending: false });
  if (error) throwDatabaseError(error);
  return data;
}

export async function updateReportStatus(id: string, status: ReportStatus): Promise<Report> {
  await requireUser();
  const { data, error } = await getSupabaseClient()
    .from('reports')
    .update({ status })
    .eq('id', id)
    .select('*, ads(title), profiles(name)')
    .single();
  if (error) throwDatabaseError(error);
  return data;
}

export async function deleteReport(id: string): Promise<void> {
  await requireUser();
  const { error } = await getSupabaseClient().from('reports').delete().eq('id', id).select('id').single();
  if (error) throwDatabaseError(error);
}

export async function createCategory(name: string): Promise<Category> {
  await requireUser();
  const normalizedName = name.trim();
  if (normalizedName.length < 2 || normalizedName.length > 80) {
    throw new Error('O nome da categoria deve ter entre 2 e 80 caracteres.');
  }
  const slug = normalizedName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  if (!slug) throw new Error('O nome da categoria deve conter letras ou números.');
  const { data, error } = await getSupabaseClient()
    .from('categories')
    .insert({ name: normalizedName, slug })
    .select('id, name, slug')
    .single();
  if (error) throwDatabaseError(error);
  return data;
}

export async function updateCategory(id: string, name: string): Promise<Category> {
  await requireUser();
  const normalizedName = name.trim();
  if (normalizedName.length < 2 || normalizedName.length > 80) {
    throw new Error('O nome da categoria deve ter entre 2 e 80 caracteres.');
  }
  const slug = normalizedName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  if (!slug) throw new Error('O nome da categoria deve conter letras ou números.');
  const { data, error } = await getSupabaseClient()
    .from('categories')
    .update({ name: normalizedName, slug })
    .eq('id', id)
    .select('id, name, slug')
    .single();
  if (error) throwDatabaseError(error);
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  await requireUser();
  const { error } = await getSupabaseClient().from('categories').delete().eq('id', id).select('id').single();
  if (error) throwDatabaseError(error);
}

export function getCategoryName(ad: Ad) {
  const relatedCategoryName = Array.isArray(ad.categories)
    ? ad.categories[0]?.name
    : ad.categories?.name;
  return relatedCategoryName?.trim() || 'Categoria indisponível';
}
