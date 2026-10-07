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

type Props = {
  media: Media;
  onExpand?: (mediaId: string) => void;
  onPlay?: () => void;
};

const SIDE_TAP_FLEX = 3;
const CENTER_TAP_FLEX = 4;

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function ReviewMedia({ media, onExpand, onPlay }: Props) {
  const window = useWindowDimensions();
  const [width, setWidth] = useState(window.width - space.lg * 2);
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const listRef = useRef<FlatList>(null);

  if (media.type === 'photo') {
    const ratio = media.width && media.height ? media.width / media.height : 4 / 3;
    return (
      <Pressable
        style={styles.frame}
        onPress={() => onExpand?.(media.id)}
        disabled={!onExpand}
        accessibilityRole={onExpand ? 'button' : 'image'}
        accessibilityLabel="Foto da avaliação"
      >
        <Image source={{ uri: media.uri }} style={[styles.full, { aspectRatio: ratio }]} resizeMode="cover" />
      </Pressable>
    );
  }

  if (media.type === 'video') {
    return (
      <Pressable
        style={styles.frame}
        onPress={onPlay}
        disabled={!onPlay}
        accessibilityRole={onPlay ? 'button' : 'image'}
        accessibilityLabel="Vídeo da avaliação"
      >
        <View style={[styles.full, styles.videoFrame]}>
          {media.thumbnailUri ? (
            <Image source={{ uri: media.thumbnailUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : null}
          <View style={styles.playCircle}>
            <Play size={icon.size.lg} color={colors.surface} fill={colors.surface} />
          </View>
        </View>
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{formatDuration(media.durationSeconds)}</Text>
        </View>
      </Pressable>
    );
  }

  const lastIndex = media.items.length - 1;

  const showIndex = (next: number) => {
    indexRef.current = next;
    setIndex(next);
  };

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width > 0) showIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const goTo = (target: number) => {
    const next = Math.max(0, Math.min(lastIndex, target));
    listRef.current?.scrollToOffset({ offset: next * width, animated: true });
    showIndex(next);
  };

  const step = (delta: number) => goTo(indexRef.current + delta);

  return (
    <View style={styles.frame} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <FlatList
        ref={listRef}
        horizontal
        pagingEnabled
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        data={media.items}
        keyExtractor={(_, i) => String(i)}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        onMomentumScrollEnd={onScrollEnd}
        extraData={index}
        renderItem={({ item, index: itemIndex }) => (
          <View
            style={[styles.carouselImage, { width }]}
            accessible
            accessibilityRole="adjustable"
            accessibilityLabel={`Mídia ${itemIndex + 1} de ${media.items.length}`}
            accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
            onAccessibilityAction={(e) => step(e.nativeEvent.actionName === 'increment' ? 1 : -1)}
          >
            <Image source={{ uri: item.uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            <View style={styles.tapZones}>
              <Pressable style={styles.sideZone} onPress={() => step(-1)} />
              <Pressable
                style={styles.centerZone}
                onPress={() => onExpand?.(media.id)}
                disabled={!onExpand}
              />
              <Pressable style={styles.sideZone} onPress={() => step(1)} />
            </View>
          </View>
        )}
      />

      <View style={styles.dots}>
        {media.items.map((_, i) => (
          <Pressable
            key={i}
            onPress={() => goTo(i)}
            hitSlop={space.xs}
            accessibilityRole="button"
            accessibilityLabel={`Ver mídia ${i + 1} de ${media.items.length}`}
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
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.surfaceAlt,
  },
  full: { width: '100%' },
  videoFrame: {
    aspectRatio: 16 / 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ink,
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
  carouselImage: { aspectRatio: 4 / 3, backgroundColor: colors.surfaceAlt },
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
