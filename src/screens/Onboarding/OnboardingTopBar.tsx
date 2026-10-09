import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components';
import { colors, space, type } from '../../theme';

type Props = {
  onBack?: () => void;
  onSkip: () => void;
};

export function OnboardingTopBar({ onBack, onSkip }: Props) {
  const insets = useSafeAreaInsets();
  const top = insets.top + space.xs;

  return (
    <View style={[styles.row, { paddingTop: top }]}>
      <View style={[styles.titleWrap, { top }]} pointerEvents="none">
        <Text style={styles.title}>Personalização</Text>
      </View>
      {onBack ? <Button variant="text" label="Voltar" onPress={onBack} /> : <View />}
      <Button variant="text" label="Pular" onPress={onSkip} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space.sm,
  },
  titleWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: type.bodyBold.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
});
