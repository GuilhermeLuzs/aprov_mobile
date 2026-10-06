import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { colors, icon as iconToken, radius, size, space, type } from '../theme';

type Props = {
  placeholder: string;
  onPress?: () => void;
  value?: string;
  onChangeText?: (text: string) => void;
  autoFocus?: boolean;
};

export function SearchBar({ placeholder, onPress, value, onChangeText, autoFocus }: Props) {
  const isField = !!onChangeText;

  const inner = (
    <>
      <Search size={iconToken.size.md} color={colors.inkFaint} strokeWidth={iconToken.strokeWidth} />
      {isField ? (
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.inkFaint}
          value={value}
          onChangeText={onChangeText}
          autoFocus={autoFocus}
          returnKeyType="search"
          autoCorrect={false}
        />
      ) : (
        <Text style={styles.placeholder} numberOfLines={1}>
          {placeholder}
        </Text>
      )}
      {isField && value ? (
        <Pressable
          onPress={() => onChangeText?.('')}
          hitSlop={space.sm}
          accessibilityRole="button"
          accessibilityLabel="Limpar busca"
        >
          <X size={iconToken.size.md} color={colors.inkMuted} strokeWidth={iconToken.strokeWidth} />
        </Pressable>
      ) : null}
    </>
  );

  if (isField) {
    return <View style={styles.bar}>{inner}</View>;
  }
  return (
    <Pressable
      style={({ pressed }) => [styles.bar, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="search"
      accessibilityLabel={placeholder}
    >
      {inner}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    minHeight: size.control,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.control,
    backgroundColor: colors.surfaceAlt,
  },
  pressed: { opacity: 0.7 },
  placeholder: {
    flex: 1,
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.inkFaint,
  },
  input: {
    flex: 1,
    paddingVertical: space.sm,
    fontFamily: type.body.family,
    fontSize: type.body.size,
    color: colors.ink,
  },
});
