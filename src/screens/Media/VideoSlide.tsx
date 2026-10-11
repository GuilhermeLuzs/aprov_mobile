import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Play } from 'lucide-react-native';
import { colors, icon, radius, size } from '../../theme';

type Props = {
  uri: string;
  width: number;
  height: number;
  active: boolean;
  muted: boolean;
  onDoubleTap: () => void;
};

export function VideoSlide({ uri, width, height, active, muted, onDoubleTap }: Props) {
  const [paused, setPaused] = useState(false);
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
  });

  useEffect(() => {
    if (active && !paused) player.play();
    else player.pause();
  }, [active, paused, player]);

  useEffect(() => {
    if (!active) setPaused(false);
  }, [active]);

  useEffect(() => {
    player.muted = muted;
  }, [muted, player]);

  const togglePaused = () => setPaused((p) => !p);

  const doubleTap = Gesture.Tap().numberOfTaps(2).runOnJS(true).onEnd(onDoubleTap);
  const singleTap = Gesture.Tap().runOnJS(true).onEnd(togglePaused);

  return (
    <GestureDetector gesture={Gesture.Exclusive(doubleTap, singleTap)}>
      <View
        style={{ width, height }}
        accessible
        accessibilityRole="button"
        accessibilityLabel={paused ? 'Continuar vídeo' : 'Pausar vídeo'}
        onAccessibilityTap={togglePaused}
      >
        <VideoView player={player} style={styles.video} contentFit="contain" nativeControls={false} />
        {paused ? (
          <View style={styles.pausedLayer} pointerEvents="none">
            <View style={styles.playCircle}>
              <Play size={icon.size.lg} color={colors.surface} fill={colors.surface} />
            </View>
          </View>
        ) : null}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  video: { flex: 1 },
  pausedLayer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playCircle: {
    width: size.playButton,
    height: size.playButton,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.mediaControl,
  },
});
