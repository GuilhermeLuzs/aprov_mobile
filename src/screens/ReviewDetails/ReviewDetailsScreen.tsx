import { useState } from 'react';
import {
  FlatList,
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
  MediaCarousel,
  SectionHeader,
  StarRating,
  VoteBar,
} from '../../components';
import { colors, icon, radius, size, space, type } from '../../theme';
import { products } from '../../mocks';
import { apiSourceOf, dropPublishedReview, useAllReviews } from '../../store/publishedReviews';
import { findUser, isAnonymousAuthor, useCurrentUser } from '../../store/session';
import { useInteractions, useReviewDisplay, votesAroundEdit } from '../../store/interactions';
import { REVIEW_CHARACTERISTIC_LABEL, type Comment, type CommentReply } from '../../types';
import { formatInt, formatRating } from '../../utils/format';
import { formatDayMonth, formatRelativeTime } from '../../utils/date';
import type { ReviewDetailsNavigation, ReviewDetailsParamList } from '../../navigation/types';
import { useOpenProfile } from '../UserProfile/useOpenProfile';
import { useOpenMedia } from '../Media/useOpenMedia';
import { useReport } from '../Report/useReport';
import { COMMENT_MAX_LENGTH, useReviewComments } from './useReviewComments';

const COMMENTS_STEP = 5;

export default function ReviewDetailsScreen() {
  const route = useRoute<RouteProp<ReviewDetailsParamList, 'ReviewDetails'>>();
  const navigation = useNavigation<ReviewDetailsNavigation>();
  const { reviewId } = route.params;
  const insets = useSafeAreaInsets();
  const me = useCurrentUser();
  const allReviews = useAllReviews();
  const display = useReviewDisplay(me.id);
  const openMedia = useOpenMedia();
  const openProfile = useOpenProfile();
  const interactions = useInteractions();
  const [visibleCount, setVisibleCount] = useState(COMMENTS_STEP);
  const [managing, setManaging] = useState<Comment | CommentReply | null>(null);
  const [showVersions, setShowVersions] = useState(false);
  const [confirmRemoveName, setConfirmRemoveName] = useState(false);
  const [removingName, setRemovingName] = useState(false);
  const [removeNameError, setRemoveNameError] = useState<string | null>(null);

  const base = allReviews.find((r) => r.id === reviewId);
  const comments = useReviewComments(base);
  const report = useReport((target) => {
    if (target === 'review') navigation.goBack();
  });
  const product = base ? products.find((p) => p.id === base.productId) : undefined;

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
  const author = base.authorId === me.id ? me : findUser(base.authorId);
  const { thread, total } = comments;
  const visible = thread.slice(0, visibleCount);
  const question = product.kind === 'service' ? 'Contrataria novamente?' : 'Compraria novamente?';
  const anonymous = isAnonymousAuthor(base.authorId);
  const source = base.authorId === me.id ? apiSourceOf(base.id) : undefined;
  const aroundEdit = votesAroundEdit(interactions, me.id, review);

  const removeName = async () => {
    if (!source) return;
    setRemoveNameError(null);
    setRemovingName(true);
    try {
      await apiRemoveReviewAuthor(source.id);
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
    dropPublishedReview(base.id);
  };

  const header = (
    <View style={styles.body}>
      <View style={styles.authorLine}>
        <Pressable
          style={styles.authorRow}
          onPress={() => openProfile(base.authorId)}
          disabled={anonymous}
          accessibilityRole={anonymous ? undefined : 'link'}
          accessibilityLabel={anonymous ? undefined : `Ver perfil de ${author?.name ?? 'Usuário'}`}
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
          <MediaCarousel
            media={review.media}
            onOpen={(index) => openMedia([review.id], review.id, index)}
          />
        </View>
      ) : null}

      {review.comment.trim() !== '' ? (
        <Text style={styles.reviewText}>{review.comment}</Text>
      ) : null}

      {review.editedAt && review.versions.length > 0 ? (
        <Pressable
          onPress={() => setShowVersions(true)}
          hitSlop={space.sm}
          accessibilityRole="button"
          style={styles.versionsLink}
        >
          <Text style={styles.link}>
            Editada em {formatDayMonth(review.editedAt)} · ver versões anteriores
          </Text>
        </Pressable>
      ) : null}

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
        {aroundEdit ? (
          <Text style={styles.ownNote}>
            {`Antes da edição: ${formatInt(aroundEdit.before.agreements)} concordâncias e ${formatInt(aroundEdit.before.disagreements)} discordâncias. Depois: ${formatInt(aroundEdit.after.agreements)} e ${formatInt(aroundEdit.after.disagreements)}.`}
          </Text>
        ) : null}
        {!onVote ? <Text style={styles.ownNote}>Esta avaliação é sua.</Text> : null}
      </View>

      {source ? (
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
              reviewEditedAt={review.editedAt}
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

      <BottomSheet
        visible={showVersions}
        title="Versões anteriores"
        closeLabel="Fechar"
        onClose={() => setShowVersions(false)}
        tall
      >
        <View style={styles.versions}>
          {review.versions.map((version) => (
            <View key={version.id} style={styles.version}>
              <View style={styles.versionHead}>
                <Text style={styles.authorName}>{formatDayMonth(version.publishedAt)}</Text>
                <StarRating value={version.averageRating} size="sm" showValue />
              </View>
              <Text style={styles.versionText}>{version.comment}</Text>
            </View>
          ))}
        </View>
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
  versionsLink: { marginTop: space.md, alignSelf: 'flex-start' },
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
  versions: { paddingHorizontal: space.lg, paddingVertical: space.md, gap: space.lg },
  version: { gap: space.xs },
  versionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  versionText: {
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.ink,
  },
  divider: { height: 1, marginVertical: space.lg, backgroundColor: colors.border },
  separator: { height: space.md },
  more: { marginTop: space.md },
});
