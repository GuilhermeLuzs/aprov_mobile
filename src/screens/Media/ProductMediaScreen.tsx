import { useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Volume2, VolumeX, X } from 'lucide-react-native';
import { ZoomableImage } from '../../components';
import { colors, icon, radius, size, space, type } from '../../theme';
import { products } from '../../mocks';
import { slidesOf } from '../../utils/media';
import type { RootStackParamList } from '../../navigation/types';
import { VideoSlide } from './VideoSlide';

type Size = { width: number; height: number };

const noDoubleTap = () => undefined;

export default function ProductMediaScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'ProductMedia'>>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const product = products.find((p) => p.id === route.params.productId);
  const slides = product ? slidesOf(product.media) : [];
  const startIndex = Math.min(route.params.index, Math.max(0, slides.length - 1));

  const [frame, setFrame] = useState<Size | null>(null);
  const [index, setIndex] = useState(startIndex);
  const indexRef = useRef(startIndex);
  const [zoomed, setZoomed] = useState(false);
  const [muted, setMuted] = useState(false);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (!frame || frame.width !== width || frame.height !== height) setFrame({ width, height });
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!frame) return;
    const next = Math.round(e.nativeEvent.contentOffset.x / frame.width);
    if (next !== indexRef.current) {
      indexRef.current = next;
      setIndex(next);
      setZoomed(false);
    }
  };

  const mediaTop = insets.top + space.sm + size.control + space.sm;
  const current = slides[index];

  return (
    <View style={styles.screen} onLayout={onLayout}>
      <StatusBar style="light" />
      {frame && slides.length > 0 ? (
        <FlatList
          data={slides}
          horizontal
          pagingEnabled
          scrollEnabled={!zoomed}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(slide, i) => `${i}-${slide.uri}`}
          initialScrollIndex={startIndex}
          getItemLayout={(_, i) => ({ length: frame.width, offset: frame.width * i, index: i })}
          onScroll={onScroll}
          scrollEventThrottle={16}
          renderItem={({ item, index: slideIndex }) => {
            const height = frame.height - mediaTop - insets.bottom;
            return (
              <View style={{ width: frame.width, height: frame.height, paddingTop: mediaTop }}>
                {item.kind === 'video' ? (
                  <VideoSlide
                    uri={item.uri}
                    width={frame.width}
                    height={height}
                    active={slideIndex === index}
                    muted={muted}
                    onDoubleTap={noDoubleTap}
                  />
                ) : (
                  <ZoomableImage
                    uri={item.uri}
                    width={frame.width}
                    height={height}
                    zoomed={zoomed && slideIndex === index}
                    onZoomChange={setZoomed}
                    onDoubleTap={noDoubleTap}
                    accessibilityLabel={`Mídia ${slideIndex + 1} de ${slides.length}`}
                  />
                )}
              </View>
            );
          }}
        />
      ) : null}

      {frame && slides.length === 0 ? (
        <Text style={styles.missing}>Este item não tem mídias.</Text>
      ) : null}

      <View style={[styles.top, { top: insets.top + space.sm }]} pointerEvents="box-none">
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={space.sm}
          accessibilityRole="button"
          accessibilityLabel="Fechar"
          style={styles.control}
        >
          <X size={icon.size.lg} color={colors.surface} strokeWidth={icon.strokeWidth} />
        </Pressable>
        {slides.length > 1 ? (
          <Text style={styles.counter}>
            {index + 1}/{slides.length}
          </Text>
        ) : null}
        {current?.kind === 'video' ? (
          <Pressable
            onPress={() => setMuted((m) => !m)}
            hitSlop={space.sm}
            accessibilityRole="button"
            accessibilityLabel={muted ? 'Ligar o som' : 'Desligar o som'}
            style={styles.control}
          >
            {muted ? (
              <VolumeX size={icon.size.lg} color={colors.surface} strokeWidth={icon.strokeWidth} />
            ) : (
              <Volume2 size={icon.size.lg} color={colors.surface} strokeWidth={icon.strokeWidth} />
            )}
          </Pressable>
        ) : (
          <View style={styles.spacer} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center', backgroundColor: colors.mediaBackdrop },
  top: {
    position: 'absolute',
    left: space.lg,
    right: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  control: {
    width: size.control,
    height: size.control,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.mediaControl,
  },
  spacer: { width: size.control },
  counter: {
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderRadius: radius.pill,
    overflow: 'hidden',
    backgroundColor: colors.mediaControl,
    fontFamily: type.bodyBold.family,
    fontSize: type.bodyBold.size,
    lineHeight: type.bodyBold.lineHeight,
    color: colors.surface,
  },
  missing: {
    textAlign: 'center',
    paddingHorizontal: space.lg,
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.surface,
  },
});
