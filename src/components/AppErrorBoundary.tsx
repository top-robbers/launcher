import { Component, type CSSProperties, type ErrorInfo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Bug, Copy, RotateCcw, X } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { logger } from '../lib/logger';
import { PanelBackground } from './PanelBackground';

type AppErrorBoundaryProps = {
	children: ReactNode;
};

type AppErrorBoundaryState = {
	error: Error | null;
	errorInfo: ErrorInfo | null;
};

declare global {
	interface Window {
		__TAURI_INTERNALS__?: unknown;
	}
}

const dragRegionStyle = {
	WebkitAppRegion: 'drag',
} as CSSProperties;

const noDragRegionStyle = {
	WebkitAppRegion: 'no-drag',
} as CSSProperties;

function isTauriRuntime() {
	return typeof window !== 'undefined' && window.__TAURI_INTERNALS__ !== undefined;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
	public state: AppErrorBoundaryState = {
		error: null,
		errorInfo: null,
	};

	public static getDerivedStateFromError(error: Error): Partial<AppErrorBoundaryState> {
		return { error };
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		this.setState({ errorInfo });

		logger.error('React', 'Application render crashed.', {
			name: error.name,
			message: error.message,
			stack: error.stack,
			componentStack: errorInfo.componentStack,
		});
	}

	private handleReload = () => {
		window.location.reload();
	};

	public render() {
		if (this.state.error) {
			return <AppErrorFallback error={this.state.error} errorInfo={this.state.errorInfo} onReload={this.handleReload} />;
		}

		return this.props.children;
	}
}

type AppErrorFallbackProps = {
	error: Error;
	errorInfo: ErrorInfo | null;
	onReload: () => void;
};

function AppErrorFallback({ error, errorInfo, onReload }: AppErrorFallbackProps) {
	const { t } = useTranslation();

	const errorDetails = [`${error.name}: ${error.message}`, error.stack, errorInfo?.componentStack].filter(Boolean).join('\n\n');

	const handleClose = async () => {
		try {
			if (isTauriRuntime()) {
				await getCurrentWindow().close();
				return;
			}
		} catch (closeError) {
			console.error('[AppErrorBoundary] Failed to close Tauri window.', closeError);
		}

		window.close();
	};

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(errorDetails);
			logger.info('React', 'Application crash details copied to clipboard.');
		} catch (copyError) {
			logger.warn('React', 'Failed to copy crash details to clipboard.', {
				error: copyError instanceof Error ? copyError.message : String(copyError),
			});
		}
	};

	return (
		<main className="flex h-full min-h-0 items-center justify-center overflow-hidden bg-transparent p-8 text-white">
			<section className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-primary/10 shadow-2xl shadow-black/60">
				<PanelBackground variant="danger" />

				<div className="relative z-10">
					<header className="flex h-16 items-center justify-between border-b border-primary/10 px-5" style={dragRegionStyle}>
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-red-300/20 bg-red-500/10 text-red-200">
								<AlertTriangle size={20} />
							</div>

							<div>
								<div className="text-sm font-black uppercase tracking-[-0.03em] text-primary">Top Robbers</div>

								<div className="text-[10px] font-black uppercase tracking-[0.18em] text-primary/40">
									{t('appErrorBoundary.windowSubtitle')}
								</div>
							</div>
						</div>

						<button
							type="button"
							onClick={handleClose}
							className="flex h-9 w-9 items-center justify-center rounded-xl text-white/45 transition hover:bg-red-500/15 hover:text-red-100"
							style={noDragRegionStyle}
							aria-label={t('appErrorBoundary.close')}
						>
							<X size={18} />
						</button>
					</header>

					<div className="p-8">
						<div className="inline-flex items-center gap-2 rounded-full border border-red-300/20 bg-red-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-red-200">
							<AlertTriangle size={14} />
							{t('appErrorBoundary.badge')}
						</div>

						<h1 className="mt-5 text-4xl font-black tracking-[-0.065em] text-primary">{t('appErrorBoundary.title')}</h1>

						<div className="mt-7 overflow-hidden rounded-3xl border border-primary/10 bg-black/35">
							<div className="flex items-center gap-2 border-b border-primary/10 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-primary/35">
								<Bug size={14} />
								{t('appErrorBoundary.error')}
							</div>

							<pre className="max-h-56 overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-xs leading-5 text-primary/75">
								{error.name}: {error.message}
							</pre>
						</div>

						<div className="mt-7 flex flex-wrap gap-3">
							<button
								type="button"
								onClick={onReload}
								className="inline-flex items-center gap-2 rounded-2xl bg-accent px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-lg shadow-[#9083d2]/25 transition hover:brightness-110"
							>
								<RotateCcw size={16} />
								{t('appErrorBoundary.reload')}
							</button>

							<button
								type="button"
								onClick={handleCopy}
								className="inline-flex items-center gap-2 rounded-2xl border border-primary/10 bg-primary/[0.06] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-primary/65 transition hover:bg-[#F1E1CD]/10 hover:text-primary"
							>
								<Copy size={16} />
								{t('appErrorBoundary.copyDetails')}
							</button>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
