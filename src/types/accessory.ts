export type MauricioSkin =
  | 'mauricio'
  | 'cow'
  | 'dino'
  | 'mar'
  | 'monk'
  | 'ninja'
  | 'pedra'
  | 'snow'
  | 'vamp';

export type AvatarFrame = { colors: readonly string[] };

type AccessoryBase = {
  id: string;
  name: string;
  description: string;
  price: number;
  level: number;
};

export type SkinAccessory = AccessoryBase & { kind: 'skin'; skin: MauricioSkin };
export type FrameAccessory = AccessoryBase & { kind: 'frame'; frame: AvatarFrame };

export type Accessory = SkinAccessory | FrameAccessory;
export type AccessoryKind = Accessory['kind'];

export const ACCESSORY_KIND_LABEL: Record<AccessoryKind, string> = {
  skin: 'Skins do Maurício',
  frame: 'Molduras',
};
