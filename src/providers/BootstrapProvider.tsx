import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthProvider';
import { completeFrontendBootstrap, emitBootstrapProgress } from '../lib/bootstrap';
import type { BootstrapAuthStatus, BootstrapStatus } from '../types';

type BootstrapContextValue = {
	status: BootstrapStatus;
	error: string | null;
};

const BootstrapContext = createContext<BootstrapContextValue | undefined>(undefined);

export function BootstrapProvider({ children }: { children: ReactNode }) {
	const { status: authStatus } = useAuth();

	const [status, setStatus] = useState<BootstrapStatus>('bootstrapping');
	const [error, setError] = useState<string | null>(null);

	const hasStartedRef = useRef(false);
	const hasCompletedRef = useRef(false);

	const emitProgress = useCallback(async (step: string, messageKey: string, progress: number) => {
		try {
			await emitBootstrapProgress({
				step,
				messageKey,
				progress,
			});
		} catch (progressError) {
			console.warn('[Bootstrap] Failed to emit progress.', progressError);
		}
	}, []);

	const finishBootstrap = useCallback(
		async (resolvedAuthStatus: BootstrapAuthStatus, messageKey: string) => {
			try {
				await emitProgress('session', messageKey, 94);
				await emitProgress('frontend', 'startup.frontendReady', 100);
				await completeFrontendBootstrap(resolvedAuthStatus);

				setStatus('ready');
				setError(null);
			} catch (bootstrapError) {
				const message = bootstrapError instanceof Error ? bootstrapError.message : 'Frontend bootstrap failed.';

				console.error('[Bootstrap] Failed.', bootstrapError);
				setStatus('failed');
				setError(message);
			}
		},
		[emitProgress],
	);

	useEffect(() => {
		if (hasStartedRef.current) {
			return;
		}

		hasStartedRef.current = true;
		void emitProgress('frontend', 'startup.frontendInitializing', 72);
	}, [emitProgress]);

	useEffect(() => {
		if (hasCompletedRef.current) {
			return;
		}

		if (authStatus === 'checking') {
			void emitProgress('session', 'startup.restoringSession', 78);
			return;
		}

		if (authStatus === 'authenticating') {
			return;
		}

		hasCompletedRef.current = true;

		const resolvedAuthStatus = mapAuthStatus(authStatus);
		const messageKey = authStatus === 'authenticated' ? 'startup.sessionValid' : 'startup.sessionUnavailable';

		void finishBootstrap(resolvedAuthStatus, messageKey);
	}, [authStatus, emitProgress, finishBootstrap]);

	const value = useMemo<BootstrapContextValue>(
		() => ({
			status,
			error,
		}),
		[status, error],
	);

	return <BootstrapContext.Provider value={value}>{children}</BootstrapContext.Provider>;
}

export function useBootstrap() {
	const context = useContext(BootstrapContext);

	if (!context) {
		throw new Error('useBootstrap must be used inside BootstrapProvider.');
	}

	return context;
}

function mapAuthStatus(authStatus: string): BootstrapAuthStatus {
	if (authStatus === 'authenticated') {
		return 'authenticated';
	}

	if (authStatus === 'error') {
		return 'error';
	}

	return 'guest';
}
