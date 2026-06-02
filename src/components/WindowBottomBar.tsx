import { useEffect, useState } from 'react';
import { getVersion } from '@tauri-apps/api/app';

export function WindowBottomBar() {
	const [version, setVersion] = useState<string | null>(null);

	useEffect(() => {
		void getVersion()
			.then((appVersion) => {
				setVersion(appVersion);
			})
			.catch(() => {
				setVersion(null);
			});
	}, []);

	return (
		<footer className="flex h-8 shrink-0 items-center justify-end px-5 text-xs border-t border-primary/10">
			{version && <span className="ms-2 text-[11px]">v{version}</span>}
		</footer>
	);
}
