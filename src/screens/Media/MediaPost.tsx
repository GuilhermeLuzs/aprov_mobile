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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronDown,
  ChevronUp,
  Flag,
  MessageCircle,
  ThumbsDown,
  ThumbsUp,
  Volume2,
  VolumeX,
  type LucideIcon,
} from 'lucide-react-native';
import { Avatar, Chip, StarRating, ZoomableImage, type VoteState } from '../../components';
import { colors, icon, radius, size, space, type } from '../../theme';
import type { Company, Product, Review, User } from '../../types';
import { formatInt, formatRating } from '../../utils/format';
import type { MediaSlide } from '../../utils/media';
import { AgreeBurst } from './AgreeBurst';
import { VideoSlide } from './VideoSlide';

const COMMENT_PREVIEW_LENGTH = 110;
const MAX_VISIBLE_TAGS = 3;

type Props = {
  review: Review;
  author: User | undefined;
  product: Product | undefined;
  company: Company | undefined;
  slides: MediaSlide[];
  width: number;
  height: number;
  active: boolean;
  startIndex: number;
  zoomed: boolean;
  onZoomChange: (zoomed: boolean) => void;
  muted: boolean;
  onToggleMuted: () => void;
  vote: VoteState;
  onVote?: (choice: 'agree' | 'disagree') => void;
  onOpenComments: () => void;
  onOpenAuthor: () => void;
  onOpenDetails: () => void;
  onOpenProduct: () => void;
  infoCollapsed: boolean;
  onToggleInfo: () => void;
  onReport?: () => void;
};

export function MediaPost({
  review,
  author,
  product,
  company,
  slides,
  width,
  height,
  active,
  startIndex,
  zoomed,
  onZoomChange,
  muted,
  onToggleMuted,
  vote,
  onVote,
  onOpenComments,
  onOpenAuthor,
  onOpenDetails,
  onOpenProduct,
  infoCollapsed,
  onToggleInfo,
  onReport,
}: Props) {
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(startIndex);
  const indexRef = useRef(startIndex);
  const [infoHeight, setInfoHeight] = useState(0);

  const mediaTop = insets.top + space.sm + size.control + space.sm;
  const mediaHeight = Math.max(0, height - mediaTop - infoHeight);

  const onInfoLayout = (e: LayoutChangeEvent) => setInfoHeight(e.nativeEvent.layout.height);

  const [burst, setBurst] = useState(0);

  const agreeByDoubleTap = () => {
    if (!onVote) return;
    if (vote !== 'agree') onVote('agree');
    setBurst((n) => n + 1);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    if (next !== indexRef.current) {
      indexRef.current = next;
      setIndex(next);
    }
  };

  const current = slides[index];
  const comment = review.comment.trim();
  const preview =
    comment.length > COMMENT_PREVIEW_LENGTH
      ? `${comment.slice(0, COMMENT_PREVIEW_LENGTH).trimEnd()}…`
      : comment;
  const tags = [
    ...review.positiveTags.map((t) => ({ id: t.id, label: t.label, variant: 'positive' as const })),
    ...review.negativeTags.map((t) => ({ id: t.id, label: t.label, variant: 'negative' as const })),
  ];
  const visibleTags = tags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenTagCount = tags.length - visibleTags.length;

  return (
    <View style={{ width, height }}>
      <FlatList
        data={slides}
        horizontal
        pagingEnabled
        scrollEnabled={!zoomed}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(slide, i) => `${i}-${slide.uri}`}
        initialScrollIndex={startIndex}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item, index: slideIndex }) => (
          <View style={{ width, height, paddingTop: mediaTop }}>
            {item.kind === 'video' ? (
              <VideoSlide
                uri={item.uri}
                width={width}
                height={mediaHeight}
                active={active && slideIndex === index}
                muted={muted}
                onDoubleTap={agreeByDoubleTap}
              />
            ) : (
              <ZoomableImage
                uri={item.uri}
                width={width}
                height={mediaHeight}
                zoomed={zoomed && active && slideIndex === index}
                onZoomChange={onZoomChange}
                onDoubleTap={agreeByDoubleTap}
                accessibilityLabel={`Mídia ${slideIndex + 1} de ${slides.length}`}
              />
            )}
          </View>
        )}
        extraData={mediaHeight}
      />

      <View style={[styles.burst, { top: mediaTop, height: mediaHeight }]} pointerEvents="none">
        <AgreeBurst trigger={burst} />
      </View>

      <View style={[styles.top, { top: insets.top + space.sm }]} pointerEvents="box-none">
        {slides.length > 1 ? (
          <Text style={styles.counter}>
            {index + 1}/{slides.length}
          </Text>
        ) : null}
        {current?.kind === 'video' ? (
          <Pressable
            onPress={onToggleMuted}
            hitSlop={space.sm}
            accessibilityRole="button"
            accessibilityLabel={muted ? 'Ligar o som' : 'Desligar o som'}
            style={styles.muteButton}
          >
            {muted ? (
              <VolumeX size={icon.size.lg} color={colors.surface} strokeWidth={icon.strokeWidth} />
            ) : (
              <Volume2 size={icon.size.lg} color={colors.surface} strokeWidth={icon.strokeWidth} />
            )}
          </Pressable>
        ) : null}
      </View>

      <View style={styles.bottom} pointerEvents="box-none">
        <View style={styles.rail}>
          <RailButton
            Icon={ThumbsUp}
            count={review.agreements}
            active={vote === 'agree'}
            activeColor={colors.agree}
            label={vote === 'agree' ? 'Desfazer concordância' : 'Concordar'}
            onPress={onVote && (() => onVote('agree'))}
          />
          <RailButton
            Icon={ThumbsDown}
            count={review.disagreements}
            active={vote === 'disagree'}
            activeColor={colors.disagree}
            label={vote === 'disagree' ? 'Desfazer discordância' : 'Discordar'}
            onPress={onVote && (() => onVote('disagree'))}
          />
          <RailButton
            Icon={MessageCircle}
            count={review.commentCount}
            active={false}
            activeColor={colors.surface}
            label="Ver comentários"
            onPress={onOpenComments}
          />
          {onReport ? (
            <RailButton
              Icon={Flag}
              active={false}
              activeColor={colors.surface}
              label="Denunciar avaliação"
              onPress={onReport}
            />
          ) : null}
        </View>

        <View
          style={[styles.info, { paddingBottom: insets.bottom + space.lg }]}
          onLayout={onInfoLayout}
        >
          <View style={styles.authorLine}>
            <Pressable
              style={styles.authorRow}
              onPress={onOpenAuthor}
              accessibilityRole="link"
              accessibilityLabel={`Ver perfil de ${author?.name ?? 'Usuário'}`}
            >
              <Avatar
                uri={author?.avatarUri ?? ''}
                name={author?.name ?? 'Usuário'}
                size="sm"
                bordered
              />
              <Text style={styles.authorName} numberOfLines={1}>
                {author?.name ?? 'Usuário'}
              </Text>
              <Text style={styles.muted} numberOfLines={1}>
                Nível {author?.level ?? 1}
              </Text>
            </Pressable>
            <Pressable
              onPress={onToggleInfo}
              hitSlop={space.sm}
              accessibilityRole="button"
              accessibilityLabel={infoCollapsed ? 'Mostrar detalhes' : 'Recolher detalhes'}
              style={styles.toggle}
            >
              {infoCollapsed ? (
                <ChevronUp
                  size={icon.size.lg}
                  color={colors.surface}
                  strokeWidth={icon.strokeWidth}
                />
              ) : (
                <ChevronDown
                  size={icon.size.lg}
                  color={colors.surface}
                  strokeWidth={icon.strokeWidth}
                />
              )}
            </Pressable>
          </View>

          <View style={styles.ratingRow}>
            <StarRating value={review.averageRating} size="lg" />
            <Text style={styles.ratingValue}>{formatRating(review.averageRating)}</Text>
          </View>

          {infoCollapsed ? null : (
            <>
              <Pressable
                onPress={onOpenProduct}
                disabled={!product}
                accessibilityRole="link"
                accessibilityLabel={`Abrir ${product?.title ?? 'item'}`}
              >
                <Text style={styles.productText} numberOfLines={1}>
                  <Text style={styles.strong}>{product?.title ?? 'Item'}</Text>
                  {company ? ` · ${company.name}` : ''}
                </Text>
              </Pressable>

              {tags.length > 0 ? (
                <View style={styles.tags}>
                  {visibleTags.map((tag) => (
                    <Chip key={tag.id} label={tag.label} variant={tag.variant} size="sm" />
                  ))}
                  {hiddenTagCount > 0 ? <Chip label={`+${hiddenTagCount}`} size="sm" /> : null}
                </View>
              ) : null}

              <Text style={styles.comment}>
                {preview}
                {preview !== '' ? ' ' : ''}
                <Text style={styles.details} onPress={onOpenDetails} accessibilityRole="link">
                  Ver detalhes
                </Text>
              </Text>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

function RailButton({
  Icon,
  count,
  active,
  activeColor,
  label,
  onPress,
}: {
  Icon: LucideIcon;
  count?: number;
  active: boolean;
  activeColor: string;
  label: string;
  onPress?: () => void;
}) {
  const tint = active ? activeColor : colors.surface;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      hitSlop={space.xs}
      accessibilityRole="button"
      accessibilityLabel={count === undefined ? label : `${label}, ${formatInt(count)}`}
      accessibilityState={{ disabled: !onPress, selected: active }}
      style={styles.railItem}
    >
      <Icon
        size={icon.size.lg}
        color={tint}
        fill={active ? tint : 'transparent'}
        strokeWidth={icon.strokeWidth}
      />
      {count === undefined ? null : <Text style={styles.railCount}>{formatInt(count)}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  burst: { position: 'absolute', left: 0, right: 0 },
  top: {
    position: 'absolute',
    left: space.lg + size.control + space.sm,
    right: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: size.control,
  },
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
  muteButton: {
    marginLeft: 'auto',
    width: size.control,
    height: size.control,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.mediaControl,
  },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    gap: space.lg,
  },
  rail: {
    alignSelf: 'flex-end',
    marginRight: space.lg,
    gap: space.md,
    alignItems: 'center',
  },
  railItem: {
    width: size.control,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    alignItems: 'center',
    gap: space.xs,
    backgroundColor: colors.mediaControl,
  },
  railCount: {
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.surface,
  },
  info: {
    gap: space.sm,
    paddingTop: space.md,
    paddingHorizontal: space.lg,
    backgroundColor: colors.mediaControl,
  },
  authorLine: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  authorRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.sm },
  toggle: {
    width: size.control,
    height: size.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorName: {
    flexShrink: 1,
    fontFamily: type.bodyBold.family,
    fontSize: type.bodyBold.size,
    lineHeight: type.bodyBold.lineHeight,
    color: colors.surface,
  },
  muted: {
    flexShrink: 0,
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.surface,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  ratingValue: {
    fontFamily: type.numeric.family,
    fontSize: type.title.size,
    lineHeight: type.title.lineHeight,
    color: colors.surface,
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  details: {
    fontFamily: type.bodyBold.family,
    color: colors.primaryBright,
  },
  productText: {
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.surface,
  },
  strong: {
    fontFamily: type.bodyBold.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.surface,
  },
  comment: {
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.surface,
  },
});
