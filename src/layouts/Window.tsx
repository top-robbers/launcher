import { Outlet } from 'react-router';
import { WindowTitleBar } from '../components/WindowTitleBar';

export function WindowLayout() {
	return (
		<div className="launcher-noise relative h-screen w-screen overflow-hidden bg-[#07070c] text-white rounded-lg">
			<div className="absolute -left-36 top-20 h-96 w-96 rounded-full bg-[#9083d2]/20 blur-3xl" />
			<div className="absolute -right-28 bottom-0 h-96 w-96 rounded-full bg-yellow-500/10 blur-3xl" />

			<div className="relative flex h-full flex-col">
				<WindowTitleBar />

				<div className="min-h-0 flex-1 p-5">
					<Outlet />
				</div>
			</div>
		</div>
	);
}
