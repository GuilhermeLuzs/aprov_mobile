import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, space, mauricioVoice } from '../theme';
import { MauricioMascot } from './MauricioMascot';

type Props = {
  text: string;
  mascotSize?: number;
};

export function MauricioBubble({ text, mascotSize = 72 }: Props) {
  return (
    <View style={styles.row}>
      <MauricioMascot size={mascotSize} />
      <View style={styles.bubble}>
        <View style={styles.tail} />
        <Text style={styles.text}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space.sm,
  },
  bubble: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: space.md,
  },
  tail: {
    position: 'absolute',
    left: -6,
    bottom: 16,
    width: 12,
    height: 12,
    backgroundColor: colors.surface,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    transform: [{ rotate: '45deg' }],
  },
  text: {
    fontFamily: mauricioVoice.family,
    fontSize: mauricioVoice.size,
    lineHeight: mauricioVoice.lineHeight,
    fontStyle: 'italic',
    color: colors.ink,
  },
});
