import { useSyncExternalStore } from 'react';
import { currentUser as testUser, initialWallet, testAccount, users, xpPerLevel } from '../mocks';
import type { User } from '../types';
import { levelProgress } from '../utils/level';
import { onlyDigits } from '../utils/validation';
import { EMPTY_USER_ITEMS, resetUserItems, seededUserItems } from './userItems';
import { EMPTY_WALLET, resetWallet, useWallet } from './wallet';

type StoredAccount = { email: string; cpf: string; password: string; user: User };

export type SignUpData = {
  name: string;
  email: string;
  cpf: string;
  password: string;
};

export type SignUpResult = 'ok' | 'email-in-use' | 'cpf-in-use';

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

function startSession(account: StoredAccount, isNew: boolean): void {
  if (isNew) {
    resetWallet(EMPTY_WALLET);
    resetUserItems(EMPTY_USER_ITEMS);
  } else {
    resetWallet({ ...initialWallet, xp: account.user.xp });
    resetUserItems(seededUserItems());
  }
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

function handleFromEmail(email: string): string {
  const local = normalizeEmail(email).split('@')[0].replace(/[^a-z0-9._]/g, '');
  return `@${local}`;
}

export function signUp(data: SignUpData): SignUpResult {
  if (isEmailInUse(data.email)) return 'email-in-use';
  if (isCpfInUse(data.cpf)) return 'cpf-in-use';
  const user: User = {
    id: `user-${Date.now()}`,
    name: data.name.trim(),
    handle: handleFromEmail(data.email),
    avatarUri: '',
    bio: '',
    level: 1,
    xp: 0,
    xpLevelFloor: 0,
    xpLevelCeiling: xpPerLevel,
    badges: [],
    reviewCount: 0,
    agreementsReceived: 0,
    followerCount: 0,
    followingCount: 0,
    followedByCurrentUser: false,
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
  return users.find((u) => u.id === id) ?? accounts.find((a) => a.user.id === id)?.user;
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
