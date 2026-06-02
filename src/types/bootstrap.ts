export type BootstrapStatus = 'bootstrapping' | 'ready' | 'failed';

export type BootstrapAuthStatus = 'authenticated' | 'guest' | 'error';

export type BootstrapProgressPayload = {
	step: string;
	messageKey: string;
	progress: number;
};
