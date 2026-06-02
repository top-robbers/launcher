import { appLogDir } from '@tauri-apps/api/path';
import { writeTextFile, exists, mkdir } from '@tauri-apps/plugin-fs';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
	timestamp: string;
	level: LogLevel;
	category: string;
	message: string;
	data?: Record<string, unknown>;
}

const LEVEL_RANK: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };
const MIN_LEVEL: LogLevel = import.meta.env.DEV ? 'debug' : 'info';

const CONSOLE_STYLES: Record<LogLevel, string> = {
	debug: 'color:#9e9e9e',
	info: 'color:#4fc3f7',
	warn: 'color:#ffb74d;font-weight:bold',
	error: 'color:#ef5350;font-weight:bold',
};

class Logger {
	private buffer: LogEntry[] = [];
	private flushTimer: ReturnType<typeof setTimeout> | null = null;

	private write(level: LogLevel, category: string, message: string, data?: Record<string, unknown>): void {
		if (LEVEL_RANK[level] < LEVEL_RANK[MIN_LEVEL]) return;

		const entry: LogEntry = {
			timestamp: new Date().toISOString(),
			level,
			category,
			message,
			...(data && { data }),
		};

		this.buffer.push(entry);

		if (import.meta.env.DEV) {
			console.log(`%c[${level.toUpperCase()}] [${category}] ${message}`, CONSOLE_STYLES[level], data ?? '');
		}

		this.scheduleFlush();
	}

	private scheduleFlush(): void {
		if (this.flushTimer) return;
		this.flushTimer = setTimeout(() => {
			void this.flush();
			this.flushTimer = null;
		}, 2_000);
	}

	async flush(): Promise<void> {
		if (this.buffer.length === 0) return;

		const entries = this.buffer.splice(0);

		try {
			const logDir = await appLogDir();

			if (!(await exists(logDir))) {
				await mkdir(logDir, { recursive: true });
			}

			const date = new Date().toISOString().slice(0, 10);
			const logFile = `${logDir}/launcher-${date}.log`;
			const lines = entries.map((e) => JSON.stringify(e)).join('\n') + '\n';

			await writeTextFile(logFile, lines, { append: true });
		} catch {}
	}

	debug(category: string, message: string, data?: Record<string, unknown>): void {
		this.write('debug', category, message, data);
	}

	info(category: string, message: string, data?: Record<string, unknown>): void {
		this.write('info', category, message, data);
	}

	warn(category: string, message: string, data?: Record<string, unknown>): void {
		this.write('warn', category, message, data);
	}

	error(category: string, message: string, data?: Record<string, unknown>): void {
		this.write('error', category, message, data);
	}
}

export const logger = new Logger();
