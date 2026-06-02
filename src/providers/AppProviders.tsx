import { ThemeProvider } from './ThemeProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
	return <ThemeProvider storageKey="top-robbers-theme">{children}</ThemeProvider>;
}
