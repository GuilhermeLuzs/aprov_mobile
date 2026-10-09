import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Stepper } from '../../components';
import { colors, space, type } from '../../theme';
import { SIGN_UP_STEPS } from './SignUpContext';

type Props = {
  step: number;
  title: string;
  subtitle?: string;
  onBack: () => void;
  primaryLabel: string;
  onPrimary: () => void;
  children: ReactNode;
};

export function SignUpLayout({
  step,
  title,
  subtitle,
  onBack,
  primaryLabel,
  onPrimary,
  children,
}: Props) {
  const insets = useSafeAreaInsets();
  const top = insets.top + space.xs;

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.topRow, { paddingTop: top }]}>
        <View style={[styles.flowTitleWrap, { top }]} pointerEvents="none">
          <Text style={styles.flowTitle}>Cadastro</Text>
        </View>
        <Button variant="text" label="Voltar" onPress={onBack} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Stepper current={step} total={SIGN_UP_STEPS} />
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <View style={styles.form}>{children}</View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
        <Button label={primaryLabel} fullWidth onPress={onPrimary} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  topRow: { alignItems: 'flex-start', paddingHorizontal: space.sm },
  flowTitleWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowTitle: {
    fontFamily: type.bodyBold.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
  content: { paddingHorizontal: space.lg, paddingTop: space.sm, paddingBottom: space.xl },
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
