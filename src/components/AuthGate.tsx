import type { ReactNode } from 'react';
import { CheckingSessionPage } from '../pages/CheckingSessionPage';
import { LoginPage } from '../pages/Login';
import { useAuth } from '../providers/AuthProvider';

export function AuthGate({ children }: { children: ReactNode }) {
	const { status } = useAuth();

	if (status === 'checking') {
		return <CheckingSessionPage />;
	}

	if (status === 'guest' || status === 'authenticating' || status === 'error') {
		return <LoginPage />;
	}

	return children;
}
