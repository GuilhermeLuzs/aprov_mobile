import type { MauricioMood } from '../../../components/MauricioMascot';

export type GuidePose = 'centered' | 'offCenter';

/**
 * Modelo 3D exportado do Blender (glTF 2.0 binário, .glb).
 *
 * Para ligar: salve o arquivo em assets/models/guide.glb e troque o null por
 *   require('../../../../assets/models/guide.glb')
 *
 * Enquanto for null, a câmera mostra o Maurício 2D no lugar do 3D.
 */
export const GUIDE_MODEL: number | null = null;

/**
 * Nome das Actions do Blender para cada pose. Se não achar pelo nome,
 * usa a 1ª animação do arquivo para "centered" e a 2ª para "offCenter".
 */
export const GUIDE_POSE_CLIPS: Record<GuidePose, string> = {
  centered: 'Centralizado',
  offCenter: 'Descentralizado',
};

/** Fallback 2D: humor do Maurício para cada pose. */
export const GUIDE_POSE_MOODS: Record<GuidePose, MauricioMood> = {
  centered: 'starry',
  offCenter: 'confused',
};
