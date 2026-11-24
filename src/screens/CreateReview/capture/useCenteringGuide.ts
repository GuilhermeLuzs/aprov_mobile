import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import type { CameraView } from 'expo-camera';
import { File } from 'expo-file-system';
import { analyzeFrame, type CenteringHint } from '../../../api/cv';

export type GuideStatus = 'connecting' | 'offline' | 'not_found' | 'off_center' | 'centered';

export type GuideReading = { status: GuideStatus; hint: CenteringHint | null };

// Um quadro a cada ~350 ms, sem empilhar: o próximo só sai quando o anterior volta.
const FRAME_INTERVAL_MS = 350;
const FRAME_QUALITY = 0.3;
// Só troca o que aparece na tela depois de N leituras iguais seguidas.
// Sem isso, o modelo fica piscando entre as duas poses na beira da tolerância.
const STABLE_READINGS = 2;
const FAILURES_UNTIL_OFFLINE = 2;
const RETRY_OFFLINE_MS = 2000;

const INITIAL: GuideReading = { status: 'connecting', hint: null };

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function discard(uri: string) {
  try {
    new File(uri).delete();
  } catch {
    // Arquivo temporário do cache: se não der para apagar, o sistema limpa depois.
  }
}

/**
 * Manda quadros da câmera para o serviço Python e devolve a leitura estável.
 *
 * `withCamera` serializa o acesso à câmera: a foto final e os quadros de
 * análise não podem chamar takePictureAsync ao mesmo tempo.
 */
export function useCenteringGuide(cameraRef: RefObject<CameraView | null>, enabled: boolean) {
  const [reading, setReading] = useState<GuideReading>(INITIAL);
  const lock = useRef<Promise<unknown>>(Promise.resolve());

  const withCamera = useCallback(<T,>(task: (camera: CameraView) => Promise<T>): Promise<T> => {
    const run = lock.current.then(() => {
      const camera = cameraRef.current;
      if (!camera) throw new Error('Câmera indisponível');
      return task(camera);
    });
    lock.current = run.catch(() => undefined);
    return run;
  }, [cameraRef]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let candidate: GuideReading | null = null;
    let streak = 0;
    let failures = 0;

    const commit = (next: GuideReading) => {
      if (candidate && candidate.status === next.status && candidate.hint === next.hint) {
        streak += 1;
      } else {
        candidate = next;
        streak = 1;
      }
      if (streak >= STABLE_READINGS) {
        setReading((current) =>
          current.status === next.status && current.hint === next.hint ? current : next,
        );
      }
    };

    const loop = async () => {
      while (!cancelled) {
        const startedAt = Date.now();
        try {
          const picture = await withCamera((camera) =>
            camera.takePictureAsync({ quality: FRAME_QUALITY, shutterSound: false, exif: false }),
          );
          if (cancelled) {
            discard(picture.uri);
            break;
          }
          const result = await analyzeFrame(picture.uri).finally(() => discard(picture.uri));
          failures = 0;
          if (!result.found) commit({ status: 'not_found', hint: null });
          else if (result.centered) commit({ status: 'centered', hint: null });
          else commit({ status: 'off_center', hint: result.hint });
        } catch (error) {
          if (__DEV__) console.warn('[cv] quadro falhou:', error);
          failures += 1;
          if (failures >= FAILURES_UNTIL_OFFLINE && !cancelled) {
            candidate = null;
            streak = 0;
            setReading({ status: 'offline', hint: null });
            await wait(RETRY_OFFLINE_MS);
            continue;
          }
        }
        await wait(Math.max(0, FRAME_INTERVAL_MS - (Date.now() - startedAt)));
      }
    };

    setReading(INITIAL);
    loop();
    return () => {
      cancelled = true;
    };
  }, [enabled, withCamera]);

  return { reading, withCamera };
}
