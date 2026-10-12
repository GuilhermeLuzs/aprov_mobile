import { useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { Play } from 'lucide-react-native';
import { colors, icon, radius, size, space, type } from '../theme';
import type { Media } from '../types';
import { slidesOf, type MediaSlide } from '../utils/media';

type Props = {
  media: Media[];
  onOpen?: (index: number) => void;
  rounded?: boolean;
  aspectRatio?: number;
};

const SIDE_TAP_FLEX = 3;
const CENTER_TAP_FLEX = 4;
const SINGLE_PHOTO_FALLBACK_RATIO = 4 / 3;

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function SlideContent({ slide }: { slide: MediaSlide }) {
  if (slide.kind === 'photo') {
    return <Image source={{ uri: slide.uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />;
  }
  return (
    <>
      <View style={[StyleSheet.absoluteFill, styles.videoBackdrop]} />
      {slide.thumbnailUri ? (
        <Image
          source={{ uri: slide.thumbnailUri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      ) : null}
      <View style={styles.videoCenter} pointerEvents="none">
        <View style={styles.playCircle}>
          <Play size={icon.size.lg} color={colors.surface} fill={colors.surface} />
        </View>
      </View>
      <View style={styles.durationBadge} pointerEvents="none">
        <Text style={styles.durationText}>{formatDuration(slide.durationSeconds)}</Text>
      </View>
    </>
  );
}

export function MediaCarousel({ media, onOpen, rounded = true, aspectRatio }: Props) {
  const window = useWindowDimensions();
  const [width, setWidth] = useState(window.width - space.lg * 2);
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const listRef = useRef<FlatList>(null);
  const slides = slidesOf(media);
  const frameStyle = [styles.frame, !rounded && styles.flat];

  if (slides.length === 0) return null;

  if (slides.length === 1) {
    const slide = slides[0];
    const ratio =
      aspectRatio ??
      (slide.kind === 'video'
        ? styles.videoRatio.aspectRatio
        : slide.width && slide.height
          ? slide.width / slide.height
          : SINGLE_PHOTO_FALLBACK_RATIO);
    return (
      <Pressable
        style={[frameStyle, { aspectRatio: ratio }]}
        onPress={() => onOpen?.(0)}
        disabled={!onOpen}
        accessibilityRole={onOpen ? 'button' : 'image'}
        accessibilityLabel={slide.kind === 'video' ? 'Vídeo da avaliação' : 'Foto da avaliação'}
      >
        <SlideContent slide={slide} />
      </Pressable>
    );
  }

  const lastIndex = slides.length - 1;

  const showIndex = (next: number) => {
    indexRef.current = next;
    setIndex(next);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width <= 0) return;
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    if (next !== indexRef.current) showIndex(next);
  };

  const goTo = (target: number) => {
    const next = Math.max(0, Math.min(lastIndex, target));
    listRef.current?.scrollToOffset({ offset: next * width, animated: true });
    showIndex(next);
  };

  const step = (delta: number) => goTo(indexRef.current + delta);

  return (
    <View style={frameStyle} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <FlatList
        ref={listRef}
        horizontal
        pagingEnabled
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        data={slides}
        keyExtractor={(slide, i) => `${i}-${slide.uri}`}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        onScroll={onScroll}
        scrollEventThrottle={16}
        extraData={index}
        renderItem={({ item, index: itemIndex }) => (
          <View
            style={[styles.carouselSlide, { width }, aspectRatio ? { aspectRatio } : null]}
            accessible
            accessibilityRole="adjustable"
            accessibilityLabel={`Mídia ${itemIndex + 1} de ${slides.length}${item.kind === 'video' ? ', vídeo' : ''}`}
            accessibilityActions={[
              { name: 'increment' },
              { name: 'decrement' },
              { name: 'activate' },
            ]}
            onAccessibilityAction={(e) => {
              if (e.nativeEvent.actionName === 'activate') onOpen?.(itemIndex);
              else step(e.nativeEvent.actionName === 'increment' ? 1 : -1);
            }}
          >
            <SlideContent slide={item} />
            <View style={styles.tapZones}>
              <Pressable style={styles.sideZone} onPress={() => step(-1)} />
              <Pressable
                style={styles.centerZone}
                onPress={() => onOpen?.(itemIndex)}
                disabled={!onOpen}
              />
              <Pressable style={styles.sideZone} onPress={() => step(1)} />
            </View>
          </View>
        )}
      />

      <View style={styles.dots}>
        {slides.map((_, i) => (
          <Pressable
            key={i}
            onPress={() => goTo(i)}
            hitSlop={space.xs}
            accessibilityRole="button"
            accessibilityLabel={`Ver mídia ${i + 1} de ${slides.length}`}
          >
            <View style={[styles.dot, i === index && styles.dotOn]} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.surfaceAlt,
  },
  flat: { borderRadius: 0 },
  videoRatio: { aspectRatio: 16 / 9 },
  videoBackdrop: { backgroundColor: colors.ink },
  videoCenter: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playCircle: {
    width: size.playButton,
    height: size.playButton,
    borderRadius: radius.pill,
    backgroundColor: colors.scrim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBadge: {
    position: 'absolute',
    right: space.sm,
    bottom: space.sm,
    paddingHorizontal: space.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.scrim,
  },
  durationText: {
    fontFamily: type.numeric.family,
    fontSize: type.micro.size,
    lineHeight: type.micro.lineHeight,
    color: colors.surface,
  },
  carouselSlide: { aspectRatio: 4 / 3, backgroundColor: colors.surfaceAlt },
  tapZones: { ...StyleSheet.absoluteFill, flexDirection: 'row' },
  sideZone: { flex: SIDE_TAP_FLEX },
  centerZone: { flex: CENTER_TAP_FLEX },
  dots: {
    position: 'absolute',
    bottom: space.sm,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: space.xs,
  },
  dot: {
    width: size.dot,
    height: size.dot,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    opacity: 0.6,
  },
  dotOn: { backgroundColor: colors.surface, opacity: 1 },
});
