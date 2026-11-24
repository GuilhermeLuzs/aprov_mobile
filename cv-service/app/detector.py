"""Acha o produto principal no quadro.

1. MediaPipe Object Detector (EfficientDet-Lite, classes do COCO), se o modelo
   .tflite estiver em models/. Ele reconhece objetos comuns (garrafa, celular,
   copo, notebook, livro...).
2. Se o MediaPipe não estiver disponível ou não achar nada, um fallback em
   OpenCV pega o maior contorno do quadro como "objeto principal".
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from pathlib import Path

import cv2
import numpy as np

from .centering import Box

log = logging.getLogger(__name__)

MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "efficientdet_lite0.tflite"

# Coisas que aparecem na foto mas nunca são o produto avaliado.
IGNORED_LABELS = {"person", "dining table", "bed", "couch", "chair", "bench", "toilet"}

MIN_SCORE = 0.35
# Caixas menores que isso são ruído (ou um objeto lá no fundo).
MIN_BOX_AREA = 0.02
# Contornos que encostam em 3 ou mais bordas são o fundo, não um objeto.
MAX_TOUCHED_EDGES = 2
EDGE_MARGIN = 0.01


@dataclass(frozen=True)
class Detection:
    box: Box
    label: str
    score: float
    source: str  # "mediapipe" | "opencv"


class ProductDetector:
    def __init__(self, model_path: Path = MODEL_PATH) -> None:
        self._mp_detector = self._load_mediapipe(model_path)

    @property
    def uses_mediapipe(self) -> bool:
        return self._mp_detector is not None

    def detect(self, rgb: np.ndarray) -> Detection | None:
        """Recebe a imagem em RGB (H x W x 3, uint8)."""
        found = self._detect_mediapipe(rgb) if self._mp_detector else None
        return found or self._detect_opencv(rgb)

    # MediaPipe ---------------------------------------------------------------

    @staticmethod
    def _load_mediapipe(model_path: Path):
        if not model_path.exists():
            log.warning(
                "Modelo %s não encontrado; usando só o fallback OpenCV. "
                "Rode: python scripts/download_model.py",
                model_path,
            )
            return None
        try:
            from mediapipe.tasks import python as mp_python
            from mediapipe.tasks.python import vision

            options = vision.ObjectDetectorOptions(
                base_options=mp_python.BaseOptions(model_asset_path=str(model_path)),
                score_threshold=MIN_SCORE,
                max_results=8,
            )
            return vision.ObjectDetector.create_from_options(options)
        except Exception:  # noqa: BLE001 - qualquer falha cai no fallback
            log.exception("Falha ao carregar o MediaPipe; usando só o fallback OpenCV.")
            return None

    def _detect_mediapipe(self, rgb: np.ndarray) -> Detection | None:
        import mediapipe as mp

        height, width = rgb.shape[:2]
        image = mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(rgb))
        result = self._mp_detector.detect(image)

        best: Detection | None = None
        best_rank = 0.0
        for det in result.detections:
            category = det.categories[0]
            label = category.category_name or "objeto"
            if label in IGNORED_LABELS:
                continue
            bb = det.bounding_box
            box = _clamp_box(
                bb.origin_x / width, bb.origin_y / height, bb.width / width, bb.height / height
            )
            if box.area < MIN_BOX_AREA:
                continue
            # Prefere o que tem mais confiança, desempatando pelo tamanho:
            # o produto costuma ser o maior objeto perto da câmera.
            rank = category.score * box.area**0.5
            if rank > best_rank:
                best_rank = rank
                best = Detection(box=box, label=label, score=round(category.score, 3), source="mediapipe")
        return best

    # OpenCV ------------------------------------------------------------------

    @staticmethod
    def _detect_opencv(rgb: np.ndarray) -> Detection | None:
        height, width = rgb.shape[:2]
        gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
        gray = cv2.GaussianBlur(gray, (5, 5), 0)

        # Limiares do Canny a partir da mediana: funciona em luz forte e fraca.
        median = float(np.median(gray))
        edges = cv2.Canny(gray, int(max(0, 0.66 * median)), int(min(255, 1.33 * median)))
        edges = cv2.dilate(edges, np.ones((5, 5), np.uint8), iterations=2)
        edges = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))

        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        best: Box | None = None
        best_area = 0.0
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            box = _clamp_box(x / width, y / height, w / width, h / height)
            if box.area < MIN_BOX_AREA or _touched_edges(box) > MAX_TOUCHED_EDGES:
                continue
            area = cv2.contourArea(contour) / (width * height)
            if area > best_area:
                best_area = area
                best = box

        if best is None:
            return None
        return Detection(box=best, label="objeto", score=0.3, source="opencv")


def _clamp_box(x: float, y: float, w: float, h: float) -> Box:
    x0, y0 = max(0.0, x), max(0.0, y)
    x1, y1 = min(1.0, x + w), min(1.0, y + h)
    return Box(x=x0, y=y0, w=max(0.0, x1 - x0), h=max(0.0, y1 - y0))


def _touched_edges(box: Box) -> int:
    return sum(
        (
            box.x <= EDGE_MARGIN,
            box.y <= EDGE_MARGIN,
            box.x + box.w >= 1 - EDGE_MARGIN,
            box.y + box.h >= 1 - EDGE_MARGIN,
        )
    )
