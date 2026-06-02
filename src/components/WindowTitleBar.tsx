import { getCurrentWindow } from '@tauri-apps/api/window';
import { Minus, Square, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { UserBadge } from './UserBadge';

type WindowAction = 'minimize' | 'maximize' | 'close';

export function WindowTitleBar() {
	return (
		<header
			data-tauri-drag-region
			className="flex h-12 shrink-0 items-center justify-between border-b border-primary/10 bg-black/25 px-4"
		>
			<div data-tauri-drag-region className="flex min-w-0 items-center gap-3">
				<div data-tauri-drag-region className="min-w-0">
					<div className="truncate text-sm font-black leading-none tracking-wide text-secondary">Top Robbers</div>
				</div>
			</div>

			<div className="flex shrink-0 items-center gap-1">
				<UserBadge compact />
				<WindowButton label="Minimize" icon={<Minus size={15} />} onClick={() => void handleWindowAction('minimize')} />
				<WindowButton label="Maximize" icon={<Square size={13} />} onClick={() => void handleWindowAction('maximize')} />
				<WindowButton label="Close" icon={<X size={16} />} danger onClick={() => void handleWindowAction('close')} />
			</div>
		</header>
	);
}

async function handleWindowAction(action: WindowAction): Promise<void> {
	try {
		const appWindow = getCurrentWindow();

		switch (action) {
			case 'minimize':
				await appWindow.minimize();
				break;

			case 'maximize':
				await appWindow.toggleMaximize();
				break;

			case 'close':
				await appWindow.close();
				break;
		}
	} catch (error) {
		console.error(`[Launcher] Failed to execute window action "${action}".`, error);
	}
}

function WindowButton({ label, icon, danger = false, onClick }: { label: string; icon: ReactNode; danger?: boolean; onClick: () => void }) {
	return (
		<button
			type="button"
			aria-label={label}
			onClick={(event) => {
				event.preventDefault();
				event.stopPropagation();
				onClick();
			}}
			className={[
				'flex h-8 w-8 items-center justify-center rounded-lg text-primary/45 transition',
				danger ? 'hover:bg-red-500 hover:text-white' : 'hover:bg-[#F1E1CD]/10 hover:text-primary',
			].join(' ')}
		>
			{icon}
		</button>
	);
}
