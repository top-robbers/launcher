export type AuthUser = {
	id: number;
	name: string;
	email: string;
	created_at?: string | null;
};

export type LoginRequest = {
	email: string;
	password: string;
};

export type LoginResponse = {
	token_type: string;
	access_token: string;
	data: AuthUser;
};

export type MeResponse = {
	data: AuthUser;
};

export type AuthStatus = 'checking' | 'guest' | 'authenticating' | 'authenticated' | 'error';
