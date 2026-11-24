import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, Chip, TextField } from '../../components';
import type { ProfileStackNavigation } from '../../navigation/types';
import { TICKET_TOPICS, openTicket } from '../../queries/support';
import { colors, space, type } from '../../theme';

const SUBJECT_MAX = 120;
const MESSAGE_MAX = 2000;

export default function NewTicketScreen() {
  const navigation = useNavigation<ProfileStackNavigation<'NewTicket'>>();
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const submit = async () => {
    const found: Record<string, string> = {};
    if (!topic) found.topic = 'Escolha o assunto.';
    if (!subject.trim()) found.subject = 'Diga em poucas palavras do que se trata.';
    if (!message.trim()) found.message = 'Conte o que aconteceu.';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSending(true);
    const result = await openTicket({ topic, subject: subject.trim(), message: message.trim() });
    setSending(false);
    if ('ticket' in result) navigation.replace('Ticket', { ticketId: String(result.ticket.id) });
    else setErrors({ ...result.errors, form: Object.keys(result.errors).length === 0 ? result.error : '' });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.group}>
        <Text style={styles.label}>Assunto</Text>
        <View style={styles.chips}>
          {TICKET_TOPICS.map((option) => (
            <Chip key={option.value} label={option.label} selected={topic === option.value} onPress={() => setTopic(option.value)} />
          ))}
        </View>
        {errors.topic ? <Text style={styles.error}>{errors.topic}</Text> : null}
      </View>
      <TextField label="Resumo" value={subject} onChangeText={setSubject} maxLength={SUBJECT_MAX} error={errors.subject} placeholder="Ex.: Cupom recusado no site" />
      <TextField
        label="O que aconteceu"
        value={message}
        onChangeText={setMessage}
        maxLength={MESSAGE_MAX}
        multiline
        error={errors.message}
        placeholder="Conte com detalhes: o que você fez e o que apareceu."
      />
      {errors.form ? <Text style={styles.error}>{errors.form}</Text> : null}
      <Button label={sending ? 'Enviando...' : 'Enviar pedido'} onPress={() => void submit()} disabled={sending} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, gap: space.lg },
  group: { gap: space.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  label: { fontFamily: type.subtitle.family, fontSize: type.caption.size, lineHeight: type.caption.lineHeight, color: colors.ink },
  error: { fontFamily: type.caption.family, fontSize: type.caption.size, lineHeight: type.caption.lineHeight, color: colors.disagree },
});
