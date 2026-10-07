import { StyleSheet, Text, View } from 'react-native';
import { colors, space, type } from '../../../theme';

type Props = {
  title: string;
  bonus?: string;
  hint?: string;
};

export function StepHeading({ title, bonus, hint }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.title}>{title}</Text>
        {bonus ? <Text style={styles.bonus}>{bonus}</Text> : null}
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
  },
  title: {
    flex: 1,
    fontFamily: type.title.family,
    fontSize: type.title.size,
    lineHeight: type.title.lineHeight,
    color: colors.ink,
  },
  bonus: {
    fontFamily: type.numeric.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.valueDeep,
  },
  hint: {
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
});
