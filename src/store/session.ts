import { useSyncExternalStore } from 'react';
import { ApiError, NetworkError, apiLogin, apiLogout, apiRegister, type ApiClient } from '../api';
import { currentUser as testUser, initialWallet, testAccount, users, xpPerLevel } from '../mocks';
import type { User } from '../types';
import { levelProgress } from '../utils/level';
import { normalizeUsername, onlyDigits } from '../utils/validation';
import { getDeactivatedIds, markDeactivated } from './deactivated';
import { dropDeactivatedFollows, resetFollows } from './follows';
import { resetPreferences } from './preferences';
import { EMPTY_USER_ITEMS, resetUserItems, seededUserItems } from './userItems';
import { EMPTY_WALLET, resetWallet, useWallet } from './wallet';

type StoredAccount = { email: string; cpf: string; password: string; user: User };

export type SignUpData = {
  name: string;
  username: string;
  email: string;
  birthDate: string;
  cpf: string;
  password: string;
};

export type SignUpResult = 'ok' | 'email-in-use' | 'cpf-in-use' | 'username-in-use' | 'error';

export type SignInResult = 'ok' | 'invalid' | 'deactivated' | 'network-error';

function toIsoDate(brDate: string): string {
  const [day, month, year] = brDate.split('/');
  return `${year}-${month}-${day}`;
}

export type ProfileChanges = {
  name: string;
  username: string;
  bio: string;
  avatarUri: string;
};

export type ProfileUpdateResult = 'ok' | 'username-in-use';

const accounts: StoredAccount[] = [
  {
    email: testAccount.email,
    cpf: onlyDigits(testAccount.cpf),
    password: testAccount.password,
    user: testUser,
  },
];

let session: User | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export function isEmailInUse(email: string): boolean {
  return accounts.some((a) => a.email === normalizeEmail(email));
}

export function isCpfInUse(cpf: string): boolean {
  return accounts.some((a) => a.cpf === onlyDigits(cpf));
}

function everyUser(): User[] {
  const fromMocks = users.map((u) => accounts.find((a) => a.user.id === u.id)?.user ?? u);
  const created = accounts.map((a) => a.user).filter((u) => !users.some((m) => m.id === u.id));
  return [...fromMocks, ...created];
}

export function allUsers(): User[] {
  const hidden = getDeactivatedIds();
  return everyUser().filter((u) => !hidden.includes(u.id));
}

const handleOf = (username: string) => `@${normalizeUsername(username)}`;

export function isUsernameInUse(username: string, exceptUserId?: string): boolean {
  const handle = handleOf(username);
  return everyUser().some((u) => u.handle === handle && u.id !== exceptUserId);
}

function startSession(account: StoredAccount, isNew: boolean): void {
  if (isNew) {
    resetWallet(EMPTY_WALLET);
    resetUserItems(EMPTY_USER_ITEMS);
  } else {
    resetWallet({ ...initialWallet, xp: account.user.xp });
    resetUserItems(seededUserItems());
  }
  resetFollows();
  resetPreferences();
  session = account.user;
  emit();
}

function userFromApiClient(client: ApiClient): User {
  if (client.username === normalizeUsername(testUser.handle)) {
    return accounts.find((a) => a.user.id === testUser.id)?.user ?? testUser;
  }
  const id = `client-${client.id}`;
  const existing = accounts.find((a) => a.user.id === id)?.user;
  return {
    id,
    name: client.name,
    handle: handleOf(client.username),
    avatarUri: existing?.avatarUri ?? '',
    bio: existing?.bio ?? '',
    level: 1,
    xp: existing?.xp ?? 0,
    xpLevelFloor: 0,
    xpLevelCeiling: xpPerLevel,
    badges: existing?.badges ?? [],
    reviewCount: existing?.reviewCount ?? 0,
    agreementsReceived: existing?.agreementsReceived ?? 0,
    joinedAt: client.createdAt,
  };
}

function rememberAccount(email: string, cpf: string, password: string, user: User): StoredAccount {
  const account: StoredAccount = { email: normalizeEmail(email), cpf: onlyDigits(cpf), password, user };
  const index = accounts.findIndex((a) => a.user.id === user.id);
  if (index >= 0) accounts[index] = account;
  else accounts.push(account);
  return account;
}

export async function signIn(email: string, password: string): Promise<SignInResult> {
  let client: ApiClient;
  try {
    client = await apiLogin(email, password);
  } catch (error) {
    if (error instanceof NetworkError) return 'network-error';
    return 'invalid';
  }
  const user = userFromApiClient(client);
  if (getDeactivatedIds().includes(user.id)) return 'deactivated';
  const account = rememberAccount(email, '', password, user);
  startSession(account, false);
  return 'ok';
}

export async function signUp(data: SignUpData): Promise<SignUpResult> {
  if (isEmailInUse(data.email)) return 'email-in-use';
  if (isCpfInUse(data.cpf)) return 'cpf-in-use';
  if (isUsernameInUse(data.username)) return 'username-in-use';
  let client: ApiClient;
  try {
    client = await apiRegister({
      name: data.name.trim(),
      username: normalizeUsername(data.username),
      email: data.email,
      birthDate: toIsoDate(data.birthDate),
      cpf: onlyDigits(data.cpf),
      password: data.password,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.errors.email) return 'email-in-use';
      if (error.errors.cpf) return 'cpf-in-use';
      if (error.errors.username) return 'username-in-use';
    }
    return 'error';
  }
  const user = userFromApiClient(client);
  const account = rememberAccount(data.email, data.cpf, data.password, user);
  startSession(account, true);
  return 'ok';
}

export function updateProfile(changes: ProfileChanges): ProfileUpdateResult {
  const account = accounts.find((a) => a.user.id === session?.id);
  if (!account) return 'ok';
  if (isUsernameInUse(changes.username, account.user.id)) return 'username-in-use';
  account.user = {
    ...account.user,
    name: changes.name.trim(),
    handle: handleOf(changes.username),
    bio: changes.bio.trim(),
    avatarUri: changes.avatarUri,
  };
  session = account.user;
  emit();
  return 'ok';
}

export function signOut(): void {
  apiLogout().catch(() => undefined);
  session = null;
  emit();
}

export function deactivateAccount(): void {
  if (!session) return;
  markDeactivated(session.id);
  dropDeactivatedFollows();
  signOut();
}

export function findUser(id: string): User | undefined {
  return allUsers().find((u) => u.id === id);
}

function getSession(): User | null {
  return session;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSession(): User | null {
  return useSyncExternalStore(subscribe, getSession, getSession);
}

export function useCurrentUser(): User {
  const user = useSession() ?? testUser;
  const { xp } = useWallet();
  const { level } = levelProgress(xp, xpPerLevel);
  return { ...user, xp, level };
}
