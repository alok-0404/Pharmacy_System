import type { ApiResponse } from '../types';

const TENANT_HEADER = 'x-tenant-id';

export class ApiClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiClientError';
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const body = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !body.success) {
    throw new ApiClientError(body.message || 'Request failed');
  }

  return body.data as T;
}

export async function apiGet<T>(path: string, tenantId?: string): Promise<T> {
  const headers: HeadersInit = {};

  if (tenantId) {
    headers[TENANT_HEADER] = tenantId;
  }

  const response = await fetch(path, { headers });
  return parseResponse<T>(response);
}

export async function apiPost<T>(
  path: string,
  data: unknown,
  tenantId?: string,
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (tenantId) {
    headers[TENANT_HEADER] = tenantId;
  }

  const response = await fetch(path, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  return parseResponse<T>(response);
}

export async function apiPatch<T>(
  path: string,
  data: unknown,
  tenantId?: string,
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (tenantId) {
    headers[TENANT_HEADER] = tenantId;
  }

  const response = await fetch(path, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data),
  });

  return parseResponse<T>(response);
}

export async function apiDelete(path: string, tenantId?: string): Promise<void> {
  const headers: HeadersInit = {};

  if (tenantId) {
    headers[TENANT_HEADER] = tenantId;
  }

  const response = await fetch(path, { method: 'DELETE', headers });
  await parseResponse<undefined>(response);
}
