import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, radius, space, type } from '../theme';
import type { Company } from '../types';
import { SelectableCard } from './SelectableCard';

type Props = {
  company: Company;
  onPress?: () => void;
  selected?: boolean;
};

export function CompanyCard({ company, onPress, selected = false }: Props) {
  const content = (
    <View style={styles.row}>
      <Image
        source={{ uri: company.logoUri }}
        style={styles.logo}
        accessibilityIgnoresInvertColors
      />
      <Text style={styles.name} numberOfLines={2}>
        {company.name}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <SelectableCard
        onPress={onPress}
        selected={selected}
        mode="check"
        accessibilityLabel={company.name}
      >
        {content}
      </SelectableCard>
    );
  }

  return <View style={styles.plain}>{content}</View>;
}

const LOGO = 44;

const styles = StyleSheet.create({
  plain: {
    padding: space.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  logo: {
    width: LOGO,
    height: LOGO,
    borderRadius: radius.control,
    backgroundColor: colors.surfaceAlt,
  },
  name: {
    flex: 1,
    fontFamily: type.bodyBold.family,
    fontSize: type.bodyBold.size,
    lineHeight: type.bodyBold.lineHeight,
    color: colors.ink,
  },
});
