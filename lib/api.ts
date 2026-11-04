const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');

export class ApiRequestError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

function getApiUrl() {
  if (!apiUrl) throw new Error('Configure NEXT_PUBLIC_API_URL com o endereço da API.');
  return apiUrl;
}

async function request(path: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(`${getApiUrl()}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new Error('Não foi possível conectar à API. Verifique NEXT_PUBLIC_API_URL e se o serviço está em execução.');
  }
}

function isJson(response: Response) {
  const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
  return contentType.includes('application/json') || contentType.includes('+json');
}

function unexpectedResponseMessage(status: number) {
  return `A API respondeu com conteúdo inesperado (HTTP ${status}). Verifique se NEXT_PUBLIC_API_URL aponta para a API NestJS.`;
}

async function getErrorMessage(response: Response) {
  const message = `Não foi possível concluir a solicitação (HTTP ${response.status}).`;
  if (!isJson(response)) return unexpectedResponseMessage(response.status);

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return message;
  }

  if (typeof body !== 'object' || body === null || !('message' in body)) return message;
  const apiMessage = body.message;
  if (typeof apiMessage === 'string' && apiMessage.trim()) return apiMessage;
  if (Array.isArray(apiMessage) && apiMessage.every((item) => typeof item === 'string')) {
    return apiMessage.join(' ') || message;
  }
  return message;
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  let response = await request(path, init);

  if (
    response.status === 401 &&
    !['/auth/login', '/auth/signup', '/auth/logout', '/auth/refresh'].includes(path)
  ) {
    const refresh = await request('/auth/refresh', { method: 'POST' });
    if (refresh.ok) response = await request(path, init);
  }

  if (!response.ok) throw new ApiRequestError(await getErrorMessage(response), response.status);
  if (response.status === 204) return undefined as T;
  if (!isJson(response)) throw new Error(unexpectedResponseMessage(response.status));

  try {
    return await response.json() as T;
  } catch {
    throw new Error('A API retornou uma resposta JSON inválida.');
  }
}
