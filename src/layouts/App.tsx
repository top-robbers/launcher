import { Outlet } from 'react-router';
import { AppErrorBoundary } from '../components/AppErrorBoundary';
import { AuthProvider } from '../providers/AuthProvider';
import { BootstrapProvider } from '../providers/BootstrapProvider';

export function AppLayout() {
	return (
		<AuthProvider>
			<BootstrapProvider>
				<AppErrorBoundary>
					<Outlet />
				</AppErrorBoundary>
			</BootstrapProvider>
		</AuthProvider>
	);
}
