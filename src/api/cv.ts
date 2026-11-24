import Constants from 'expo-constants';
import { File } from 'expo-file-system';

// Serviço Python em cv-service/. Rode com:
//   uvicorn app.main:app --host 0.0.0.0 --port 8000
const CV_PORT = 8002;
const CV_TIMEOUT_MS = 3000;

/**
 * Em desenvolvimento, o celular precisa falar com o PC pelo IP da rede local.
 * O Expo já sabe esse IP (é de onde ele baixa o bundle), então reaproveita.
 * Para apontar para outro lugar, defina EXPO_PUBLIC_CV_URL no .env.
 */
function resolveCvBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_CV_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  return `http://${host ?? '127.0.0.1'}:${CV_PORT}`;
}

export const CV_BASE_URL = resolveCvBaseUrl();

if (__DEV__) console.log(`[cv] serviço em ${CV_BASE_URL}`);

/** Para onde mover a câmera. */
export type CenteringHint =
  | 'move_left'
  | 'move_right'
  | 'move_up'
  | 'move_down'
  | 'closer'
  | 'farther';

export type FrameAnalysis = {
  found: boolean;
  centered: boolean;
  hint: CenteringHint | null;
  /** Caixa normalizada [x, y, largura, altura], 0 a 1. */
  bbox: [number, number, number, number] | null;
  label: string | null;
  confidence: number;
};

export async function analyzeFrame(uri: string): Promise<FrameAnalysis> {
  const body = new FormData();
  // O fetch do Expo não aceita o formato antigo { uri, name, type } no
  // FormData ("Unsupported FormDataPart implementation"). Ele lê os bytes de
  // um File do expo-file-system.
  body.append('image', new File(uri) as unknown as Blob);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CV_TIMEOUT_MS);
  try {
    const response = await fetch(`${CV_BASE_URL}/analyze`, {
      method: 'POST',
      body,
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`CV respondeu ${response.status}`);
    return (await response.json()) as FrameAnalysis;
  } finally {
    clearTimeout(timeout);
  }
}
