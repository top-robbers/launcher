import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { fetchAuthenticatedUser, login, logout } from '../lib/api/auth';
import { logger } from '../lib/logger';
import { clearAccessToken, getStoredAccessToken, storeAccessToken } from '../store/authToken';
import type { AuthStatus, AuthUser, LoginRequest } from '../types';

type AuthContextValue = {
	status: AuthStatus;
	user: AuthUser | null;
	accessToken: string | null;
	error: string | null;
	login: (request: LoginRequest) => Promise<void>;
	logout: () => Promise<void>;
	recheckSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [status, setStatus] = useState<AuthStatus>('checking');
	const [user, setUser] = useState<AuthUser | null>(null);
	const [accessToken, setAccessToken] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const hasCheckedSessionRef = useRef(false);

	const resetSession = useCallback(async (reason: string) => {
		logger.info('Auth', 'Resetting local session.', { reason });

		try {
			await clearAccessToken();
		} catch (clearError) {
			logger.warn('Auth', 'Failed to clear stored token during reset.', { error: clearError });
		}

		setAccessToken(null);
		setUser(null);
		setStatus('guest');
	}, []);

	const recheckSession = useCallback(async () => {
		logger.info('Auth', 'Session recheck started.');

		setStatus('checking');
		setError(null);

		try {
			const storedToken = await getStoredAccessToken();

			if (!storedToken) {
				logger.info('Auth', 'No stored token; user is guest.');
				setAccessToken(null);
				setUser(null);
				setStatus('guest');
				return;
			}

			logger.info('Auth', 'Stored token found; validating with API.');
			const authenticatedUser = await fetchAuthenticatedUser(storedToken);

			logger.info('Auth', 'Stored session is valid.', {
				userId: authenticatedUser.id,
				email: authenticatedUser.email,
			});

			setAccessToken(storedToken);
			setUser(authenticatedUser);
			setStatus('authenticated');
		} catch (sessionError) {
			logger.warn('Auth', 'Stored session is unavailable.', { error: sessionError });
			await resetSession('stored-session-unavailable');
		}
	}, [resetSession]);

	useEffect(() => {
		if (hasCheckedSessionRef.current) {
			logger.debug('Auth', 'Initial session recheck skipped; already started.');
			return;
		}

		hasCheckedSessionRef.current = true;
		void recheckSession();
	}, [recheckSession]);

	const signIn = useCallback(async (request: LoginRequest) => {
		logger.info('Auth', 'Sign-in started.', { email: request.email });

		setStatus('authenticating');
		setError(null);

		try {
			const response = await login(request);
			await storeAccessToken(response.access_token);

			const authenticatedUser = response.data;

			logger.info('Auth', 'Sign-in completed.', {
				userId: authenticatedUser.id,
				email: authenticatedUser.email,
			});

			setAccessToken(response.access_token);
			setUser(authenticatedUser);
			setStatus('authenticated');
		} catch (loginError) {
			logger.warn('Auth', 'Sign-in failed.', { error: loginError, email: request.email });

			setUser(null);
			setAccessToken(null);
			setStatus('guest');
			setError(loginError instanceof Error ? loginError.message : 'Login failed.');
		}
	}, []);

	const signOut = useCallback(async () => {
		logger.info('Auth', 'Sign-out started.', { hasToken: Boolean(accessToken) });

		const token = accessToken;
		setStatus('checking');
		setError(null);

		try {
			if (token) {
				await logout(token);
			}
		} catch (logoutError) {
			logger.warn('Auth', 'Remote logout failed; local session will be cleared anyway.', { error: logoutError });
		} finally {
			await resetSession('user-logout');
		}
	}, [accessToken, resetSession]);

	const value = useMemo<AuthContextValue>(
		() => ({
			status,
			user,
			accessToken,
			error,
			login: signIn,
			logout: signOut,
			recheckSession,
		}),
		[status, user, accessToken, error, signIn, signOut, recheckSession],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error('useAuth must be used inside AuthProvider.');
	}

	return context;
}
