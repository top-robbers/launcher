import { listen } from '@tauri-apps/api/event';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { STARTUP_PROGRESS_EVENT } from '../lib/bootstrap';
import type { BootstrapProgressPayload } from '../types';

const SplashScreen = () => {
	const { t } = useTranslation();

	const [messageKey, setMessageKey] = useState('startup.initializing');
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		const unlistenPromise = listen<BootstrapProgressPayload>(STARTUP_PROGRESS_EVENT, (event) => {
			setMessageKey(event.payload.messageKey);
			setProgress(clampProgress(event.payload.progress));
		});

		return () => {
			void unlistenPromise.then((unlisten) => unlisten());
		};
	}, []);

	return (
		<main className="flex h-screen w-screen items-center justify-center overflow-hidden bg-transparent text-white">
			<section className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#07070c]">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(144,131,210,0.35),transparent_45%),linear-gradient(135deg,#07070c,#11111d)]" />

				<div className="relative flex flex-col items-center text-center">
					<div className="mb-7 flex h-20 w-20 items-center justify-center rounded-[26px] bg-accent text-2xl font-black shadow-2xl shadow-[#9083d2]/35">
						TR
					</div>

					<h1 className="mt-5 text-4xl font-black uppercase tracking-[-0.06em]">Top Robbers</h1>

					<p className="mt-4 min-h-6 max-w-[360px] text-sm font-semibold text-white/50">
						{t(messageKey, { defaultValue: messageKey })}
					</p>

					<div className="mt-7 w-[320px]">
						<div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.18em] text-white/35">
							<span>{t('splashscreen.loading')}</span>
							<span>{progress}%</span>
						</div>

						<div className="h-2 overflow-hidden rounded-full bg-white/10">
							<div
								className="h-full rounded-full bg-accent shadow-[0_0_24px_rgba(144,131,210,0.8)] transition-all duration-300"
								style={{ width: `${progress}%` }}
							/>
						</div>
					</div>

					<div className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-white/25">v0.1.0-alpha</div>
				</div>
			</section>
		</main>
	);
};

function clampProgress(progress: number): number {
	if (!Number.isFinite(progress)) {
		return 0;
	}

	return Math.min(100, Math.max(0, Math.round(progress)));
}

export default SplashScreen;
