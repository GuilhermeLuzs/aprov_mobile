import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, space, type } from '../theme';
import { REPORT_REASONS, REPORT_REASON_LABEL, type ReportReason } from '../types';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { SelectableCard } from './SelectableCard';
import { TextField } from './TextField';

const DETAILS_MAX_LENGTH = 300;

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (reason: ReportReason, details: string) => Promise<void>;
};

export function ReportSheet({ visible, title, onClose, onSubmit }: Props) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setReason(null);
    setDetails('');
    setSent(false);
    setSending(false);
    setError(null);
  }, [visible]);

  const canSend = reason !== null && (reason !== 'other' || details.trim() !== '') && !sending;

  const send = async () => {
    if (!reason || !canSend) return;
    setError(null);
    setSending(true);
    try {
      await onSubmit(reason, details);
      setSent(true);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Não deu para enviar agora. Tente de novo.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <BottomSheet
        visible={visible}
        title="Denúncia enviada"
        closeLabel="Fechar"
        onClose={onClose}
        footer={<Button label="Entendi" fullWidth onPress={onClose} />}
      >
        <Text style={styles.text}>
          Obrigado por avisar. A equipe da APROV vai analisar, e você não vai mais ver este
          conteúdo.
        </Text>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet
      visible={visible}
      title={title}
      closeLabel="Cancelar denúncia"
      onClose={onClose}
      footer={
        <>
          <Button label="Cancelar" variant="secondary" onPress={onClose} style={styles.footerButton} />
          <Button
            label="Enviar"
            disabled={!canSend}
            onPress={() => void send()}
            style={styles.footerButton}
          />
        </>
      }
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.question}>Qual o problema com este conteúdo?</Text>
        <View style={styles.reasons}>
          {REPORT_REASONS.map((option) => (
            <SelectableCard
              key={option}
              mode="radio"
              selected={reason === option}
              onPress={() => setReason(option)}
              accessibilityLabel={REPORT_REASON_LABEL[option]}
            >
              <Text style={styles.reason}>{REPORT_REASON_LABEL[option]}</Text>
            </SelectableCard>
          ))}
        </View>
        {reason === 'other' ? (
          <TextField
            label="Conte o que aconteceu"
            value={details}
            onChangeText={setDetails}
            multiline
            maxLength={DETAILS_MAX_LENGTH}
            hint={`${details.length}/${DETAILS_MAX_LENGTH}`}
          />
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: space.lg, paddingVertical: space.md, gap: space.md },
  text: {
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.inkMuted,
  },
  question: {
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.inkMuted,
  },
  reasons: { gap: space.sm },
  reason: {
    fontFamily: type.bodyBold.family,
    fontSize: type.bodyBold.size,
    lineHeight: type.bodyBold.lineHeight,
    color: colors.ink,
  },
  footerButton: { flex: 1 },
  error: {
    fontFamily: type.bodyBold.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.disagree,
  },
});
