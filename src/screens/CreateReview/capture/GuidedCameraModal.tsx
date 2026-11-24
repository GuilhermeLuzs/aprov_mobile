import { useCallback, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  X,
  ZoomIn,
  ZoomOut,
  type LucideIcon,
} from 'lucide-react-native';
import { Button } from '../../../components';
import { colors, icon, radius, space, type } from '../../../theme';
import type { CenteringHint } from '../../../api/cv';
import { GuideModel } from './GuideModel';
import { useCenteringGuide, type GuideReading } from './useCenteringGuide';

export type CapturedPhoto = { uri: string; width: number; height: number };

type Props = {
  visible: boolean;
  onClose: () => void;
  onCapture: (photo: CapturedPhoto) => void;
};

const PHOTO_QUALITY = 0.8;
// Resolução máxima da foto: suficiente para a avaliação e deixa cada quadro
// de análise leve para tirar e enviar.
const MAX_PICTURE_SIDE = 1920;
const FRAME_WIDTH_RATIO = 0.72;
const FRAME_HEIGHT_RATIO = 0.42;
const MODEL_SIZE = 128;
const SHUTTER_SIZE = 72;

const HINT_TEXT: Record<CenteringHint, string> = {
  move_left: 'Mova a câmera para a esquerda',
  move_right: 'Mova a câmera para a direita',
  move_up: 'Mova a câmera para cima',
  move_down: 'Mova a câmera para baixo',
  closer: 'Aproxime a câmera do produto',
  farther: 'Afaste um pouco a câmera',
};

const HINT_ICON: Record<CenteringHint, LucideIcon> = {
  move_left: ArrowLeft,
  move_right: ArrowRight,
  move_up: ArrowUp,
  move_down: ArrowDown,
  closer: ZoomIn,
  farther: ZoomOut,
};

function message({ status, hint }: GuideReading): string {
  switch (status) {
    case 'connecting':
      return 'Procurando o produto...';
    case 'offline':
      return 'Guia indisponível. Você ainda pode tirar a foto.';
    case 'not_found':
      return 'Aponte a câmera para o produto';
    case 'centered':
      return 'Perfeito! Pode tirar a foto.';
    case 'off_center':
      return hint ? HINT_TEXT[hint] : 'Centralize o produto na moldura';
  }
}

function frameColor(status: GuideReading['status']): string {
  if (status === 'centered') return colors.agree;
  if (status === 'off_center' || status === 'not_found') return colors.primaryBright;
  return colors.surface;
}

/** Escolhe a maior resolução "LARGURAxALTURA" que não passa do limite. */
function pickPictureSize(sizes: string[]): string | undefined {
  let best: { size: string; side: number } | undefined;
  for (const size of sizes) {
    const match = /^(\d+)x(\d+)$/.exec(size);
    if (!match) continue;
    const side = Math.max(Number(match[1]), Number(match[2]));
    if (side <= MAX_PICTURE_SIDE && (!best || side > best.side)) best = { size, side };
  }
  return best?.size;
}

export function GuidedCameraModal({ visible, onClose, onCapture }: Props) {
  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      {visible ? <GuidedCamera onClose={onClose} onCapture={onCapture} /> : null}
    </Modal>
  );
}

function GuidedCamera({ onClose, onCapture }: Omit<Props, 'visible'>) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [ready, setReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [pictureSize, setPictureSize] = useState<string>();

  const { reading, withCamera } = useCenteringGuide(cameraRef, ready && !capturing);
  const centered = reading.status === 'centered';
  const tint = frameColor(reading.status);
  const HintIcon = reading.hint ? HINT_ICON[reading.hint] : null;

  const onCameraReady = useCallback(async () => {
    try {
      const sizes = (await cameraRef.current?.getAvailablePictureSizesAsync()) ?? [];
      const size = pickPictureSize(sizes);
      if (size) setPictureSize(size);
    } catch {
      // Sem a lista de tamanhos, fica no padrão do aparelho.
    }
    setReady(true);
  }, []);

  const takePhoto = useCallback(async () => {
    if (capturing) return;
    setCapturing(true);
    try {
      const photo = await withCamera((camera) =>
        camera.takePictureAsync({ quality: PHOTO_QUALITY, shutterSound: true }),
      );
      onCapture({ uri: photo.uri, width: photo.width, height: photo.height });
      onClose();
    } catch {
      setCapturing(false);
    }
  }, [capturing, onCapture, onClose, withCamera]);

  if (!permission) return <View style={styles.root} />;

  if (!permission.granted) {
    return (
      <View style={[styles.root, styles.permission, { paddingTop: insets.top + space.xl }]}>
        <Text style={styles.permissionTitle}>A APROV precisa da sua câmera</Text>
        <Text style={styles.permissionBody}>
          É com ela que você fotografa o produto. O Maurício te ajuda a deixar tudo centralizado.
        </Text>
        <Button label="Permitir câmera" tone="onBrand" onPress={requestPermission} fullWidth />
        <Button label="Agora não" variant="text" tone="onBrand" onPress={onClose} fullWidth />
      </View>
    );
  }

  const frameWidth = width * FRAME_WIDTH_RATIO;
  const frameHeight = height * FRAME_HEIGHT_RATIO;

  return (
    <View style={styles.root}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        animateShutter={false}
        pictureSize={pictureSize}
        onCameraReady={onCameraReady}
      />

      {/* Moldura guia no centro exato: é o mesmo centro que o serviço usa. */}
      <View style={styles.frameLayer} pointerEvents="none">
        <View
          style={[styles.frame, { width: frameWidth, height: frameHeight, borderColor: tint }]}
          accessible
          accessibilityLabel={centered ? 'Produto centralizado' : 'Produto fora do centro'}
        />
        {HintIcon ? (
          <View style={[styles.hintBadge, { backgroundColor: tint }]}>
            <HintIcon size={icon.size.lg} color={colors.surface} strokeWidth={icon.strokeWidth} />
          </View>
        ) : null}
      </View>

      <View style={[styles.topBar, { paddingTop: insets.top + space.sm }]}>
        <Pressable
          onPress={onClose}
          style={styles.close}
          hitSlop={space.sm}
          accessibilityRole="button"
          accessibilityLabel="Fechar câmera"
        >
          <X size={icon.size.lg} color={colors.surface} strokeWidth={icon.strokeWidth} />
        </Pressable>
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + space.lg }]}>
        <View style={styles.guideRow}>
          <GuideModel pose={centered ? 'centered' : 'offCenter'} size={MODEL_SIZE} />
          <View style={styles.bubble} accessibilityLiveRegion="polite">
            <Text style={styles.bubbleText}>{message(reading)}</Text>
          </View>
        </View>

        <Pressable
          onPress={takePhoto}
          disabled={!ready || capturing}
          accessibilityRole="button"
          accessibilityLabel="Tirar foto"
          style={({ pressed }) => [
            styles.shutter,
            { borderColor: centered ? colors.agree : colors.surface },
            (pressed || capturing) && styles.shutterPressed,
          ]}
        >
          <View style={[styles.shutterInner, centered && { backgroundColor: colors.agree }]} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.mediaBackdrop },
  frameLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    borderWidth: 3,
    borderRadius: radius.card,
  },
  hintBadge: {
    position: 'absolute',
    padding: space.sm,
    borderRadius: radius.pill,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: space.lg,
    flexDirection: 'row',
  },
  close: {
    padding: space.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.mediaControl,
  },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: space.lg,
    alignItems: 'center',
    gap: space.lg,
  },
  guideRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  bubble: {
    flex: 1,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.control,
    backgroundColor: colors.mediaControl,
  },
  bubbleText: {
    fontFamily: type.bodyBold.family,
    fontSize: type.bodyBold.size,
    lineHeight: type.bodyBold.lineHeight,
    color: colors.surface,
  },
  shutter: {
    width: SHUTTER_SIZE,
    height: SHUTTER_SIZE,
    borderRadius: radius.pill,
    borderWidth: 4,
    padding: space.xs,
  },
  shutterPressed: { opacity: 0.6 },
  shutterInner: {
    flex: 1,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  permission: {
    paddingHorizontal: space.lg,
    gap: space.md,
    backgroundColor: colors.primary,
  },
  permissionTitle: {
    fontFamily: type.title.family,
    fontSize: type.title.size,
    lineHeight: type.title.lineHeight,
    color: colors.surface,
  },
  permissionBody: {
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.surface,
    marginBottom: space.md,
  },
});
