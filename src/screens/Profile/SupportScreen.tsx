import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, EmptyState } from '../../components';
import type { ProfileStackNavigation } from '../../navigation/types';
import { TICKET_STATUS_LABEL, TICKET_TOPICS, useMyTickets } from '../../queries/support';
import { colors, radius, space, type } from '../../theme';
import { formatRelativeTime } from '../../utils/date';

export default function SupportScreen() {
  const navigation = useNavigation<ProfileStackNavigation<'Support'>>();
  const tickets = useMyTickets();
  const openNew = () => navigation.navigate('NewTicket');

  if (tickets.isPending) return <View style={styles.screen} />;

  return (
    <FlatList
      style={styles.screen}
      data={tickets.data ?? []}
      keyExtractor={(ticket) => String(ticket.id)}
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.intro}>Conte o que aconteceu e a equipe da APROV responde por aqui.</Text>
          <Button label="Novo pedido" onPress={openNew} />
        </View>
      }
      ListEmptyComponent={<EmptyState compact title="Nenhum pedido ainda" description="Seus pedidos de ajuda aparecem aqui." />}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => navigation.navigate('Ticket', { ticketId: String(item.id) })}
          accessibilityRole="button"
          accessibilityLabel={`${item.subject}, ${TICKET_STATUS_LABEL[item.status]}`}
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        >
          <Text style={styles.subject} numberOfLines={2}>
            {item.subject}
          </Text>
          <Text style={styles.caption}>
            {TICKET_TOPICS.find((topic) => topic.value === item.topic)?.label} · {formatRelativeTime(item.updatedAt)}
          </Text>
          <Text style={[styles.status, item.status === 'waiting' && styles.statusWaiting]}>{TICKET_STATUS_LABEL[item.status]}</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, gap: space.md },
  header: { gap: space.md, marginBottom: space.sm },
  intro: { fontFamily: type.body.family, fontSize: type.body.size, lineHeight: type.body.lineHeight, color: colors.inkMuted },
  card: { gap: space.xs, padding: space.lg, borderRadius: radius.card, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  cardPressed: { backgroundColor: colors.surfaceAlt },
  subject: { fontFamily: type.subtitle.family, fontSize: type.subtitle.size, lineHeight: type.subtitle.lineHeight, color: colors.ink },
  caption: { fontFamily: type.caption.family, fontSize: type.caption.size, lineHeight: type.caption.lineHeight, color: colors.inkMuted },
  status: { fontFamily: type.micro.family, fontSize: type.micro.size, lineHeight: type.micro.lineHeight, color: colors.agree },
  statusWaiting: { color: colors.primary },
});
