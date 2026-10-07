import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Video, X } from 'lucide-react-native';
import { Button } from '../../../components';
import { colors, icon, radius, space, type } from '../../../theme';
import type { Product } from '../../../types';
import { MAX_MEDIA, mediaRequired, type Draft, type DraftMedia } from '../draft';
import { StepHeading } from './StepHeading';

type Props = {
  draft: Draft;
  update: (patch: Partial<Draft>) => void;
  product: Product;
  bonus: string;
};

const COLUMNS = 3;
const PICKER_QUALITY = 0.8;
const MS_PER_SECOND = 1000;

function toDraftMedia(asset: ImagePicker.ImagePickerAsset, index: number): DraftMedia {
  return {
    id: asset.assetId ?? `${Date.now()}-${index}`,
    kind: asset.type === 'video' ? 'video' : 'photo',
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
    durationSeconds: asset.duration ? asset.duration / MS_PER_SECOND : 0,
  };
}

export function StepMedia({ draft, update, product, bonus }: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const [permissionDenied, setPermissionDenied] = useState(false);

  const required = mediaRequired(product.kind);
  const remaining = MAX_MEDIA - draft.media.length;
  const tileSize = Math.floor((screenWidth - space.lg * 2 - space.sm * (COLUMNS - 1)) / COLUMNS);
  const noun = product.kind === 'service' ? 'do serviço' : 'do produto';

  const add = (assets: ImagePicker.ImagePickerAsset[]) => {
    const added = assets.slice(0, remaining).map(toDraftMedia);
    update({ media: [...draft.media, ...added] });
  };

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setPermissionDenied(true);
      return;
    }
    setPermissionDenied(false);
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images', 'videos'],
      quality: PICKER_QUALITY,
    });
    if (!result.canceled) add(result.assets);
  };

  const openGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setPermissionDenied(true);
      return;
    }
    setPermissionDenied(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: PICKER_QUALITY,
    });
    if (!result.canceled) add(result.assets);
  };

  const remove = (id: string) => update({ media: draft.media.filter((m) => m.id !== id) });

  return (
    <View style={styles.wrap}>
      <StepHeading
        title={`Foto ou vídeo ${noun}`}
        bonus={bonus}
        hint={
          required
            ? 'Obrigatório para produtos: a foto mostra que a compra aconteceu.'
            : 'Opcional para serviços. Uma foto do resultado ajuda quem vai contratar.'
        }
      />

      {remaining > 0 ? (
        <View style={styles.actions}>
          <Button label="Abrir câmera" variant="secondary" icon={Camera} fullWidth onPress={openCamera} />
          <Button label="Escolher da galeria" variant="text" fullWidth onPress={openGallery} />
        </View>
      ) : (
        <Text style={styles.note}>Você chegou ao limite de {MAX_MEDIA} fotos ou vídeos.</Text>
      )}

      {permissionDenied ? (
        <Text style={styles.warning}>
          Sem permissão de acesso. Libere a câmera e as fotos para a APROV nas configurações do
          aparelho.
        </Text>
      ) : null}

      {draft.media.length > 0 ? (
        <View>
          <Text style={styles.sectionTitle}>
            Prévias ({draft.media.length} de {MAX_MEDIA})
          </Text>
          <View style={styles.grid}>
            {draft.media.map((m) => (
              <View key={m.id} style={[styles.tile, { width: tileSize, height: tileSize }]}>
                {m.kind === 'photo' ? (
                  <Image source={{ uri: m.uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                ) : (
                  <View style={styles.videoTile}>
                    <Video size={icon.size.lg} color={colors.surface} strokeWidth={icon.strokeWidth} />
                  </View>
                )}
                <Pressable
                  style={styles.remove}
                  onPress={() => remove(m.id)}
                  hitSlop={space.xs}
                  accessibilityRole="button"
                  accessibilityLabel={m.kind === 'photo' ? 'Remover foto' : 'Remover vídeo'}
                >
                  <X size={icon.size.sm} color={colors.surface} strokeWidth={icon.strokeWidth} />
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.lg },
  actions: { gap: space.sm },
  note: {
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.inkMuted,
  },
  warning: {
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.disagree,
  },
  sectionTitle: {
    marginBottom: space.sm,
    fontFamily: type.bodyBold.family,
    fontSize: type.bodyBold.size,
    lineHeight: type.bodyBold.lineHeight,
    color: colors.ink,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  tile: {
    borderRadius: radius.control,
    overflow: 'hidden',
    backgroundColor: colors.surfaceAlt,
  },
  videoTile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ink,
  },
  remove: {
    position: 'absolute',
    top: space.xs,
    right: space.xs,
    padding: space.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.scrim,
  },
});
