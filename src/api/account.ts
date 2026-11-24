import { Platform } from 'react-native';
import type { ApiCustomer } from './auth';
import { apiRequest } from './client';

export async function apiUpdateProfile(profile: { name: string; username: string; bio: string }): Promise<ApiCustomer> {
  return apiRequest('me/profile', { method: 'PATCH', body: profile });
}

export async function apiUploadAvatar(uri: string): Promise<ApiCustomer> {
  const form = new FormData();
  if (Platform.OS === 'web') {
    const blob = await fetch(uri).then((response) => response.blob());
    form.append('avatar', blob, 'avatar.jpg');
  } else {
    form.append('avatar', { uri, name: 'avatar.jpg', type: 'image/jpeg' } as unknown as Blob);
  }
  return apiRequest('me/avatar', { method: 'POST', body: form });
}

export async function apiRemoveAvatar(): Promise<ApiCustomer> {
  return apiRequest('me/avatar', { method: 'DELETE' });
}

export async function apiDeactivate(): Promise<void> {
  await apiRequest('me/deactivate', { method: 'POST' });
}
