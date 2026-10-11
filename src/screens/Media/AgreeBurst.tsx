import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { ThumbsUp } from 'lucide-react-native';
import { colors, radius, size } from '../../theme';

const START_SCALE = 0.6;
const PEAK_SCALE = 1.2;
const HALO_START_SCALE = 0.4;
const HALO_PEAK_SCALE = 1.15;
const SETTLE_MS = 150;
const HOLD_MS = 450;
const FADE_MS = 250;

type Props = {
  trigger: number;
};

export function AgreeBurst({ trigger }: Props) {
  const scale = useSharedValue(START_SCALE);
  const haloScale = useSharedValue(HALO_START_SCALE);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (trigger === 0) return;
    scale.value = START_SCALE;
    haloScale.value = HALO_START_SCALE;
    opacity.value = 1;
    scale.value = withSequence(withSpring(PEAK_SCALE), withTiming(1, { duration: SETTLE_MS }));
    haloScale.value = withSequence(
      withSpring(HALO_PEAK_SCALE),
      withTiming(1, { duration: SETTLE_MS }),
    );
    opacity.value = withDelay(HOLD_MS, withTiming(0, { duration: FADE_MS }));
  }, [trigger, scale, haloScale, opacity]);

  const iconStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const haloStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: haloScale.value }],
  }));

  return (
    <Animated.View style={styles.center} pointerEvents="none">
      <Animated.View style={[styles.halo, haloStyle]} />
      <Animated.View style={iconStyle}>
        <ThumbsUp size={size.agreeBurst} color={colors.agree} fill={colors.agree} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: size.agreeHalo,
    height: size.agreeHalo,
    borderRadius: radius.pill,
    backgroundColor: colors.agreeHalo,
  },
});
