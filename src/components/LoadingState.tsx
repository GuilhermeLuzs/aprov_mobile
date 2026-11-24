import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors, space } from '../theme';

type Props = { fill?: boolean };

export function LoadingState({ fill = false }: Props) {
  return (
    <View
      style={[styles.box, fill && styles.fill]}
      accessibilityRole="progressbar"
      accessibilityLabel="Carregando"
    >
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { paddingVertical: space.xxl, alignItems: 'center', justifyContent: 'center' },
  fill: { flex: 1, backgroundColor: colors.bg },
});
