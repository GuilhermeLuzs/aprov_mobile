import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, space, type } from '../theme';
import { Button } from './Button';
import { MauricioMascot } from './MauricioMascot';

type Props = {
  title: string;
  description?: string;
  action?: { label: string; onPress: () => void };
  compact?: boolean;
};

export function EmptyState({ title, description, action, compact = false }: Props) {
  return (
    <View style={[styles.box, compact ? styles.boxCompact : styles.boxFull]}>
      <MauricioMascot size={compact ? 64 : 96} />
      <Text style={[styles.title, compact ? styles.titleCompact : styles.titleFull]}>
        {title}
      </Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {action ? (
        <View style={styles.action}>
          <Button label={action.label} tone="onBrand" onPress={action.onPress} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.primaryBright,
    borderRadius: radius.card,
    alignItems: 'center',
  },
  boxFull: { padding: space.xl },
  boxCompact: { padding: space.lg },
  title: {
    color: colors.surface,
    textAlign: 'center',
    marginTop: space.md,
  },
  titleFull: {
    fontFamily: type.title.family,
    fontSize: type.title.size,
    lineHeight: type.title.lineHeight,
  },
  titleCompact: {
    fontFamily: type.subtitle.family,
    fontSize: type.subtitle.size,
    lineHeight: type.subtitle.lineHeight,
  },
  description: {
    marginTop: space.xs,
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.valueDim,
    textAlign: 'center',
  },
  action: { marginTop: space.lg },
});
