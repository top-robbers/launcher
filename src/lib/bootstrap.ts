import { emit } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import { isTauriRuntime } from './tauri';
import { logger } from './logger';
import type { BootstrapAuthStatus, BootstrapProgressPayload } from '../types';

export const STARTUP_PROGRESS_EVENT = 'startup://progress';

let frontendBootstrapCompleted = false;
let frontendBootstrapAuthStatus: BootstrapAuthStatus | null = null;

export async function emitBootstrapProgress(payload: BootstrapProgressPayload): Promise<void> {
	if (!isTauriRuntime()) {
		logger.debug('BootstrapIPC', 'Skipping progress emit outside Tauri.', payload as unknown as Record<string, unknown>);
		return;
	}

	logger.debug('BootstrapIPC', 'Emitting progress event.', payload as unknown as Record<string, unknown>);
	await emit(STARTUP_PROGRESS_EVENT, payload);
}

export async function completeFrontendBootstrap(authStatus: BootstrapAuthStatus): Promise<void> {
	if (frontendBootstrapCompleted) {
		logger.warn('BootstrapIPC', 'Frontend bootstrap completion ignored; already completed.', {
			previousAuthStatus: frontendBootstrapAuthStatus,
			nextAuthStatus: authStatus,
		});
		return;
	}

	frontendBootstrapCompleted = true;
	frontendBootstrapAuthStatus = authStatus;

	if (!isTauriRuntime()) {
		logger.debug('BootstrapIPC', 'Skipping frontend bootstrap completion outside Tauri.', { authStatus });
		return;
	}

	logger.info('BootstrapIPC', 'Invoking complete_frontend_bootstrap.', { authStatus });

	try {
		await invoke('complete_frontend_bootstrap', {
			result: {
				authStatus,
			},
		});
	} catch (error) {
		frontendBootstrapCompleted = false;
		frontendBootstrapAuthStatus = null;
		throw error;
	}
}
