import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Heart, UserX } from 'lucide-react-native';
import { BottomSheet, Button, MenuRow, SectionHeader } from '../../components';
import { colors, space, type } from '../../theme';
import { usePreferences } from '../../store/preferences';
import { deactivateAccount } from '../../store/session';
import type { ProfileStackNavigation } from '../../navigation/types';

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

export default function SettingsScreen() {
  const navigation = useNavigation<ProfileStackNavigation<'Settings'>>();
  const preferences = usePreferences();
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  const hasInterests = preferences.categories.length + preferences.companyIds.length > 0;
  const interestsDetail = hasInterests
    ? `${plural(preferences.categories.length, 'categoria', 'categorias')} · ${plural(preferences.companyIds.length, 'empresa', 'empresas')}`
    : 'Ainda não escolhidos';

  const deactivate = () => {
    setConfirmDeactivate(false);
    deactivateAccount();
    navigation.getParent()?.getParent()?.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.group}>
          <SectionHeader title="Preferências" />
          <MenuRow
            Icon={Heart}
            label="Meus interesses"
            detail={interestsDetail}
            onPress={() => navigation.navigate('EditInterests')}
          />
        </View>

        <View style={styles.group}>
          <SectionHeader title="Conta" />
          <MenuRow
            Icon={UserX}
            label="Desativar conta"
            detail="Seu perfil e o que você publicou somem da APROV"
            destructive
            onPress={() => setConfirmDeactivate(true)}
          />
        </View>
      </ScrollView>

      <BottomSheet
        visible={confirmDeactivate}
        title="Desativar conta?"
        closeLabel="Manter conta"
        onClose={() => setConfirmDeactivate(false)}
        footer={
          <>
            <Button
              label="Cancelar"
              variant="secondary"
              onPress={() => setConfirmDeactivate(false)}
              style={styles.sheetButton}
            />
            <Button label="Desativar" onPress={deactivate} style={styles.sheetButton} />
          </>
        }
      >
        <Text style={styles.sheetText}>
          Seu perfil, suas avaliações e seus comentários somem da APROV, e você não consegue mais
          entrar com esta conta.
        </Text>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, gap: space.xl },
  group: { gap: space.xs },
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
