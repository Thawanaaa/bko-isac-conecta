export type AuthResponse = {
  authenticated: boolean;
  expiresAt: number | null;
  requiresEmailConfirmation?: boolean;
};

const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(
  /\/$/,
  '',
);

let refreshTimer: ReturnType<typeof setTimeout> | undefined;

async function postAuth<T>(path: string, body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiUrl}/auth/${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Não foi possível conectar à API. Verifique se o serviço está em execução.');
  }

  if (!response.ok) {
    let message = 'Não foi possível concluir a autenticação.';
    try {
      const payload: unknown = await response.json();
      if (typeof payload === 'object' && payload !== null && 'message' in payload) {
        const apiMessage = payload.message;
        if (typeof apiMessage === 'string') message = apiMessage;
        if (Array.isArray(apiMessage)) message = apiMessage.join(' ');
      }
    } catch {
      // Keep the generic message when the API response is not JSON.
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export function signIn(email: string, password: string) {
  return postAuth<AuthResponse>('login', { email, password });
}

export function signUp(name: string, email: string, password: string) {
  return postAuth<AuthResponse>('signup', { name, email, password });
}

export function scheduleSessionRefresh(expiresAt: number | null) {
  if (refreshTimer) clearTimeout(refreshTimer);
  if (!expiresAt) return;

  const refreshIn = Math.max(expiresAt * 1000 - Date.now() - 60_000, 1_000);
  refreshTimer = setTimeout(() => {
    void refreshSession().catch(() => undefined);
  }, refreshIn);
}

export async function refreshSession() {
  const session = await postAuth<AuthResponse>('refresh');
  if (session.authenticated) {
    scheduleSessionRefresh(session.expiresAt);
  } else if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = undefined;
  }
  return session;
}

export function clearSessionRefresh() {
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = undefined;
}