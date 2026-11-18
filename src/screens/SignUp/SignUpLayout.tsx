import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandBackdrop, BrandLockup, Button, Stepper } from '../../components';
import { colors, radius, space, type } from '../../theme';
import { SIGN_UP_STEPS } from './SignUpContext';

type Props = {
  step: number;
  title: string;
  subtitle?: string;
  onBack: () => void;
  primaryLabel: string;
  primaryDisabled?: boolean;
  onPrimary: () => void;
  children: ReactNode;
};

export function SignUpLayout({
  step,
  title,
  subtitle,
  onBack,
  primaryLabel,
  primaryDisabled = false,
  onPrimary,
  children,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <BrandBackdrop textured={false} style={[styles.brand, { paddingTop: insets.top + space.lg }]}>
        <BrandLockup />
      </BrandBackdrop>

      <View style={styles.sheet}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Cadastro</Text>
          <Button label="Voltar" variant="text" size="sm" onPress={onBack} />
        </View>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Stepper current={step} total={SIGN_UP_STEPS} />
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          <View style={styles.form}>{children}</View>
        </ScrollView>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
        <Button label={primaryLabel} fullWidth disabled={primaryDisabled} onPress={onPrimary} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  brand: { paddingBottom: space.xl + space.lg },
  sheet: {
    flex: 1,
    marginTop: -space.lg,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    overflow: 'hidden',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: space.lg,
    paddingRight: space.sm,
    paddingTop: space.lg,
  },
  sheetTitle: {
    fontFamily: type.title.family,
    fontSize: type.title.size,
    lineHeight: type.title.lineHeight,
    color: colors.ink,
  },
  content: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.xl,
  },
  title: {
    marginTop: space.lg,
    fontFamily: type.title.family,
    fontSize: type.title.size,
    lineHeight: type.title.lineHeight,
    color: colors.ink,
  },
  subtitle: {
    marginTop: space.xs,
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.inkMuted,
  },
  form: { marginTop: space.xl, gap: space.lg },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
  },
});
