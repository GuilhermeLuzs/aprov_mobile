import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, icon, radius, size, space, type } from '../theme';

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
};

export function Checkbox({ checked, onChange, label }: Props) {
  return (
    <Pressable
      style={styles.row}
      onPress={() => onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
    >
      <View style={[styles.box, checked ? styles.boxOn : styles.boxOff]}>
        {checked ? <Check size={icon.size.sm} color={colors.surface} strokeWidth={3} /> : null}
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.sm,
    minHeight: size.control,
    paddingVertical: space.sm,
  },
  box: {
    width: size.checkbox,
    height: size.checkbox,
    borderRadius: radius.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOff: { borderWidth: 2, borderColor: colors.inkFaint },
  boxOn: { backgroundColor: colors.primary },
  label: {
    flex: 1,
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.ink,
  },
});
