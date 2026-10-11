import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, Trash2 } from 'lucide-react-native';
import { Avatar, BottomSheet, Button, TextField } from '../../components';
import { colors, space, type } from '../../theme';
import { isUsernameInUse, updateProfile, useCurrentUser } from '../../store/session';
import {
  isValidUsername,
  normalizeUsername,
  USERNAME_MAX_LENGTH,
} from '../../utils/validation';
import type { ProfileStackNavigation } from '../../navigation/types';

const NAME_MAX_LENGTH = 50;
const BIO_MAX_LENGTH = 150;
const PICKER_QUALITY = 0.8;

type Form = { name: string; username: string; bio: string; avatarUri: string };
type Errors = Partial<Record<'name' | 'username', string>>;

function validate(form: Form, userId: string): Errors {
  const errors: Errors = {};
  if (form.name.trim() === '') errors.name = 'Informe como quer aparecer no perfil.';
  if (!isValidUsername(form.username)) {
    errors.username = 'Use de 3 a 30 letras, números, ponto ou sublinhado.';
  } else if (isUsernameInUse(form.username, userId)) {
    errors.username = 'Este nome de usuário já está em uso.';
  }
  return errors;
}

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<ProfileStackNavigation<'EditProfile'>>();
  const user = useCurrentUser();
  const [form, setForm] = useState<Form>({
    name: user.name,
    username: user.handle.replace(/^@/, ''),
    bio: user.bio,
    avatarUri: user.avatarUri,
  });
  const [submitted, setSubmitted] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const errors = submitted ? validate(form, user.id) : {};
  const change = (field: keyof Form) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const pick = async (source: 'camera' | 'gallery') => {
    setPhotoOpen(false);
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setPermissionDenied(true);
      return;
    }
    setPermissionDenied(false);
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: PICKER_QUALITY,
    };
    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);
    if (!result.canceled) change('avatarUri')(result.assets[0].uri);
  };

  const removePhoto = () => {
    setPhotoOpen(false);
    change('avatarUri')('');
  };

  const save = () => {
    setSubmitted(true);
    if (Object.keys(validate(form, user.id)).length > 0) return;
    if (updateProfile(form) === 'ok') navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.photo}>
          <Avatar uri={form.avatarUri} name={form.name || user.name} size="lg" bordered />
          <Pressable
            onPress={() => setPhotoOpen(true)}
            hitSlop={space.sm}
            accessibilityRole="button"
            accessibilityLabel="Trocar foto do perfil"
          >
            {({ pressed }) => (
              <Text style={[styles.photoAction, pressed && styles.photoActionPressed]}>
                Trocar foto
              </Text>
            )}
          </Pressable>
          {permissionDenied ? (
            <Text style={styles.permission}>
              Sem permissão para a câmera ou a galeria. Libere nas configurações do celular.
            </Text>
          ) : null}
        </View>

        <TextField
          label="Nome"
          value={form.name}
          onChangeText={change('name')}
          autoCapitalize="words"
          maxLength={NAME_MAX_LENGTH}
          hint="É como você aparece no seu perfil."
          error={errors.name}
        />
        <TextField
          label="Nome de usuário"
          value={form.username}
          onChangeText={(text) => change('username')(normalizeUsername(text))}
          prefix="@"
          autoCapitalize="none"
          maxLength={USERNAME_MAX_LENGTH}
          hint="É como as pessoas encontram você na pesquisa."
          error={errors.username}
        />
        <TextField
          label="Bio"
          value={form.bio}
          onChangeText={change('bio')}
          placeholder="Conte um pouco sobre você"
          multiline
          maxLength={BIO_MAX_LENGTH}
          hint={`${form.bio.length}/${BIO_MAX_LENGTH}`}
        />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
        <Button label="Salvar" fullWidth onPress={save} />
      </View>

      <BottomSheet
        visible={photoOpen}
        title="Foto do perfil"
        closeLabel="Fechar"
        onClose={() => setPhotoOpen(false)}
      >
        <View style={styles.sheet}>
          <Button
            label="Tirar foto"
            icon={Camera}
            variant="secondary"
            fullWidth
            onPress={() => pick('camera')}
          />
          <Button
            label="Escolher da galeria"
            icon={ImageIcon}
            variant="secondary"
            fullWidth
            onPress={() => pick('gallery')}
          />
          {form.avatarUri ? (
            <Button
              label="Remover foto"
              icon={Trash2}
              variant="text"
              fullWidth
              onPress={removePhoto}
            />
          ) : null}
        </View>
      </BottomSheet>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, gap: space.lg },
  photo: { alignItems: 'center', gap: space.sm },
  photoAction: {
    fontFamily: type.bodyBold.family,
    fontSize: type.bodyBold.size,
    lineHeight: type.bodyBold.lineHeight,
    color: colors.primary,
  },
  photoActionPressed: { opacity: 0.6 },
  permission: {
    textAlign: 'center',
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.disagree,
  },
  footer: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  sheet: { paddingHorizontal: space.lg, paddingVertical: space.md, gap: space.sm },
});
