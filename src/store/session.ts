import { useSyncExternalStore } from 'react';
import { currentUser as testUser, initialWallet, testAccount, users, xpPerLevel } from '../mocks';
import type { User } from '../types';
import { levelProgress } from '../utils/level';
import { normalizeUsername, onlyDigits } from '../utils/validation';
import { resetFollows } from './follows';
import { EMPTY_USER_ITEMS, resetUserItems, seededUserItems } from './userItems';
import { EMPTY_WALLET, resetWallet, useWallet } from './wallet';

type StoredAccount = { email: string; cpf: string; password: string; user: User };

export type SignUpData = {
  name: string;
  username: string;
  email: string;
  cpf: string;
  password: string;
};

export type SignUpResult = 'ok' | 'email-in-use' | 'cpf-in-use' | 'username-in-use';

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

export function allUsers(): User[] {
  const created = accounts.map((a) => a.user).filter((u) => !users.some((m) => m.id === u.id));
  return [...users, ...created];
}

const handleOf = (username: string) => `@${normalizeUsername(username)}`;

export function isUsernameInUse(username: string): boolean {
  const handle = handleOf(username);
  return allUsers().some((u) => u.handle === handle);
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
  session = account.user;
  emit();
}

export function signIn(email: string, password: string): boolean {
  const account = accounts.find(
    (a) => a.email === normalizeEmail(email) && a.password === password,
  );
  if (!account) return false;
  startSession(account, account.user.id !== testUser.id);
  return true;
}

export function signUp(data: SignUpData): SignUpResult {
  if (isEmailInUse(data.email)) return 'email-in-use';
  if (isCpfInUse(data.cpf)) return 'cpf-in-use';
  if (isUsernameInUse(data.username)) return 'username-in-use';
  const user: User = {
    id: `user-${Date.now()}`,
    name: data.name.trim(),
    handle: handleOf(data.username),
    avatarUri: '',
    bio: '',
    level: 1,
    xp: 0,
    xpLevelFloor: 0,
    xpLevelCeiling: xpPerLevel,
    badges: [],
    reviewCount: 0,
    agreementsReceived: 0,
    joinedAt: new Date().toISOString(),
  };
  const account: StoredAccount = {
    email: normalizeEmail(data.email),
    cpf: onlyDigits(data.cpf),
    password: data.password,
    user,
  };
  accounts.push(account);
  startSession(account, true);
  return 'ok';
}

export function signOut(): void {
  session = null;
  emit();
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
