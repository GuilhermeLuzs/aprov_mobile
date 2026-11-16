import { useState, type ReactNode } from 'react';
import { AccessorySheet } from '../../components';
import {
  accessoryStatus,
  buyAccessory,
  equipAccessory,
  useAccessoryCatalog,
  type AccessoryStatus,
} from '../../store/accessories';
import { useCurrentUser } from '../../store/session';
import type { Accessory } from '../../types';

type AccessorySheetControls = {
  accessories: Accessory[];
  statusOf: (accessory: Accessory) => AccessoryStatus;
  openAccessory: (accessoryId: string) => void;
  equip: (accessory: Accessory) => void;
  sheet: ReactNode;
};

export function useAccessorySheet(): AccessorySheetControls {
  const user = useCurrentUser();
  const catalog = useAccessoryCatalog();
  const [openId, setOpenId] = useState<string | null>(null);

  const statusOf = (accessory: Accessory) => accessoryStatus(catalog, accessory, catalog.points, catalog.level);
  const open = catalog.accessories.find((item) => item.id === openId);

  const sheet = open ? (
    <AccessorySheet
      accessory={open}
      status={statusOf(open)}
      user={user}
      onClose={() => setOpenId(null)}
      onBuy={() => void buyAccessory(open)}
      onEquip={() => void equipAccessory(open)}
    />
  ) : null;

  return { accessories: catalog.accessories, statusOf, openAccessory: setOpenId, equip: (accessory) => void equipAccessory(accessory), sheet };
}
