import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

const MIN_SCALE = 1;
const MAX_SCALE = 4;

type Props = {
  uri: string;
  width: number;
  height: number;
  zoomed: boolean;
  onZoomChange: (zoomed: boolean) => void;
  onDoubleTap: () => void;
  accessibilityLabel: string;
};

export function ZoomableImage({
  uri,
  width,
  height,
  zoomed,
  onZoomChange,
  onDoubleTap,
  accessibilityLabel,
}: Props) {
  const scale = useSharedValue(MIN_SCALE);
  const savedScale = useSharedValue(MIN_SCALE);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);

  const clampTranslation = (value: number, currentScale: number, extent: number) => {
    'worklet';
    const limit = ((currentScale - 1) * extent) / 2;
    return Math.min(limit, Math.max(-limit, value));
  };

  const reset = () => {
    'worklet';
    scale.value = withTiming(MIN_SCALE);
    savedScale.value = MIN_SCALE;
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    savedX.value = 0;
    savedY.value = 0;
    scheduleOnRN(onZoomChange, false);
  };

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.min(MAX_SCALE, Math.max(MIN_SCALE, savedScale.value * e.scale));
    })
    .onEnd(() => {
      if (scale.value <= MIN_SCALE) {
        reset();
        return;
      }
      savedScale.value = scale.value;
      const x = clampTranslation(translateX.value, scale.value, width);
      const y = clampTranslation(translateY.value, scale.value, height);
      translateX.value = withTiming(x);
      translateY.value = withTiming(y);
      savedX.value = x;
      savedY.value = y;
      scheduleOnRN(onZoomChange, true);
    });

  const pan = Gesture.Pan()
    .enabled(zoomed)
    .onUpdate((e) => {
      translateX.value = clampTranslation(savedX.value + e.translationX, scale.value, width);
      translateY.value = clampTranslation(savedY.value + e.translationY, scale.value, height);
    })
    .onEnd(() => {
      savedX.value = translateX.value;
      savedY.value = translateY.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      scheduleOnRN(onDoubleTap);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={Gesture.Simultaneous(pinch, pan, doubleTap)}>
      <Animated.View style={[styles.frame, { width, height }]}>
        <Animated.Image
          source={{ uri }}
          style={[styles.image, animatedStyle]}
          resizeMode="contain"
          accessible
          accessibilityRole="image"
          accessibilityLabel={accessibilityLabel}
        />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
});
