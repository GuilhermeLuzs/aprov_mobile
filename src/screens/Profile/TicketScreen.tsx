import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import {
  Button,
  EmptyState,
  LoadingState,
  TextField,
} from '../../components';
import type { ProfileStackParamList } from '../../navigation/types';
import { TICKET_STATUS_LABEL, replyTicket, useTicket } from '../../queries/support';
import { colors, radius, space, type } from '../../theme';
import { formatRelativeTime } from '../../utils/date';

const MESSAGE_MAX = 2000;

export default function TicketScreen() {
  const { ticketId } = useRoute<RouteProp<ProfileStackParamList, 'Ticket'>>().params;
  const ticket = useTicket(ticketId);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [sending, setSending] = useState(false);

  if (ticket.isPending) return <LoadingState fill />;
  if (!ticket.data) return <EmptyState mood="confused" title="Pedido não encontrado" />;

  const send = async () => {
    if (!text.trim()) {
      setError('Escreva a mensagem.');
      return;
    }
    setSending(true);
    const result = await replyTicket(ticketId, text.trim());
    setSending(false);
    if ('ticket' in result) {
      setText('');
      setError(undefined);
    } else setError(result.errors.text ?? result.error);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.subject}>{ticket.data.subject}</Text>
        <Text style={styles.status}>{TICKET_STATUS_LABEL[ticket.data.status]}</Text>
      </View>
      {ticket.data.messages.map((message) => (
        <View key={message.id} style={[styles.bubble, message.fromSupport ? styles.bubbleSupport : styles.bubbleMine]}>
          <Text style={styles.author}>
            {message.fromSupport ? 'Equipe da APROV' : 'Você'} · {formatRelativeTime(message.createdAt)}
          </Text>
          <Text style={styles.body}>{message.text}</Text>
        </View>
      ))}
      <TextField label="Responder" value={text} onChangeText={setText} maxLength={MESSAGE_MAX} multiline error={error} placeholder="Escreva sua mensagem." />
      <Button label={sending ? 'Enviando...' : 'Enviar'} onPress={() => void send()} disabled={sending} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, gap: space.md },
  header: { gap: space.xs },
  subject: { fontFamily: type.title.family, fontSize: type.title.size, lineHeight: type.title.lineHeight, color: colors.ink },
  status: { fontFamily: type.caption.family, fontSize: type.caption.size, lineHeight: type.caption.lineHeight, color: colors.inkMuted },
  bubble: { gap: space.xs, padding: space.md, borderRadius: radius.card, maxWidth: '90%' },
  bubbleMine: { alignSelf: 'flex-end', backgroundColor: colors.primaryDim },
  bubbleSupport: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  author: { fontFamily: type.micro.family, fontSize: type.micro.size, lineHeight: type.micro.lineHeight, color: colors.inkMuted },
  body: { fontFamily: type.body.family, fontSize: type.body.size, lineHeight: type.body.lineHeight, color: colors.ink },
});
