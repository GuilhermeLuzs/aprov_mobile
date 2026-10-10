import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, space, type } from '../theme';
import type { Company, Product, Review, User } from '../types';
import { formatRelativeTime } from '../utils/date';
import { Avatar } from './Avatar';
import { Chip } from './Chip';
import { ReviewMedia } from './ReviewMedia';
import { StarRating } from './StarRating';
import { VoteBar, type VoteState } from './VoteBar';

type Props = {
  review: Review;
  author: User;
  product: Product;
  company: Company;
  showProduct?: boolean;
  showAuthor?: boolean;
  highlight?: string;
  vote?: VoteState;
  onVote?: (choice: 'agree' | 'disagree') => void;
  onPressBody?: () => void;
  onOpenPhoto?: (mediaId: string) => void;
  onOpenVideo?: () => void;
};

export function ReviewPost({
  review,
  author,
  product,
  company,
  showProduct = true,
  showAuthor = true,
  highlight,
  vote = null,
  onVote,
  onPressBody,
  onOpenPhoto,
  onOpenVideo,
}: Props) {
  const media = review.media[0];
  const hasTags = review.positiveTags.length + review.negativeTags.length > 0;
  const comment = review.comment.trim();

  return (
    <View style={styles.post}>
      {showAuthor ? (
        <View style={styles.header}>
          <Avatar uri={author.avatarUri} name={author.name} size="md" bordered />
          <View style={styles.headerText}>
            <Text style={styles.name} numberOfLines={1}>
              {author.name}
            </Text>
            <Text style={styles.sub}>
              Nível {author.level} · {formatRelativeTime(review.createdAt)}
            </Text>
          </View>
          {highlight ? <Chip label={highlight} size="sm" selected /> : null}
        </View>
      ) : null}

      <View style={styles.context}>
        {showProduct ? (
          <Text style={styles.contextText} numberOfLines={2}>
            avaliou <Text style={styles.contextStrong}>{product.title}</Text> · {company.name}
          </Text>
        ) : null}
        <StarRating value={review.averageRating} size="sm" showValue />
      </View>

      {media ? <ReviewMedia media={media} onExpand={onOpenPhoto} onPlay={onOpenVideo} /> : null}

      <Pressable
        onPress={onPressBody}
        disabled={!onPressBody}
        accessibilityRole={onPressBody ? 'button' : undefined}
        accessibilityLabel={onPressBody ? 'Abrir avaliação' : undefined}
      >
        {hasTags ? (
          <View style={styles.tags}>
            {review.positiveTags.map((t) => (
              <Chip key={t.id} label={t.label} variant="positive" size="sm" />
            ))}
            {review.negativeTags.map((t) => (
              <Chip key={t.id} label={t.label} variant="negative" size="sm" />
            ))}
          </View>
        ) : null}

        {comment !== '' ? (
          <Text style={[styles.comment, hasTags && styles.commentSpaced]} numberOfLines={4}>
            {comment}
          </Text>
        ) : null}
      </Pressable>

      <VoteBar
        agreements={review.agreements}
        disagreements={review.disagreements}
        comments={review.commentCount}
        active={vote}
        onAgree={onVote && (() => onVote('agree'))}
        onDisagree={onVote && (() => onVote('disagree'))}
        onComments={onPressBody}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  post: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: space.lg,
    gap: space.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  headerText: { flex: 1 },
  name: {
    fontFamily: type.bodyBold.family,
    fontSize: type.bodyBold.size,
    lineHeight: type.bodyBold.lineHeight,
    color: colors.ink,
  },
  sub: {
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
  context: { gap: space.xs },
  contextText: {
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.inkMuted,
  },
  contextStrong: {
    fontFamily: type.bodyBold.family,
    color: colors.ink,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
  },
  comment: {
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.ink,
  },
  commentSpaced: { marginTop: space.sm },
});
