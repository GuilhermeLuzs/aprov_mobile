import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { ClipPath, Defs, Path, Rect } from 'react-native-svg';
import { colors, space, type } from '../theme';
import { formatRating } from '../utils/format';

export type StarSize = 'sm' | 'md' | 'lg';

type Props = {
  value: number;
  size?: StarSize;
  max?: number;
  showValue?: boolean;
  onChange?: (value: number) => void;
};

const STAR =
  'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z';
const PX: Record<StarSize, number> = { sm: 14, md: 18, lg: 28 };

let clipCounter = 0;

export function StarRating({ value, size = 'md', max = 5, showValue = false, onChange }: Props) {
  const px = PX[size];
  const [clipId] = useState(() => `star-clip-${clipCounter++}`);

  return (
    <View
      style={styles.row}
      accessibilityRole={onChange ? 'adjustable' : 'image'}
      accessibilityLabel={`${formatRating(value)} de ${max} estrelas`}
    >
      {Array.from({ length: max }, (_, i) => {
        const fraction = Math.max(0, Math.min(1, value - i));
        const star = (
          <Svg width={px} height={px} viewBox="0 0 24 24">
            <Path d={STAR} fill={colors.surfaceAlt} />
            {fraction > 0 ? (
              <>
                <Defs>
                  <ClipPath id={`${clipId}-${i}`}>
                    <Rect x="0" y="0" width={24 * fraction} height="24" />
                  </ClipPath>
                </Defs>
                <Path d={STAR} fill={colors.value} clipPath={`url(#${clipId}-${i})`} />
              </>
            ) : null}
          </Svg>
        );

        if (!onChange) {
          return (
            <View key={i} style={styles.star}>
              {star}
            </View>
          );
        }
        return (
          <Pressable
            key={i}
            hitSlop={10}
            onPress={() => onChange(i + 1)}
            accessibilityRole="button"
            accessibilityLabel={`Dar ${i + 1} ${i === 0 ? 'estrela' : 'estrelas'}`}
            style={styles.star}
          >
            {star}
          </Pressable>
        );
      })}
      {showValue ? <Text style={styles.value}>{formatRating(value)}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  star: { marginRight: 2 },
  value: {
    marginLeft: space.xs,
    fontFamily: type.numeric.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.valueDeep,
  },
});
