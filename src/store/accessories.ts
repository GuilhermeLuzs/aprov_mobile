import { useQuery } from '@tanstack/react-query';
import { apiAccessories, apiBuyAccessory, apiEquipAccessory, type ApiAccessoryState } from '../api';
import { queryClient, queryKeys } from '../queries/client';
import { brandGradient, framePalette } from '../theme';
import type { Accessory, AvatarFrame, MauricioSkin } from '../types';

export type AccessoriesState = {
  ownedIds: string[];
  equippedSkin: MauricioSkin;
  equippedFrameId: string | null;
};

export type AccessoryStatus =
  | { kind: 'equipped' }
  | { kind: 'owned' }
  | { kind: 'buyable' }
  | { kind: 'short'; missing: number }
  | { kind: 'locked'; level: number };

export type AccessoryCatalog = AccessoriesState & { accessories: Accessory[]; points: number; level: number };

const ACCESSORIES_KEY = ['accessories'] as const;
const DEFAULT_SKIN: MauricioSkin = 'mauricio';

const EMPTY_CATALOG: AccessoryCatalog = { accessories: [], ownedIds: [], equippedSkin: DEFAULT_SKIN, equippedFrameId: null, points: 0, level: 1 };

function frameOf(asset: string): AvatarFrame {
  return { colors: asset in framePalette ? [framePalette[asset as keyof typeof framePalette]] : brandGradient };
}

function catalogFromApi(api: ApiAccessoryState): AccessoryCatalog {
  const accessories: Accessory[] = api.accessories.map((item) => {
    const base = { id: item.id, name: item.name, description: item.description, price: item.price, level: item.level };
    return item.kind === 'skin' ? { ...base, kind: 'skin', skin: item.asset as MauricioSkin } : { ...base, kind: 'frame', frame: frameOf(item.asset) };
  });
  const skin = accessories.find((item) => item.id === api.equippedSkinId);
  return {
    accessories,
    ownedIds: api.accessories.filter((item) => item.owned).map((item) => item.id),
    equippedSkin: skin?.kind === 'skin' ? skin.skin : DEFAULT_SKIN,
    equippedFrameId: api.equippedFrameId,
    points: api.points,
    level: api.level,
  };
}

function isEquipped(owned: AccessoriesState, accessory: Accessory): boolean {
  return accessory.kind === 'skin' ? owned.equippedSkin === accessory.skin : owned.equippedFrameId === accessory.id;
}

export function accessoryStatus(owned: AccessoriesState, accessory: Accessory, points: number, level: number): AccessoryStatus {
  if (owned.ownedIds.includes(accessory.id)) {
    return isEquipped(owned, accessory) ? { kind: 'equipped' } : { kind: 'owned' };
  }
  if (level < accessory.level) return { kind: 'locked', level: accessory.level };
  const { price } = accessory;
  return points >= price ? { kind: 'buyable' } : { kind: 'short', missing: price - points };
}

async function apply(action: () => Promise<ApiAccessoryState>): Promise<string | null> {
  try {
    queryClient.setQueryData(ACCESSORIES_KEY, await action());
    void queryClient.invalidateQueries({ queryKey: queryKeys.wallet });
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : 'Não deu para concluir agora. Tente de novo.';
  }
}

export function buyAccessory(accessory: Accessory): Promise<string | null> {
  return apply(() => apiBuyAccessory(accessory.id));
}

export function equipAccessory(accessory: Accessory): Promise<string | null> {
  return apply(() => apiEquipAccessory(accessory.kind, accessory.id));
}

export function useAccessoryCatalog(): AccessoryCatalog {
  const query = useQuery({ queryKey: ACCESSORIES_KEY, queryFn: apiAccessories, select: catalogFromApi });
  return query.data ?? EMPTY_CATALOG;
}

export function useAccessories(): AccessoriesState {
  return useAccessoryCatalog();
}

export function useEquippedSkin(): MauricioSkin {
  return useAccessoryCatalog().equippedSkin;
}

export function useEquippedFrame(): AvatarFrame | undefined {
  const { accessories, equippedFrameId } = useAccessoryCatalog();
  const equipped = accessories.find((item) => item.id === equippedFrameId);
  return equipped?.kind === 'frame' ? equipped.frame : undefined;
}
