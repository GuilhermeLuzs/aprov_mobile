import io

import cv2
import numpy as np
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app

client = TestClient(app)


def jpeg_with_square(cx: float, cy: float, size: float = 0.35, w: int = 480, h: int = 640) -> bytes:
    """Fundo claro liso com um quadrado escuro: fácil de achar pelo contorno."""
    img = np.full((h, w, 3), 235, np.uint8)
    side = int(min(w, h) * size)
    x0, y0 = int(cx * w - side / 2), int(cy * h - side / 2)
    cv2.rectangle(img, (x0, y0), (x0 + side, y0 + side), (40, 40, 40), thickness=-1)
    buf = io.BytesIO()
    Image.fromarray(img).save(buf, format="JPEG", quality=80)
    return buf.getvalue()


def post(data: bytes):
    return client.post("/analyze", files={"image": ("frame.jpg", data, "image/jpeg")})


def test_health():
    assert client.get("/health").json()["ok"] is True


def test_objeto_no_centro():
    body = post(jpeg_with_square(0.5, 0.5)).json()
    assert body["found"]
    assert body["centered"], body


def test_objeto_a_esquerda():
    body = post(jpeg_with_square(0.2, 0.5, size=0.3)).json()
    assert body["found"]
    assert body["hint"] == "move_left", body


def test_imagem_invalida():
    assert post(b"nao sou um jpeg").status_code == 400
