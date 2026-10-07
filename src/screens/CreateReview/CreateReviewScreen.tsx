import { useState } from 'react';
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
import { BottomSheet, Button, EmptyState, RewardAmount, Stepper } from '../../components';
import { colors, icon, size, space, type } from '../../theme';
import { aprovPointsPerReview, companies, products } from '../../mocks';
import type { RootStackParamList } from '../../navigation/types';
import {
  TOTAL_STEPS,
  clearDraft,
  commentDone,
  isDirty,
  loadDraft,
  mediaDone,
  mediaRequired,
  saveDraft,
  starsDone,
  tagsDone,
  type Draft,
} from './draft';
import { STEP_SHARE, earnedRewards, stepBonus, type Rewards } from './rewards';
import { StepStars } from './steps/StepStars';
import { StepTags } from './steps/StepTags';
import { StepMedia } from './steps/StepMedia';
import { StepComment } from './steps/StepComment';
import { StepPreview } from './steps/StepPreview';
import { Conclusion } from './Conclusion';

export default function CreateReviewScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'CreateReview'>>();
  const route = useRoute<RouteProp<RootStackParamList, 'CreateReview'>>();
  const { productId } = route.params;

  const product = products.find((p) => p.id === productId);
  const company = product ? companies.find((c) => c.id === product.companyId) : undefined;

  const [draft, setDraft] = useState<Draft>(() => loadDraft(productId));
  const [published, setPublished] = useState<Rewards | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  if (!product || !company) {
    return (
      <View style={[styles.notFound, { paddingTop: insets.top }]}>
        <EmptyState
          title="Item não encontrado"
          description="Não dá para avaliar este item agora."
          action={{ label: 'Fechar', onPress: () => navigation.goBack() }}
        />
      </View>
    );
  }

  if (published) {
    return <Conclusion company={company} rewards={published} onReviewAnother={() => navigation.goBack()} />;
  }

  const update = (patch: Partial<Draft>) => {
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      saveDraft(productId, next);
      return next;
    });
  };

  const full: Rewards = {
    coins: product.coinsReward,
    points: aprovPointsPerReview,
    xp: product.xpReward,
  };
  const earned = earnedRewards(draft, full);
  const bonusLabel = (share: number) => `+${stepBonus(full.coins, share)} ${company.coinName}`;

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
    step === TOTAL_STEPS ? 'Publicar avaliação' : skippable && canAdvance ? 'Pular' : 'Continuar';

  const advance = () => {
    if (step < TOTAL_STEPS) {
      update({ step: step + 1 });
      return;
    }
    clearDraft(productId);
    setPublished(earned);
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
          <RewardAmount amount={earned.coins} label={company.coinName} size="sm" />
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
          <StepStars draft={draft} update={update} product={product} bonus={bonusLabel(STEP_SHARE.stars)} />
        ) : null}
        {step === 2 ? (
          <StepTags draft={draft} update={update} product={product} bonus={bonusLabel(STEP_SHARE.tags)} />
        ) : null}
        {step === 3 ? (
          <StepMedia draft={draft} update={update} product={product} bonus={bonusLabel(STEP_SHARE.media)} />
        ) : null}
        {step === 4 ? (
          <StepComment
            draft={draft}
            update={update}
            product={product}
            bonus={bonusLabel(STEP_SHARE.comment)}
            onOpenChat={() => {
              saveDraft(productId, draft);
              navigation.navigate('MauricioChat', { productId });
            }}
          />
        ) : null}
        {step === 5 ? (
          <StepPreview draft={draft} update={update} product={product} company={company} />
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
        {step > 1 ? (
          <Button label="Voltar" variant="text" onPress={() => update({ step: step - 1 })} />
        ) : null}
        <View style={styles.footerPrimary}>
          <Button label={primaryLabel} fullWidth disabled={!canAdvance} onPress={advance} />
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  footerPrimary: { flex: 1 },
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
