import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, SendHorizontal } from 'lucide-react-native';
import { Chip, MauricioMascot } from '../../components';
import { colors, icon, mauricioVoice, radius, size, space, type } from '../../theme';
import { mauricioSuggestions } from '../../mocks';
import type { RootStackParamList } from '../../navigation/types';
import { loadDraft } from './draft';
import { greeting, replyTo } from './mauricio';

type Message = { id: string; author: 'mauricio' | 'user'; text: string };

const TYPING_DELAY_MS = 700;
const MESSAGE_MAX_LENGTH = 300;

export default function MauricioChatScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'MauricioChat'>>();
  const draft = loadDraft(route.params.productId);

  const [messages, setMessages] = useState<Message[]>(() => [
    { id: 'm0', author: 'mauricio', text: greeting(draft) },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const send = (raw: string) => {
    const text = raw.trim();
    if (text === '' || typing) return;
    const turn = messages.filter((m) => m.author === 'user').length;
    setMessages((prev) => [...prev, { id: `u${prev.length}`, author: 'user', text }]);
    setInput('');
    setTyping(true);
    timer.current = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: `m${prev.length}`, author: 'mauricio', text: replyTo(text, draft, turn) },
      ]);
      setTyping(false);
    }, TYPING_DELAY_MS);
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + space.sm }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={space.sm}
          accessibilityRole="button"
          accessibilityLabel="Voltar para a avaliação"
          style={styles.back}
        >
          <ArrowLeft size={icon.size.lg} color={colors.ink} strokeWidth={icon.strokeWidth} />
        </Pressable>
        <MauricioMascot size={size.control} />
        <View>
          <Text style={styles.headerTitle}>Maurício</Text>
          <Text style={styles.headerSub}>{typing ? 'digitando...' : 'assistente da APROV'}</Text>
        </View>
      </View>

      <FlatList
        ref={listRef}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={messages}
        keyExtractor={(m) => m.id}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) =>
          item.author === 'mauricio' ? (
            <View style={[styles.bubble, styles.bubbleMauricio]}>
              <Text style={styles.textMauricio}>{item.text}</Text>
            </View>
          ) : (
            <View style={[styles.bubble, styles.bubbleUser]}>
              <Text style={styles.textUser}>{item.text}</Text>
            </View>
          )
        }
        keyboardShouldPersistTaps="handled"
      />

      <View style={[styles.composer, { paddingBottom: insets.bottom + space.sm }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestions}
          keyboardShouldPersistTaps="handled"
        >
          {mauricioSuggestions.map((s) => (
            <Chip key={s} label={s} size="sm" onPress={() => send(s)} />
          ))}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Escreva para o Maurício..."
            placeholderTextColor={colors.inkFaint}
            maxLength={MESSAGE_MAX_LENGTH}
            returnKeyType="send"
            onSubmitEditing={() => send(input)}
          />
          <Pressable
            onPress={() => send(input)}
            disabled={input.trim() === '' || typing}
            accessibilityRole="button"
            accessibilityLabel="Enviar mensagem"
            style={[styles.send, (input.trim() === '' || typing) && styles.sendDisabled]}
          >
            <SendHorizontal size={icon.size.md} color={colors.surface} strokeWidth={icon.strokeWidth} />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  back: {
    width: size.control,
    height: size.control,
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: type.subtitle.family,
    fontSize: type.subtitle.size,
    lineHeight: type.subtitle.lineHeight,
    color: colors.ink,
  },
  headerSub: {
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
  list: { flex: 1 },
  listContent: { padding: space.lg, gap: space.sm },
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.card,
  },
  bubbleMauricio: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: radius.control / 3,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: radius.control / 3,
    backgroundColor: colors.primary,
  },
  textMauricio: {
    fontFamily: mauricioVoice.family,
    fontSize: mauricioVoice.size,
    lineHeight: mauricioVoice.lineHeight,
    color: colors.ink,
  },
  textUser: {
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.surface,
  },
  composer: {
    gap: space.sm,
    paddingTop: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  suggestions: { paddingHorizontal: space.lg, gap: space.sm },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.lg,
  },
  input: {
    flex: 1,
    minHeight: size.control,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    fontFamily: type.body.family,
    fontSize: type.body.size,
    color: colors.ink,
  },
  send: {
    width: size.control,
    height: size.control,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  sendDisabled: { backgroundColor: colors.inkFaint },
});
