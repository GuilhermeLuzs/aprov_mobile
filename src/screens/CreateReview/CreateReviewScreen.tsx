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
import { ApiError, apiCreateReview, apiRewardPreview } from '../../api';
import { realItemId, realTagIds } from '../../api/catalogBridge';
import { BottomSheet, Button, EmptyState, RewardAmount, Stepper } from '../../components';
import { colors, icon, size, space, type } from '../../theme';
import { companies, products } from '../../mocks';
import type { Review, RewardPreview } from '../../types';
import type { RootStackParamList } from '../../navigation/types';
import { publishReview, reviewFromApi } from '../../store/publishedReviews';
import { creditRewards } from '../../store/wallet';
import { useCurrentUser } from '../../store/session';
import {
  TOTAL_STEPS,
  buildReview,
  clearDraft,
  commentDone,
  draftRewardFacts,
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

export default function CreateReviewScreen() {
  const insets = useSafeAreaInsets();
  const me = useCurrentUser();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'CreateReview'>>();
  const route = useRoute<RouteProp<RootStackParamList, 'CreateReview'>>();
  const { productId } = route.params;

  const product = products.find((p) => p.id === productId);
  const company = product ? companies.find((c) => c.id === product.companyId) : undefined;

  const [draft, setDraft] = useState<Draft>(() => loadDraft(productId));
  const [published, setPublished] = useState<Rewards | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [preview, setPreview] = useState<RewardPreview | null>(null);

  const factsKey = JSON.stringify(draftRewardFacts(draft));

  useEffect(() => {
    if (!product) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      apiRewardPreview(realItemId(productId), draftRewardFacts(draft))
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

  if (!product || !company) {
    return (
      <View style={[styles.notFound, { paddingTop: insets.top }]}>
        <EmptyState
          mood="confused"
          title="Item não encontrado"
          description="Não dá para avaliar este item agora."
          action={{ label: 'Fechar', onPress: () => navigation.goBack() }}
        />
      </View>
    );
  }

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
      saveDraft(productId, next);
      return next;
    });
  };

  const topics = preview?.topics ?? [];
  const earnedCoins = preview?.earned.coins ?? 0;
  const rewardsFor = (n: number) => stepRewards(topics, n, company.coinName);

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
    step === TOTAL_STEPS ? (publishing ? 'Publicando...' : 'Publicar avaliação') : skippable && canAdvance ? 'Pular' : 'Continuar';

  const advance = async () => {
    if (step < TOTAL_STEPS) {
      update({ step: step + 1 });
      return;
    }
    setPublishError(null);
    setPublishing(true);
    let rewards: Rewards;
    let saved: Review | null;
    try {
      const created = await apiCreateReview({
        itemId: realItemId(productId),
        deliveryRating: draft.characteristics.entrega,
        qualityRating: draft.characteristics.qualidade,
        conformityRating: draft.characteristics.conformidade,
        valueRating: draft.characteristics.custo_beneficio,
        tagIds: realTagIds([...draft.positiveTagIds, ...draft.negativeTagIds]),
        comment: draft.comment.trim(),
        wouldBuyAgain: draft.wouldBuyAgain ?? false,
        media: draft.media.map((item) => ({ uri: item.uri, kind: item.kind })),
      });
      const earned = created.rewards ?? { coins: 0, aprovPoints: 0, xp: 0 };
      rewards = { coins: earned.coins, points: earned.aprovPoints, xp: earned.xp };
      saved = reviewFromApi(created, me.id);
    } catch (error) {
      setPublishing(false);
      setPublishError(error instanceof ApiError ? error.message : 'Não deu para publicar agora. Tente de novo.');
      return;
    }
    setPublishing(false);
    publishReview(saved ?? buildReview(draft, product, `published-${Date.now()}`, me.id));
    creditRewards({ companyId: product.companyId, ...rewards });
    clearDraft(productId);
    setPublished(rewards);
  };

  const requestClose = () => {
    if (isDirty(draft)) {
      setConfirmDiscard(true);
      return;
    }
    navigation.goBack();
  };

  const discard = () => {
    clearDraft(productId);
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
          <RewardAmount
            amount={earnedCoins}
            label={company.coinName}
            size="sm"
            coin={{ icon: company.coinIcon, color: company.coinColor }}
          />
          <Pressable
            style={styles.close}
            onPress={requestClose}
            hitSlop={space.sm}
            accessibilityRole="button"
            accessibilityLabel="Fechar avaliação"
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
              saveDraft(productId, draft);
              navigation.navigate('MauricioChat', { productId });
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
        title="Sair da avaliação?"
        closeLabel="Continuar avaliando"
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
          O que você preencheu até aqui fica guardado enquanto o app estiver aberto. Se descartar,
          começa do zero.
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
