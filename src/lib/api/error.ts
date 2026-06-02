export type ApiValidationErrors = Record<string, string[]>;

export class ApiError extends Error {
	readonly status: number;
	readonly statusText: string;
	readonly errors?: ApiValidationErrors;
	readonly body?: unknown;
	readonly rawBody?: string;

	constructor(params: {
		status: number;
		statusText: string;
		message: string;
		errors?: ApiValidationErrors;
		body?: unknown;
		rawBody?: string;
	}) {
		super(params.message);
		this.name = 'ApiError';
		this.status = params.status;
		this.statusText = params.statusText;
		this.errors = params.errors;
		this.body = params.body;
		this.rawBody = params.rawBody;
		Object.setPrototypeOf(this, ApiError.prototype);
	}

	get firstValidationMessage(): string | null {
		return getFirstValidationMessage(this.errors);
	}
}

export async function createApiError(response: Response): Promise<ApiError> {
	const rawBody = await response.text();
	const body = parseBody(rawBody);
	const errors = extractValidationErrors(body);
	const message = (extractMessage(body) ?? getFirstValidationMessage(errors) ?? response.statusText) || 'API error';

	return new ApiError({
		status: response.status,
		statusText: response.statusText,
		message,
		errors,
		body,
		rawBody,
	});
}

function parseBody(rawBody: string): unknown {
	if (!rawBody.trim()) return null;
	try {
		return JSON.parse(rawBody);
	} catch {
		return rawBody;
	}
}

function extractMessage(body: unknown): string | null {
	if (typeof body === 'string') return body;
	if (!isRecord(body)) return null;

	const { message } = body;
	return typeof message === 'string' && message.trim() !== '' ? message : null;
}

function extractValidationErrors(body: unknown): ApiValidationErrors | undefined {
	if (!isRecord(body) || !isRecord(body.errors)) return undefined;

	const normalized: ApiValidationErrors = {};

	for (const [field, messages] of Object.entries(body.errors)) {
		if (Array.isArray(messages)) {
			normalized[field] = messages.filter((m): m is string => typeof m === 'string');
		} else if (typeof messages === 'string') {
			normalized[field] = [messages];
		}
	}

	return Object.keys(normalized).length > 0 ? normalized : undefined;
}

function getFirstValidationMessage(errors?: ApiValidationErrors): string | null {
	if (!errors) return null;
	for (const messages of Object.values(errors)) {
		if (messages.length > 0) return messages[0];
	}
	return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}
