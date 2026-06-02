import type { AuthUser, LoginRequest, LoginResponse, MeResponse } from '../../types';
import { logger } from '../logger';
import { ApiError } from './error';
import { apiFetch } from './client';

export async function login(request: LoginRequest): Promise<LoginResponse> {
	logger.info('AuthAPI', 'Login request started.', { email: request.email });

	const response = await apiFetch<LoginResponse>('/auth/login', {
		method: 'POST',
		body: JSON.stringify(request),
	});

	logger.info('AuthAPI', 'Login request completed.', {
		email: request.email,
		userId: response.data.id,
		userEmail: response.data.email,
	});

	return response;
}

export async function fetchAuthenticatedUser(accessToken: string): Promise<AuthUser> {
	logger.info('AuthAPI', 'Fetching authenticated user.', { hasToken: Boolean(accessToken) });

	const response = await apiFetch<MeResponse>('/me', { token: accessToken });

	logger.info('AuthAPI', 'Authenticated user loaded.', {
		userId: response.data.id,
		email: response.data.email,
	});

	return response.data;
}

export async function logout(accessToken: string): Promise<void> {
	logger.info('AuthAPI', 'Logout request started.', { hasToken: Boolean(accessToken) });

	try {
		await apiFetch<void>('/auth/logout', { method: 'POST', token: accessToken });
		logger.info('AuthAPI', 'Logout request completed.');
	} catch (error) {
		if (error instanceof ApiError && error.status === 401) {
			logger.warn('AuthAPI', 'Logout returned 401; local session will be cleared.');
			return;
		}

		throw error;
	}
}
