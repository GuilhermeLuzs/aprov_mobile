import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'aprov.token';

let cachedToken: string | null | undefined;

async function readStored(): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return window.localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function writeStored(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      window.localStorage.setItem(TOKEN_KEY, token);
    } catch {}
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

async function deleteStored(): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      window.localStorage.removeItem(TOKEN_KEY);
    } catch {}
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function getToken(): Promise<string | null> {
  if (cachedToken !== undefined) return cachedToken;
  cachedToken = await readStored();
  return cachedToken;
}

export async function setToken(token: string): Promise<void> {
  cachedToken = token;
  await writeStored(token);
}

export async function clearToken(): Promise<void> {
  cachedToken = null;
  await deleteStored();
}
