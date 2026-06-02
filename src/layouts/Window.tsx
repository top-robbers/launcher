import { Outlet } from 'react-router';
import { WindowTitleBar } from '../components/WindowTitleBar';
import { WindowBottomBar } from '../components/WindowBottomBar';
import { PanelBackground } from '../components/PanelBackground';

export function WindowLayout() {
	return (
		<div className="relative h-screen w-screen overflow-hidden rounded-lg bg-background text-primary">
			<PanelBackground variant="default" />

			<div className="relative flex h-full flex-col">
				<WindowTitleBar />

				<main className="min-h-0 flex-1 p-5">
					<Outlet />
				</main>

				<WindowBottomBar />
			</div>
		</div>
	);
}
