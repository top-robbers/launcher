import { ChevronRight, Gamepad2, Home, Minimize2, Play, RotateCcw, Settings, Square, X } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';

// todo
type NavigationItem = {
	label: string;
	icon: React.ReactNode;
	active?: boolean;
};

function App() {
	const appWindow = getCurrentWindow();

	// todo
	const navItems: NavigationItem[] = [
		{
			label: 'Home',
			icon: <Home size={18} />,
			active: true,
		},
		{
			label: 'Settings',
			icon: <Settings size={18} />,
		},
	];

	return (
		<div className="launcher-noise relative h-screen w-screen overflow-hidden bg-[#07070c] text-white">
			<div className="absolute -left-36 top-20 h-96 w-96 rounded-full bg-[#9083d2]/20 blur-3xl" />
			<div className="absolute -right-28 bottom-0 h-96 w-96 rounded-full bg-yellow-500/10 blur-3xl" />

			<div className="relative flex h-full flex-col">
				<header className="drag-region flex h-12 shrink-0 items-center justify-between border-b border-white/10 bg-black/20 px-4">
					<div className="flex items-center gap-3">
						<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#9083d2] shadow-lg shadow-[#9083d2]/25">
							<Gamepad2 size={16} />
						</div>

						<div>
							<div className="text-sm font-black leading-none tracking-wide">Top Robbers</div>
						</div>
					</div>

					<div className="no-drag flex items-center gap-1">
						<WindowButton label="Minimize" icon={<Minimize2 size={15} />} onClick={() => appWindow.minimize()} />
						<WindowButton label="Maximize" icon={<Square size={13} />} onClick={() => appWindow.toggleMaximize()} />
						<WindowButton label="Close" icon={<X size={16} />} danger onClick={() => appWindow.close()} />
					</div>
				</header>

				<div className="flex min-h-0 flex-1">
					<aside className="flex w-62.5 shrink-0 flex-col border-r border-white/10 bg-black/25 p-5">
						<nav className="space-y-2">
							{navItems.map((item) => (
								<NavigationButton key={item.label} item={item} />
							))}
						</nav>

						<div className="mt-auto space-y-3">
							<div className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-white/25">
								v0.1.0-alpha
							</div>
						</div>
					</aside>

					<main className="no-scrollbar min-w-0 flex-1 overflow-y-auto p-7">
						<section className="grid">...</section>
					</main>
				</div>
			</div>
		</div>
	);
}

function WindowButton({
	label,
	icon,
	danger = false,
	onClick,
}: {
	label: string;
	icon: React.ReactNode;
	danger?: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			aria-label={label}
			onClick={onClick}
			className={[
				'flex h-8 w-8 items-center justify-center rounded-lg text-white/45 transition',
				danger ? 'hover:bg-red-500 hover:text-white' : 'hover:bg-white/10 hover:text-white',
			].join(' ')}
		>
			{icon}
		</button>
	);
}

function NavigationButton({ item }: { item: NavigationItem }) {
	return (
		<button
			type="button"
			className={[
				'flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition',
				item.active ? 'bg-[#9083d2] text-white shadow-lg shadow-[#9083d2]/25' : 'text-white/45 hover:bg-white/6 hover:text-white',
			].join(' ')}
		>
			{item.icon}
			{item.label}
		</button>
	);
}

export default App;
