import type { StyleProp, ViewStyle } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { colors } from '../theme';

type Props = {
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function MauricioMascot({ size = 96, style }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" style={style} accessibilityRole="image">
      <Line x1="50" y1="16" x2="50" y2="8" stroke={colors.botJoint} strokeWidth={3} strokeLinecap="round" />
      <Circle cx="50" cy="7" r="3.5" fill={colors.value} />
      <Rect x="16" y="30" width="7" height="18" rx="3.5" fill={colors.botJoint} />
      <Rect x="77" y="30" width="7" height="18" rx="3.5" fill={colors.botJoint} />
      <Rect x="22" y="16" width="56" height="44" rx="14" fill={colors.botBody} />
      <Rect x="29" y="24" width="42" height="28" rx="9" fill={colors.botScreen} />
      <Circle cx="42" cy="38" r="4.2" fill={colors.botEye} />
      <Circle cx="58" cy="38" r="4.2" fill={colors.botEye} />
      <Rect x="43" y="60" width="14" height="7" fill={colors.botJoint} />
      <Rect x="25" y="66" width="50" height="30" rx="13" fill={colors.botBody} />
      <Rect x="25" y="70" width="9" height="15" rx="3" fill={colors.primaryBright} />
      <Rect x="66" y="70" width="9" height="15" rx="3" fill={colors.primaryBright} />
      <Path
        d="M50 71 L52.4 76.8 L58.6 77.2 L53.8 81.2 L55.3 87.3 L50 84 L44.7 87.3 L46.2 81.2 L41.4 77.2 L47.6 76.8 Z"
        fill={colors.value}
      />
    </Svg>
  );
}
