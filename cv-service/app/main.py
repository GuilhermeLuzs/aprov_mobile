"""API de centralização do produto para a câmera guiada do app APROV.

Rodar (de dentro de cv-service/):
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
"""

from __future__ import annotations

import io
import logging

import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageOps, UnidentifiedImageError
from pydantic import BaseModel

from .centering import Hint, evaluate
from .detector import ProductDetector

logging.basicConfig(level=logging.INFO)

# O app manda quadros pequenos, mas se vier uma foto cheia, reduz antes de
# analisar: a detecção não ganha nada com 12 MP e fica bem mais lenta.
MAX_SIDE = 640
MAX_UPLOAD_BYTES = 8 * 1024 * 1024

app = FastAPI(title="APROV CV", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

detector = ProductDetector()


class Analysis(BaseModel):
    found: bool
    centered: bool
    hint: Hint | None
    # Caixa normalizada [x, y, largura, altura], 0 a 1.
    bbox: tuple[float, float, float, float] | None
    label: str | None
    confidence: float
    source: str | None
    dx: float
    dy: float
    area: float


@app.get("/health")
def health() -> dict[str, object]:
    return {"ok": True, "mediapipe": detector.uses_mediapipe}


@app.post("/analyze", response_model=Analysis)
async def analyze(image: UploadFile = File(...)) -> Analysis:
    data = await image.read()
    if not data:
        raise HTTPException(status_code=400, detail="Imagem vazia.")
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Imagem grande demais.")

    rgb = _decode(data)
    detection = detector.detect(rgb)
    result = evaluate(detection.box if detection else None)

    return Analysis(
        found=result.found,
        centered=result.centered,
        hint=result.hint,
        bbox=(
            (detection.box.x, detection.box.y, detection.box.w, detection.box.h) if detection else None
        ),
        label=detection.label if detection else None,
        confidence=detection.score if detection else 0.0,
        source=detection.source if detection else None,
        dx=result.dx,
        dy=result.dy,
        area=result.area,
    )


def _decode(data: bytes) -> np.ndarray:
    try:
        img = Image.open(io.BytesIO(data))
        # Respeita a orientação do EXIF: sem isso, uma foto em retrato pode
        # chegar deitada e as dicas de esquerda/direita viram cima/baixo.
        img = ImageOps.exif_transpose(img)
        img = img.convert("RGB")
    except (UnidentifiedImageError, OSError) as exc:
        raise HTTPException(status_code=400, detail="Não consegui ler a imagem.") from exc

    img.thumbnail((MAX_SIDE, MAX_SIDE))
    return np.asarray(img)
