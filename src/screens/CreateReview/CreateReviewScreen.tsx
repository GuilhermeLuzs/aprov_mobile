import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { ApiError, apiCreateReview, apiRewardPreview, apiUpdateReview, type ApiReview } from '../../api';
import { BottomSheet, Button, EmptyState, LoadError, LoadingState, RewardAmount, Stepper } from '../../components';
import { colors, icon, size, space, type } from '../../theme';
import type { Company, Product, RewardPreview } from '../../types';
import type { RootStackParamList } from '../../navigation/types';
import { useItem } from '../../queries/catalog';
import { refreshAfterReviewChange } from '../../queries/client';
import { useReviewSource } from '../../queries/reviews';
import {
  TOTAL_STEPS,
  clearDraft,
  commentDone,
  draftRewardFacts,
  existingMediaId,
  EXISTING_MEDIA_PREFIX,
  isDirty,
  loadDraft,
  mediaDone,
  mediaRequired,
  saveDraft,
  starsDone,
  tagsDone,
  type Draft,
} from './draft';
import { stepRewards, type Rewards } from './rewards';
import { StepStars } from './steps/StepStars';
import { StepTags } from './steps/StepTags';
import { StepMedia } from './steps/StepMedia';
import { StepComment } from './steps/StepComment';
import { StepPreview } from './steps/StepPreview';
import { Conclusion } from './Conclusion';

const EXISTING_MEDIA_SIDE = 1080;
const NOT_FOUND = 404;

export default function CreateReviewScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'CreateReview'>>();
  const route = useRoute<RouteProp<RootStackParamList, 'CreateReview'>>();
  const { productId, reviewId } = route.params;
  const item = useItem(productId);
  const source = useReviewSource(reviewId ?? null);

  if (item.isPending || (reviewId && source.isPending)) return <LoadingState fill />;

  if (!item.data || (reviewId && !source.data)) {
    const failed = item.isError && !(item.error instanceof ApiError && item.error.status === NOT_FOUND);
    return (
      <View style={[styles.notFound, { paddingTop: insets.top }]}>
        {failed ? (
          <LoadError onRetry={() => void item.refetch()} />
        ) : (
          <EmptyState
            mood="confused"
            title="Item não encontrado"
            description="Não dá para avaliar este item agora."
            action={{ label: 'Fechar', onPress: () => navigation.goBack() }}
          />
        )}
      </View>
    );
  }

  return <CreateReviewFlow product={item.data.product} company={item.data.company} source={source.data} />;
}

type FlowProps = { product: Product; company: Company; source: ApiReview | undefined };

function CreateReviewFlow({ product, company, source }: FlowProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'CreateReview'>>();
  const productId = product.id;
  const editing = source !== undefined;
  const draftKey = source ? `edit-${source.id}` : productId;

  const [draft, setDraft] = useState<Draft>(() =>
    loadDraft(draftKey, source ? () => draftFromApi(source) : undefined),
  );
  const [initialDraft] = useState(() => JSON.stringify({ ...draft, step: 1 }));
  const [published, setPublished] = useState<Rewards | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [preview, setPreview] = useState<RewardPreview | null>(null);

  const factsKey = JSON.stringify(draftRewardFacts(draft));

  useEffect(() => {
    if (editing) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      apiRewardPreview(Number(productId), draftRewardFacts(draft))
        .then((result) => {
          if (!cancelled) setPreview(result);
        })
        .catch(() => {});
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [productId, factsKey]);

  if (published) {
    return (
      <Conclusion
        company={company}
        rewards={published}
        onViewReview={() =>
          navigation.navigate('MainTabs', {
            screen: 'HomeTab',
            params: { screen: 'ProductDetails', params: { productId } },
          })
        }
        onReviewAnother={() => navigation.goBack()}
      />
    );
  }

  const update = (patch: Partial<Draft>) => {
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      saveDraft(draftKey, next);
      return next;
    });
  };

  const topics = preview?.topics ?? [];
  const earnedCoins = preview?.earned.coins ?? 0;
  const rewardsFor = (n: number) => (editing ? [] : stepRewards(topics, n, company.coinName));

  const step = draft.step;
  const canAdvance =
    step === 1
      ? starsDone(draft)
      : step === 2
        ? tagsDone(draft)
        : step === 3
          ? !mediaRequired(product.kind) || mediaDone(draft)
          : step === 4
            ? commentDone(draft)
            : step === 5
              ? draft.wouldBuyAgain !== null && (!mediaDone(draft) || draft.mediaConsent)
              : true;

  const skippable = step === 3 && !mediaDone(draft);
  const primaryLabel =
    step === TOTAL_STEPS
      ? editing
        ? publishing
          ? 'Salvando...'
          : 'Salvar alterações'
        : publishing
          ? 'Publicando...'
          : 'Publicar avaliação'
      : skippable && canAdvance
        ? 'Pular'
        : 'Continuar';

  const saveEdit = async (original: ApiReview) => {
    setPublishError(null);
    setPublishing(true);
    let updated: ApiReview;
    try {
      updated = await apiUpdateReview(original.id, {
        deliveryRating: draft.characteristics.entrega,
        qualityRating: draft.characteristics.qualidade,
        conformityRating: draft.characteristics.conformidade,
        valueRating: draft.characteristics.custo_beneficio,
        tagIds: [...draft.positiveTagIds, ...draft.negativeTagIds].map(Number),
        comment: draft.comment.trim(),
        wouldBuyAgain: draft.wouldBuyAgain ?? false,
        mediaConsent: draft.mediaConsent,
        keepMediaIds: draft.media
          .map(existingMediaId)
          .filter((id): id is number => id !== null),
        media: draft.media
          .filter((item) => existingMediaId(item) === null)
          .map((item) => ({ uri: item.uri, kind: item.kind })),
      });
    } catch (error) {
      setPublishing(false);
      setPublishError(error instanceof ApiError ? error.message : 'Não deu para salvar agora. Tente de novo.');
      return;
    }
    setPublishing(false);
    refreshAfterReviewChange(productId, updated.id);
    clearDraft(draftKey);
    navigation.goBack();
  };

  const advance = async () => {
    if (step < TOTAL_STEPS) {
      update({ step: step + 1 });
      return;
    }
    if (source) {
      await saveEdit(source);
      return;
    }
    setPublishError(null);
    setPublishing(true);
    let rewards: Rewards;
    try {
      const created = await apiCreateReview({
        itemId: Number(productId),
        deliveryRating: draft.characteristics.entrega,
        qualityRating: draft.characteristics.qualidade,
        conformityRating: draft.characteristics.conformidade,
        valueRating: draft.characteristics.custo_beneficio,
        tagIds: [...draft.positiveTagIds, ...draft.negativeTagIds].map(Number),
        comment: draft.comment.trim(),
        wouldBuyAgain: draft.wouldBuyAgain ?? false,
        media: draft.media.map((item) => ({ uri: item.uri, kind: item.kind })),
      });
      const earned = created.rewards ?? { coins: 0, aprovPoints: 0, xp: 0 };
      rewards = { coins: earned.coins, points: earned.aprovPoints, xp: earned.xp };
    } catch (error) {
      setPublishing(false);
      setPublishError(error instanceof ApiError ? error.message : 'Não deu para publicar agora. Tente de novo.');
      return;
    }
    setPublishing(false);
    refreshAfterReviewChange(productId);
    clearDraft(productId);
    setPublished(rewards);
  };

  const requestClose = () => {
    const changed = editing
      ? JSON.stringify({ ...draft, step: 1 }) !== initialDraft
      : isDirty(draft);
    if (changed) {
      setConfirmDiscard(true);
      return;
    }
    navigation.goBack();
  };

  const discard = () => {
    clearDraft(draftKey);
    setConfirmDiscard(false);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.top, { paddingTop: insets.top + space.sm }]}>
        <View style={styles.topRow}>
          {editing ? (
            <Text style={styles.editingLabel}>Editando avaliação</Text>
          ) : (
            <RewardAmount
              amount={earnedCoins}
              label={company.coinName}
              size="sm"
              coin={{ icon: company.coinIcon, color: company.coinColor }}
            />
          )}
          <Pressable
            style={styles.close}
            onPress={requestClose}
            hitSlop={space.sm}
            accessibilityRole="button"
            accessibilityLabel={editing ? 'Fechar edição' : 'Fechar avaliação'}
          >
            <X size={icon.size.lg} color={colors.inkMuted} strokeWidth={icon.strokeWidth} />
          </Pressable>
        </View>
        <Stepper current={step} total={TOTAL_STEPS} />
        <Text style={styles.productTitle} numberOfLines={2}>
          {product.title}
        </Text>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {step === 1 ? (
          <StepStars draft={draft} update={update} product={product} />
        ) : null}
        {step === 2 ? (
          <StepTags draft={draft} update={update} product={product} rewards={rewardsFor(2)} />
        ) : null}
        {step === 3 ? (
          <StepMedia draft={draft} update={update} product={product} rewards={rewardsFor(3)} />
        ) : null}
        {step === 4 ? (
          <StepComment
            draft={draft}
            update={update}
            product={product}
            rewards={rewardsFor(4)}
            onOpenChat={() => {
              saveDraft(draftKey, draft);
              navigation.navigate('MauricioChat', { productId, draftKey });
            }}
          />
        ) : null}
        {step === 5 ? (
          <StepPreview
            draft={draft}
            update={update}
            product={product}
            company={company}
            rewards={rewardsFor(5)}
          />
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
        {publishError ? <Text style={styles.publishError}>{publishError}</Text> : null}
        <View style={styles.footerRow}>
          {step > 1 ? (
            <Button label="Voltar" variant="text" disabled={publishing} onPress={() => update({ step: step - 1 })} />
          ) : null}
          <View style={styles.footerPrimary}>
            <Button label={primaryLabel} fullWidth disabled={!canAdvance || publishing} onPress={advance} />
          </View>
        </View>
      </View>

      <BottomSheet
        visible={confirmDiscard}
        title={editing ? 'Sair da edição?' : 'Sair da avaliação?'}
        closeLabel={editing ? 'Continuar editando' : 'Continuar avaliando'}
        onClose={() => setConfirmDiscard(false)}
        footer={
          <>
            <Button
              label="Descartar"
              variant="secondary"
              onPress={discard}
              style={styles.sheetButton}
            />
            <Button
              label="Continuar"
              onPress={() => setConfirmDiscard(false)}
              style={styles.sheetButton}
            />
          </>
        }
      >
        <Text style={styles.sheetText}>
          {editing
            ? 'O que você mudou fica guardado enquanto o app estiver aberto. Se descartar, a avaliação continua como estava.'
            : 'O que você preencheu até aqui fica guardado enquanto o app estiver aberto. Se descartar, começa do zero.'}
        </Text>
      </BottomSheet>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    padding: space.lg,
    backgroundColor: colors.bg,
  },
  top: {
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    gap: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  close: {
    width: size.control,
    height: size.control,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  editingLabel: {
    fontFamily: type.bodyBold.family,
    fontSize: type.bodyBold.size,
    lineHeight: type.bodyBold.lineHeight,
    color: colors.ink,
  },
  productTitle: {
    fontFamily: type.subtitle.family,
    fontSize: type.subtitle.size,
    lineHeight: type.subtitle.lineHeight,
    color: colors.primary,
  },
  body: { flex: 1 },
  bodyContent: { padding: space.lg, paddingBottom: space.xxl },
  footer: {
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  footerPrimary: { flex: 1 },
  publishError: {
    fontFamily: type.bodyBold.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.disagree,
  },
  sheetText: {
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.inkMuted,
  },
  sheetButton: { flex: 1 },
});

function draftFromApi(api: ApiReview): Draft {
  const tagIds = (tags: { id: number }[]) =>
    tags.map((t) => String(t.id));
  return {
    step: 1,
    characteristics: {
      entrega: api.deliveryRating,
      qualidade: api.qualityRating,
      conformidade: api.conformityRating,
      custo_beneficio: api.valueRating,
    },
    positiveTagIds: tagIds(api.positiveTags),
    negativeTagIds: tagIds(api.negativeTags),
    media: api.media.map((m) => ({
      id: `${EXISTING_MEDIA_PREFIX}${m.id}`,
      kind: m.type,
      uri: m.url,
      width: EXISTING_MEDIA_SIDE,
      height: EXISTING_MEDIA_SIDE,
      durationSeconds: 0,
    })),
    comment: api.comment,
    wouldBuyAgain: api.wouldBuyAgain,
    mediaConsent: api.mediaConsent,
  };
}
