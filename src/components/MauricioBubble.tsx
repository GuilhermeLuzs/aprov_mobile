import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors, radius, space, mauricioVoice } from '../theme';
import type { MauricioSkin } from '../types';
import { MauricioMascot, type MauricioMood } from './MauricioMascot';

const TEXT_FADE_MS = 250;

type Props = {
  text: string;
  mascotSize?: number;
  mood?: MauricioMood;
  skin?: MauricioSkin;
  outlined?: boolean;
};

export function MauricioBubble({ text, mascotSize = 72, mood = 'talking', skin, outlined }: Props) {
  const textOpacity = useSharedValue(1);
  const firstText = useRef(true);
  const fadeIn = useAnimatedStyle(() => ({ opacity: textOpacity.value }));

  useEffect(() => {
    if (firstText.current) {
      firstText.current = false;
      return;
    }
    textOpacity.value = 0;
    textOpacity.value = withTiming(1, { duration: TEXT_FADE_MS });
  }, [text, textOpacity]);

  return (
    <View style={styles.row}>
      <MauricioMascot size={mascotSize} mood={mood} skin={skin} outlined={outlined} />
      <View style={styles.bubble}>
        <View style={styles.tail} />
        <Animated.Text style={[styles.text, fadeIn]}>{text}</Animated.Text>
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
