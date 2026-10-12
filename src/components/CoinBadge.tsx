import { StyleSheet, View } from 'react-native';
import {
  BookOpen,
  Coffee,
  Coins,
  Cpu,
  Eye,
  Flame,
  Gem,
  GraduationCap,
  Hammer,
  Heart,
  HeartPulse,
  Leaf,
  PawPrint,
  Snowflake,
  Sparkles,
  Star,
  Utensils,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';
import { colors, icon, radius, size } from '../theme';
import type { CoinIcon } from '../types';

export const COIN_ICON: Record<CoinIcon, LucideIcon> = {
  coins: Coins,
  cpu: Cpu,
  utensils: Utensils,
  sparkles: Sparkles,
  snowflake: Snowflake,
  coffee: Coffee,
  eye: Eye,
  'paw-print': PawPrint,
  'book-open': BookOpen,
  hammer: Hammer,
  'heart-pulse': HeartPulse,
  zap: Zap,
  'graduation-cap': GraduationCap,
  star: Star,
  heart: Heart,
  leaf: Leaf,
  gem: Gem,
  flame: Flame,
};

export type CoinBadgeSize = keyof typeof size.coinBadge;

type Props = {
  icon: CoinIcon;
  color: string;
  size?: CoinBadgeSize;
};

export function CoinBadge({ icon: iconKey, color, size: badgeSize = 'md' }: Props) {
  const Icon = COIN_ICON[iconKey];
  const { box, icon: iconPx } = size.coinBadge[badgeSize];

  return (
    <View
      style={[styles.badge, { width: box, height: box, backgroundColor: color }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Icon size={iconPx} color={colors.surface} strokeWidth={icon.strokeWidth} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
