import { useState, type ReactNode } from 'react';
import { AccessorySheet } from '../../components';
import { accessories, xpPerLevel } from '../../mocks';
import {
  buyAccessory,
  accessoryStatus,
  equipAccessory,
  useAccessories,
  type AccessoryStatus,
} from '../../store/accessories';
import { useCurrentUser } from '../../store/session';
import { useWallet } from '../../store/wallet';
import type { Accessory } from '../../types';
import { levelProgress } from '../../utils/level';

type AccessorySheetControls = {
  statusOf: (accessory: Accessory) => AccessoryStatus;
  openAccessory: (accessoryId: string) => void;
  sheet: ReactNode;
};

export function useAccessorySheet(): AccessorySheetControls {
  const user = useCurrentUser();
  const wallet = useWallet();
  const owned = useAccessories();
  const [openId, setOpenId] = useState<string | null>(null);

  const { level } = levelProgress(wallet.xp, xpPerLevel);
  const statusOf = (accessory: Accessory) => accessoryStatus(owned, accessory, wallet.aprovPoints, level);
  const open = accessories.find((c) => c.id === openId);

  const sheet = open ? (
    <AccessorySheet
      accessory={open}
      status={statusOf(open)}
      user={user}
      onClose={() => setOpenId(null)}
      onBuy={() => buyAccessory(open, level)}
      onEquip={() => equipAccessory(open)}
    />
  ) : null;

  return { statusOf, openAccessory: setOpenId, sheet };
}
