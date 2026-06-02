import { createApiError } from './error';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://top-robbers.test/api/v1';

export interface ApiFetchOptions extends Omit<RequestInit, 'headers'> {
	token?: string;
	headers?: Record<string, string>;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
	const { token, headers: extraHeaders, ...init } = options;

	const headers: Record<string, string> = {
		Accept: 'application/json',
		'Content-Type': 'application/json',
		...extraHeaders,
	};

	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });

	if (!response.ok) {
		throw await createApiError(response);
	}

	if (response.status === 204 || response.headers.get('content-length') === '0') {
		return undefined as T;
	}

	return response.json() as Promise<T>;
}
