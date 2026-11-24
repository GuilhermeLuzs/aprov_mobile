import { useRef, useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, Flag, X } from 'lucide-react-native';
import { ApiError, apiRemoveReviewAuthor } from '../../api';
import {
  Avatar,
  BottomSheet,
  Button,
  Chip,
  CommentComposer,
  CommentThread,
  EmptyState,
  LoadError,
  LoadingState,
  MediaCarousel,
  SectionHeader,
  StarRating,
  VersionPager,
  VoteBar,
} from '../../components';
import { colors, icon, radius, size, space, type } from '../../theme';
import { refreshAfterReviewChange } from '../../queries/client';
import { reviewIdOf } from '../../queries/mappers';
import { useReview, useReviewDisplay } from '../../queries/reviews';
import { isAnonymousAuthor, useCurrentUser } from '../../store/session';
import { REVIEW_CHARACTERISTIC_LABEL, type Comment, type CommentReply } from '../../types';
import { formatInt, formatRating } from '../../utils/format';
import { formatDayMonth, formatRelativeTime } from '../../utils/date';
import { changesBetween, snapshotsOf, versionNumberOf } from '../../utils/reviewHistory';
import type { ReviewDetailsNavigation, ReviewDetailsParamList } from '../../navigation/types';
import { useOpenProfile } from '../UserProfile/useOpenProfile';
import { useOpenMedia } from '../Media/useOpenMedia';
import { useReport } from '../Report/useReport';
import { COMMENT_MAX_LENGTH, useReviewComments } from './useReviewComments';

const NOT_FOUND = 404;

export default function ReviewDetailsScreen() {
  const route = useRoute<RouteProp<ReviewDetailsParamList, 'ReviewDetails'>>();
  const navigation = useNavigation<ReviewDetailsNavigation>();
  const { reviewId } = route.params;
  const insets = useSafeAreaInsets();
  const me = useCurrentUser();
  const display = useReviewDisplay();
  const openMedia = useOpenMedia();
  const openProfile = useOpenProfile();
  const [managing, setManaging] = useState<Comment | CommentReply | null>(null);
  const [versionIndex, setVersionIndex] = useState<number | null>(null);
  const listRef = useRef<FlatList<Comment>>(null);
  const [confirmRemoveName, setConfirmRemoveName] = useState(false);
  const [removingName, setRemovingName] = useState(false);
  const [removeNameError, setRemoveNameError] = useState<string | null>(null);

  const remote = useReview(reviewId);
  const base = remote.data?.review;
  const product = remote.data?.product;
  const comments = useReviewComments(base);
  const report = useReport((target) => {
    if (target === 'review') navigation.goBack();
  });

  if (remote.isPending) return <LoadingState fill />;

  if (remote.isError && !remote.data) {
    const missing = remote.error instanceof ApiError && remote.error.status === NOT_FOUND;
    if (!missing) {
      return (
        <View style={styles.notFound}>
          <LoadError onRetry={() => void remote.refetch()} />
        </View>
      );
    }
  }

  if (!base || !product) {
    return (
      <View style={styles.notFound}>
        <EmptyState
          mood="confused"
          title="Avaliação não encontrada"
          description="Ela pode ter sido removida."
          action={{ label: 'Voltar', onPress: () => navigation.goBack() }}
        />
      </View>
    );
  }

  const { review, vote, onVote } = display(base);
  const author = remote.data?.author;
  const { thread, total } = comments;
  const question = product.kind === 'service' ? 'Contrataria novamente?' : 'Compraria novamente?';
  const anonymous = isAnonymousAuthor(base.authorId);
  const canOpenAuthor = !anonymous;
  const mine = base.authorId === me.id;
  const snapshots = snapshotsOf(review);
  const lastIndex = snapshots.length - 1;
  const shownIndex = Math.min(versionIndex ?? lastIndex, lastIndex);
  const shown = snapshots[shownIndex];
  const changes = changesBetween(snapshots[shownIndex - 1], shown);
  const viewingPast = shownIndex < lastIndex;
  const isNewTag = (tagId: string) => changes?.addedTagIds.includes(tagId) ?? false;
  const versionLabel = viewingPast
    ? `Versão ${shownIndex + 1} de ${snapshots.length} · ${formatDayMonth(shown.publishedAt)}`
    : `Versão atual · editada em ${formatDayMonth(shown.publishedAt)}`;
  const answerLabel = (answer: boolean | null) => (answer === true ? 'Sim' : answer === false ? 'Não' : 'não respondeu');
  const showVersion = (index: number) => setVersionIndex(index === lastIndex ? null : index);
  const versionVotes = snapshots.length > 1 ? review.votesByVersion?.[shownIndex] : undefined;
  const plural = (count: number, one: string, many: string) => `${formatInt(count)} ${count === 1 ? one : many}`;
  const openVersion = (version: number) => {
    showVersion(version - 1);
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const removeName = async () => {
    if (!mine) return;
    setRemoveNameError(null);
    setRemovingName(true);
    try {
      await apiRemoveReviewAuthor(reviewIdOf(base.id));
    } catch (error) {
      setRemovingName(false);
      setRemoveNameError(
        error instanceof ApiError ? error.message : 'Não deu para tirar seu nome agora. Tente de novo.',
      );
      return;
    }
    setRemovingName(false);
    setConfirmRemoveName(false);
    navigation.goBack();
    refreshAfterReviewChange(product.id, reviewIdOf(base.id));
  };

  const header = (
    <View style={styles.body}>
      <View style={styles.authorLine}>
        <Pressable
          style={styles.authorRow}
          onPress={() => openProfile(base.authorId)}
          disabled={!canOpenAuthor}
          accessibilityRole={canOpenAuthor ? 'link' : undefined}
          accessibilityLabel={canOpenAuthor ? `Ver perfil de ${author?.name ?? 'Usuário'}` : undefined}
        >
          <Avatar
            uri={author?.avatarUri ?? ''}
            name={author?.name ?? 'Usuário'}
            size="md"
            bordered
          />
          <View style={styles.authorText}>
            <Text style={styles.authorName} numberOfLines={1}>
              {author?.name ?? 'Usuário'}
            </Text>
            <Text style={styles.muted} numberOfLines={1}>
              {anonymous ? '' : `Nível ${author?.level ?? 1} · `}
              {formatRelativeTime(review.createdAt)}
              {review.editedAt ? ' · editada' : ''}
            </Text>
          </View>
        </Pressable>
        {report.canReport(base.authorId) ? (
          <Pressable
            onPress={() => report.open('review', base.id)}
            hitSlop={space.sm}
            accessibilityRole="button"
            accessibilityLabel="Denunciar avaliação"
            style={styles.reportButton}
          >
            <Flag size={icon.size.md} color={colors.inkMuted} strokeWidth={icon.strokeWidth} />
          </Pressable>
        ) : null}
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

      {snapshots.length > 1 ? (
        <View style={styles.section}>
          <VersionPager
            label={versionLabel}
            canGoBack={shownIndex > 0}
            canGoForward={viewingPast}
            onBack={() => showVersion(shownIndex - 1)}
            onForward={() => showVersion(shownIndex + 1)}
          />
          {viewingPast ? (
            <View style={styles.pastNotice}>
              <Text style={styles.pastText}>Você está vendo como a avaliação era antes de uma edição.</Text>
              <Pressable onPress={() => setVersionIndex(null)} hitSlop={space.sm} accessibilityRole="button">
                <Text style={styles.link}>Voltar para a atual</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={styles.overall}>
        <StarRating value={shown.averageRating} size="lg" showValue />
        {changes?.previousAverage != null ? (
          <Text style={styles.previous} accessibilityLabel={`Antes: ${formatRating(changes.previousAverage)}`}>
            {formatRating(changes.previousAverage)}
          </Text>
        ) : null}
      </View>

      <View style={styles.charCard}>
        {shown.characteristics.map((c) => {
          const before = changes?.previousRatings[c.key];
          return (
            <View key={c.key} style={styles.charRow}>
              <Text style={styles.charLabel}>{REVIEW_CHARACTERISTIC_LABEL[c.key]}</Text>
              <View style={styles.charRight}>
                <StarRating value={c.rating} size="sm" />
                <Text style={styles.charValue}>{formatRating(c.rating)}</Text>
                {before !== undefined ? (
                  <Text style={styles.previous} accessibilityLabel={`Antes: ${formatRating(before)}`}>
                    {formatRating(before)}
                  </Text>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>

      {shown.positiveTags.length + (changes?.removedPositiveTags.length ?? 0) > 0 ? (
        <View style={styles.section}>
          <SectionHeader title="O que foi bom?" />
          <View style={styles.tags}>
            {shown.positiveTags.map((t) => (
              <Chip key={t.id} label={t.label} variant="positive" size="sm" added={isNewTag(t.id)} />
            ))}
            {changes?.removedPositiveTags.map((t) => (
              <Chip key={t.id} label={t.label} size="sm" removed />
            ))}
          </View>
        </View>
      ) : null}

      {shown.negativeTags.length + (changes?.removedNegativeTags.length ?? 0) > 0 ? (
        <View style={styles.section}>
          <SectionHeader title="O que podemos melhorar?" />
          <View style={styles.tags}>
            {shown.negativeTags.map((t) => (
              <Chip key={t.id} label={t.label} variant="negative" size="sm" added={isNewTag(t.id)} />
            ))}
            {changes?.removedNegativeTags.map((t) => (
              <Chip key={t.id} label={t.label} size="sm" removed />
            ))}
          </View>
        </View>
      ) : null}

      {shown.media[0] ? (
        <View style={styles.section}>
          <MediaCarousel
            media={shown.media}
            onOpen={viewingPast ? undefined : (index) => openMedia([review.id], review.id, index)}
          />
        </View>
      ) : null}

      {changes && (changes.addedMediaCount > 0 || changes.removedMedia.length > 0) ? (
        <View style={styles.mediaChanges}>
          {changes.addedMediaCount > 0 ? (
            <Text style={styles.changeNote}>
              {changes.addedMediaCount === 1
                ? '1 foto ou vídeo novo nesta edição'
                : `${changes.addedMediaCount} fotos ou vídeos novos nesta edição`}
            </Text>
          ) : null}
          {changes.removedMedia.length > 0 ? (
            <>
              <Text style={styles.changeNote}>Removidos nesta edição</Text>
              <View style={styles.removedMedia}>
                {changes.removedMedia.map((file) => (
                  <Image
                    key={file.id}
                    source={{ uri: file.previewUri }}
                    style={styles.removedThumb}
                    accessibilityLabel={file.kind === 'video' ? 'Vídeo removido' : 'Foto removida'}
                  />
                ))}
              </View>
            </>
          ) : null}
        </View>
      ) : null}

      {changes?.commentChanged ? <Text style={styles.changeLabel}>Texto alterado nesta edição</Text> : null}
      {shown.comment.trim() !== '' ? (
        <Text style={[styles.reviewText, changes?.commentChanged && styles.reviewTextAfterLabel]}>
          {shown.comment}
        </Text>
      ) : null}

      <View style={styles.buyRow}>
        <Text style={styles.buyLabel}>{question}</Text>
        {shown.wouldBuyAgain === true ? (
          <View style={styles.buyAnswer}>
            <Check size={icon.size.md} color={colors.agree} strokeWidth={icon.strokeWidth} />
            <Text style={[styles.buyValue, { color: colors.agree }]}>Sim</Text>
          </View>
        ) : shown.wouldBuyAgain === false ? (
          <View style={styles.buyAnswer}>
            <X size={icon.size.md} color={colors.disagree} strokeWidth={icon.strokeWidth} />
            <Text style={[styles.buyValue, { color: colors.disagree }]}>Não</Text>
          </View>
        ) : (
          <Text style={styles.faint}>não respondeu</Text>
        )}
      </View>
      {changes?.previousWouldBuyAgain !== undefined ? (
        <Text style={styles.changeNote}>antes: {answerLabel(changes.previousWouldBuyAgain)}</Text>
      ) : null}

      <View style={styles.section}>
        <VoteBar
          agreements={review.agreements}
          disagreements={review.disagreements}
          comments={total}
          active={vote}
          onAgree={onVote && (() => onVote('agree'))}
          onDisagree={onVote && (() => onVote('disagree'))}
        />
        {versionVotes ? (
          <Text style={styles.ownNote}>
            {`Nesta versão: ${plural(versionVotes.agreements, 'concordância', 'concordâncias')} e ${plural(versionVotes.disagreements, 'discordância', 'discordâncias')}.`}
          </Text>
        ) : null}
        {!onVote ? <Text style={styles.ownNote}>Esta avaliação é sua.</Text> : null}
      </View>

      {mine ? (
        <View style={styles.ownActions}>
          <Button
            label="Editar"
            variant="secondary"
            onPress={() =>
              navigation.navigate('CreateReview', { productId: product.id, reviewId: base.id })
            }
            style={styles.ownAction}
          />
          <Button
            label="Tirar meu nome"
            variant="secondary"
            onPress={() => setConfirmRemoveName(true)}
            style={styles.ownAction}
          />
        </View>
      ) : null}

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
        ref={listRef}
        style={styles.screen}
        contentContainerStyle={styles.content}
        data={thread}
        keyExtractor={(c) => c.id}
        ListHeaderComponent={header}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <View style={styles.body}>
            <CommentThread
              comment={item}
              authorFor={comments.authorFor}
              onPressAuthor={openProfile}
              voteFor={comments.voteFor}
              canVote={comments.canVote}
              onVote={comments.vote}
              onReply={comments.setReplyingTo}
              canReport={report.canReport}
              onReport={(id) => report.open('comment', id)}
              canManage={comments.canManage}
              onManage={setManaging}
              versionOf={(createdAt) => versionNumberOf(snapshots, createdAt)}
              onPressVersion={openVersion}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.body}>
            {comments.loading ? (
              <LoadingState />
            ) : comments.failed ? (
              <LoadError compact onRetry={comments.retry} />
            ) : (
              <EmptyState
                compact
                title="Nenhum comentário ainda"
                description="Seja a primeira pessoa a comentar."
              />
            )}
          </View>
        }
        ListFooterComponent={
          comments.loadingMore ? (
            <LoadingState />
          ) : comments.hasMore ? (
            <View style={[styles.body, styles.more]}>
              <Button
                label="Ver mais comentários"
                variant="secondary"
                fullWidth
                onPress={comments.loadMore}
              />
            </View>
          ) : null
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />

      <CommentComposer
        value={comments.draft}
        onChangeText={comments.setDraft}
        onSend={comments.send}
        replyingTo={comments.replyingToName}
        onCancelReply={() => comments.setReplyingTo(null)}
        editing={comments.editing}
        onCancelEdit={comments.cancelEditing}
        maxLength={COMMENT_MAX_LENGTH}
      />
      {report.sheet}

      <BottomSheet
        visible={managing !== null}
        title="Seu comentário"
        closeLabel="Fechar"
        onClose={() => setManaging(null)}
        footer={
          <>
            <Button
              label="Excluir"
              variant="secondary"
              onPress={() => {
                if (managing) comments.remove(managing);
                setManaging(null);
              }}
              style={styles.sheetButton}
            />
            <Button
              label="Editar"
              onPress={() => {
                if (managing) comments.startEditing(managing);
                setManaging(null);
              }}
              style={styles.sheetButton}
            />
          </>
        }
      >
        <Text style={styles.sheetText}>
          Ao editar, o comentário fica marcado como editado. Ao excluir, ele some; se já tiver
          respostas, fica "Comentário excluído" no lugar e as respostas continuam.
        </Text>
      </BottomSheet>

      <BottomSheet
        visible={confirmRemoveName}
        title="Tirar seu nome da avaliação?"
        closeLabel="Cancelar"
        onClose={() => setConfirmRemoveName(false)}
        footer={
          <>
            <Button
              label="Cancelar"
              variant="secondary"
              disabled={removingName}
              onPress={() => setConfirmRemoveName(false)}
              style={styles.sheetButton}
            />
            <Button
              label={removingName ? 'Tirando...' : 'Tirar meu nome'}
              disabled={removingName}
              onPress={removeName}
              style={styles.sheetButton}
            />
          </>
        }
      >
        <Text style={styles.sheetText}>
          A avaliação continua na APROV, como de um autor anônimo, com as notas, as tags, o texto e
          a conversa. Saem seu nome, sua foto e as fotos e vídeos dela. Ela some do seu perfil e não
          dá para desfazer. O que você ganhou fica, mas avaliar este item de novo não rende moedas,
          pontos nem XP.
        </Text>
        {removeNameError ? <Text style={styles.sheetError}>{removeNameError}</Text> : null}
      </BottomSheet>

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
  authorLine: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  authorRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.sm },
  reportButton: {
    width: size.control,
    height: size.control,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
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
  overall: { marginTop: space.lg, flexDirection: 'row', alignItems: 'center', gap: space.sm },
  previous: {
    fontFamily: type.numeric.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkFaint,
    textDecorationLine: 'line-through',
  },
  pastNotice: { marginTop: space.sm, gap: space.xs },
  pastText: {
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
  mediaChanges: { marginTop: space.sm, gap: space.xs },
  removedMedia: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  removedThumb: {
    width: size.historyThumb,
    height: size.historyThumb,
    borderRadius: radius.control,
    backgroundColor: colors.border,
  },
  changeNote: {
    marginTop: space.xs,
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
  changeLabel: {
    marginTop: space.lg,
    fontFamily: type.bodyBold.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.agree,
  },
  reviewTextAfterLabel: { marginTop: space.xs },
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
  link: {
    fontFamily: type.bodyBold.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.primary,
  },
  ownActions: { marginTop: space.md, flexDirection: 'row', gap: space.sm },
  ownAction: { flex: 1 },
  sheetText: {
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.inkMuted,
  },
  sheetError: {
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    fontFamily: type.bodyBold.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.disagree,
  },
  sheetButton: { flex: 1 },
  divider: { height: 1, marginVertical: space.lg, backgroundColor: colors.border },
  separator: { height: space.md },
  more: { marginTop: space.md },
});
