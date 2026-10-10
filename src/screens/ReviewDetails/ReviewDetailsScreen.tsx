import { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, X } from 'lucide-react-native';
import {
  Avatar,
  Button,
  Chip,
  CommentComposer,
  CommentThread,
  EmptyState,
  ReviewMedia,
  SectionHeader,
  StarRating,
  VoteBar,
} from '../../components';
import { colors, icon, radius, size, space, type } from '../../theme';
import { products, reviews } from '../../mocks';
import { usePublishedReviews } from '../../store/publishedReviews';
import { findUser, useCurrentUser } from '../../store/session';
import {
  addComment,
  addReply,
  commentTotal,
  myVote,
  threadOf,
  toggleVote,
  useInteractions,
  useReviewDisplay,
  withVote,
} from '../../store/interactions';
import { REVIEW_CHARACTERISTIC_LABEL, type Comment } from '../../types';
import { formatInt, formatRating } from '../../utils/format';
import { formatRelativeTime } from '../../utils/date';
import type { ReviewDetailsNavigation, ReviewDetailsParamList } from '../../navigation/types';

const COMMENTS_STEP = 5;
const COMMENT_MAX_LENGTH = 500;

function byRelevance(a: Comment, b: Comment): number {
  return b.agreements - a.agreements || Date.parse(b.createdAt) - Date.parse(a.createdAt);
}

export default function ReviewDetailsScreen() {
  const route = useRoute<RouteProp<ReviewDetailsParamList, 'ReviewDetails'>>();
  const navigation = useNavigation<ReviewDetailsNavigation>();
  const { reviewId } = route.params;
  const insets = useSafeAreaInsets();
  const me = useCurrentUser();
  const published = usePublishedReviews();
  const interactions = useInteractions();
  const display = useReviewDisplay(me.id);
  const [visibleCount, setVisibleCount] = useState(COMMENTS_STEP);
  const [draft, setDraft] = useState('');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);

  const base = [...published, ...reviews].find((r) => r.id === reviewId);
  const product = base ? products.find((p) => p.id === base.productId) : undefined;

  if (!base || !product) {
    return (
      <View style={styles.notFound}>
        <EmptyState
          title="Avaliação não encontrada"
          description="Ela pode ter sido removida."
          action={{ label: 'Voltar', onPress: () => navigation.goBack() }}
        />
      </View>
    );
  }

  const { review, vote, onVote } = display(base);
  const author = base.authorId === me.id ? me : findUser(base.authorId);
  const authorFor = (id: string) => (id === me.id ? me : findUser(id));
  const voteFor = (id: string) => myVote(interactions, me.id, 'comment', id);

  const thread = threadOf(interactions, base)
    .map((comment) => ({
      ...withVote(comment, voteFor(comment.id)),
      replies: comment.replies.map((reply) => withVote(reply, voteFor(reply.id))),
    }))
    .sort(byRelevance);
  const total = commentTotal(thread);
  const visible = thread.slice(0, visibleCount);
  const question = product.kind === 'service' ? 'Contrataria novamente?' : 'Compraria novamente?';

  const send = () => {
    const text = draft.trim();
    if (text === '') return;
    if (replyingTo) addReply(replyingTo.id, me.id, text);
    else addComment(base.id, me.id, text);
    setDraft('');
    setReplyingTo(null);
  };

  const header = (
    <View style={styles.body}>
      <View style={styles.authorRow}>
        <Avatar uri={author?.avatarUri ?? ''} name={author?.name ?? 'Usuário'} size="md" bordered />
        <View style={styles.authorText}>
          <Text style={styles.authorName} numberOfLines={1}>
            {author?.name ?? 'Usuário'}
          </Text>
          <Text style={styles.muted}>
            Nível {author?.level ?? 1} · {formatRelativeTime(review.createdAt)}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={() => navigation.navigate('ProductDetails', { productId: product.id })}
        accessibilityRole="link"
        accessibilityLabel={`Ver ${product.title}`}
      >
        <Text style={styles.context} numberOfLines={2}>
          sobre <Text style={styles.contextStrong}>{product.title}</Text>
        </Text>
      </Pressable>

      <View style={styles.overall}>
        <StarRating value={review.averageRating} size="lg" showValue />
      </View>

      <View style={styles.charCard}>
        {review.characteristics.map((c) => (
          <View key={c.key} style={styles.charRow}>
            <Text style={styles.charLabel}>{REVIEW_CHARACTERISTIC_LABEL[c.key]}</Text>
            <View style={styles.charRight}>
              <StarRating value={c.rating} size="sm" />
              <Text style={styles.charValue}>{formatRating(c.rating)}</Text>
            </View>
          </View>
        ))}
      </View>

      {review.positiveTags.length > 0 ? (
        <View style={styles.section}>
          <SectionHeader title="O que foi bom?" />
          <View style={styles.tags}>
            {review.positiveTags.map((t) => (
              <Chip key={t.id} label={t.label} variant="positive" size="sm" />
            ))}
          </View>
        </View>
      ) : null}

      {review.negativeTags.length > 0 ? (
        <View style={styles.section}>
          <SectionHeader title="O que podemos melhorar?" />
          <View style={styles.tags}>
            {review.negativeTags.map((t) => (
              <Chip key={t.id} label={t.label} variant="negative" size="sm" />
            ))}
          </View>
        </View>
      ) : null}

      {review.media[0] ? (
        <View style={styles.section}>
          <ReviewMedia media={review.media[0]} />
        </View>
      ) : null}

      {review.comment.trim() !== '' ? <Text style={styles.reviewText}>{review.comment}</Text> : null}

      <View style={styles.buyRow}>
        <Text style={styles.buyLabel}>{question}</Text>
        {review.wouldBuyAgain === true ? (
          <View style={styles.buyAnswer}>
            <Check size={icon.size.md} color={colors.agree} strokeWidth={icon.strokeWidth} />
            <Text style={[styles.buyValue, { color: colors.agree }]}>Sim</Text>
          </View>
        ) : review.wouldBuyAgain === false ? (
          <View style={styles.buyAnswer}>
            <X size={icon.size.md} color={colors.disagree} strokeWidth={icon.strokeWidth} />
            <Text style={[styles.buyValue, { color: colors.disagree }]}>Não</Text>
          </View>
        ) : (
          <Text style={styles.faint}>não respondeu</Text>
        )}
      </View>

      <View style={styles.section}>
        <VoteBar
          agreements={review.agreements}
          disagreements={review.disagreements}
          comments={total}
          active={vote}
          onAgree={onVote && (() => onVote('agree'))}
          onDisagree={onVote && (() => onVote('disagree'))}
        />
        {!onVote ? <Text style={styles.ownNote}>Esta avaliação é sua.</Text> : null}
      </View>

      <View style={styles.divider} />

      <SectionHeader title={`Comentários · ${formatInt(total)}`} />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + size.control : 0}
    >
      <FlatList
        style={styles.screen}
        contentContainerStyle={styles.content}
        data={visible}
        keyExtractor={(c) => c.id}
        ListHeaderComponent={header}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <View style={styles.body}>
            <CommentThread
              comment={item}
              authorFor={authorFor}
              voteFor={voteFor}
              canVote={(authorId) => authorId !== me.id}
              onVote={(id, choice) => toggleVote(me.id, 'comment', id, choice)}
              onReply={setReplyingTo}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.body}>
            <EmptyState
              compact
              title="Nenhum comentário ainda"
              description="Seja a primeira pessoa a comentar."
            />
          </View>
        }
        ListFooterComponent={
          visibleCount < thread.length ? (
            <View style={[styles.body, styles.more]}>
              <Button
                label="Ver mais comentários"
                variant="secondary"
                fullWidth
                onPress={() => setVisibleCount((n) => n + COMMENTS_STEP)}
              />
            </View>
          ) : null
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />

      <CommentComposer
        value={draft}
        onChangeText={setDraft}
        onSend={send}
        replyingTo={replyingTo ? authorFor(replyingTo.authorId)?.name ?? 'Usuário' : undefined}
        onCancelReply={() => setReplyingTo(null)}
        maxLength={COMMENT_MAX_LENGTH}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingTop: space.lg, paddingBottom: space.xl },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    padding: space.lg,
    backgroundColor: colors.bg,
  },
  body: { paddingHorizontal: space.lg },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  authorText: { flex: 1 },
  authorName: {
    fontFamily: type.bodyBold.family,
    fontSize: type.bodyBold.size,
    lineHeight: type.bodyBold.lineHeight,
    color: colors.ink,
  },
  muted: {
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
  faint: {
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.inkFaint,
  },
  context: {
    marginTop: space.sm,
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
  contextStrong: { fontFamily: type.bodyBold.family, color: colors.primary },
  overall: { marginTop: space.lg, alignItems: 'flex-start' },
  charCard: {
    marginTop: space.lg,
    padding: space.lg,
    gap: space.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  charRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
  },
  charLabel: {
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.ink,
  },
  charRight: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  charValue: {
    fontFamily: type.numeric.family,
    fontSize: type.numeric.size,
    lineHeight: type.numeric.lineHeight,
    color: colors.valueDeep,
  },
  section: { marginTop: space.lg },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  reviewText: {
    marginTop: space.lg,
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.ink,
  },
  buyRow: { marginTop: space.lg, flexDirection: 'row', alignItems: 'center', gap: space.sm },
  buyLabel: {
    fontFamily: type.bodyBold.family,
    fontSize: type.bodyBold.size,
    lineHeight: type.bodyBold.lineHeight,
    color: colors.ink,
  },
  buyAnswer: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  buyValue: {
    fontFamily: type.bodyBold.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
  },
  ownNote: {
    marginTop: space.xs,
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
  divider: { height: 1, marginVertical: space.lg, backgroundColor: colors.border },
  separator: { height: space.md },
  more: { marginTop: space.md },
});
