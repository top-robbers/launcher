import { appDataDir } from '@tauri-apps/api/path';
import { Client, Stronghold } from '@tauri-apps/plugin-stronghold';
import { isTauriRuntime } from '../lib/tauri';
import { logger } from '../lib/logger';

const CLIENT_NAME = 'top-robbers-launcher'; // todo
const TOKEN_KEY = 'auth.access_token'; // todo
const WEB_FALLBACK_TOKEN_KEY = 'top-robbers.auth.access_token'; // todo
const VAULT_PASSWORD = 'top-robbers-launcher-local-vault-v1'; // todo

let cachedStronghold: Stronghold | null = null;
let cachedClient: Client | null = null;

export async function getStoredAccessToken(): Promise<string | null> {
	logger.debug('AuthToken', 'Reading stored access token.', { tauri: isTauriRuntime() });

	if (!isTauriRuntime()) {
		const token = localStorage.getItem(WEB_FALLBACK_TOKEN_KEY);
		logger.debug('AuthToken', 'Browser fallback token read.', { found: Boolean(token) });
		return token;
	}

	const { client } = await getStrongholdClient();
	const store = client.getStore();
	const data = await store.get(TOKEN_KEY);

	if (!data) {
		logger.info('AuthToken', 'No stored Stronghold access token found.');
		return null;
	}

	logger.info('AuthToken', 'Stored Stronghold access token found.');
	return new TextDecoder().decode(new Uint8Array(data));
}

export async function storeAccessToken(token: string): Promise<void> {
	logger.info('AuthToken', 'Storing access token.', { tauri: isTauriRuntime() });

	if (!isTauriRuntime()) {
		localStorage.setItem(WEB_FALLBACK_TOKEN_KEY, token);
		return;
	}

	const { stronghold, client } = await getStrongholdClient();
	const store = client.getStore();
	const data = Array.from(new TextEncoder().encode(token));

	await store.insert(TOKEN_KEY, data);
	await stronghold.save();

	logger.info('AuthToken', 'Access token stored in Stronghold.');
}

export async function clearAccessToken(): Promise<void> {
	logger.info('AuthToken', 'Clearing access token.', { tauri: isTauriRuntime() });

	if (!isTauriRuntime()) {
		localStorage.removeItem(WEB_FALLBACK_TOKEN_KEY);
		return;
	}

	const { stronghold, client } = await getStrongholdClient();
	const store = client.getStore();

	await store.remove(TOKEN_KEY);
	await stronghold.save();

	logger.info('AuthToken', 'Access token cleared from Stronghold.');
}

async function getStrongholdClient(): Promise<{
	stronghold: Stronghold;
	client: Client;
}> {
	if (cachedStronghold && cachedClient) {
		logger.debug('AuthToken', 'Using cached Stronghold client.');
		return {
			stronghold: cachedStronghold,
			client: cachedClient,
		};
	}

	const vaultPath = `${await appDataDir()}top-robbers.vault.hold`;
	logger.debug('AuthToken', 'Loading Stronghold vault.', { vaultPath });

	const stronghold = await Stronghold.load(vaultPath, VAULT_PASSWORD);
	let client: Client;

	try {
		client = await stronghold.loadClient(CLIENT_NAME);
		logger.debug('AuthToken', 'Stronghold client loaded.', { clientName: CLIENT_NAME });
	} catch (error) {
		logger.info('AuthToken', 'Stronghold client does not exist; creating it.', { clientName: CLIENT_NAME, error });
		client = await stronghold.createClient(CLIENT_NAME);
	}

	cachedStronghold = stronghold;
	cachedClient = client;

	return {
		stronghold,
		client,
	};
}
