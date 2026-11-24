"""Baixa o modelo EfficientDet-Lite0 do MediaPipe para models/."""

from pathlib import Path
from urllib.request import urlretrieve

URL = (
    "https://storage.googleapis.com/mediapipe-models/object_detector/"
    "efficientdet_lite0/int8/1/efficientdet_lite0.tflite"
)
TARGET = Path(__file__).resolve().parent.parent / "models" / "efficientdet_lite0.tflite"


def main() -> None:
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    if TARGET.exists():
        print(f"Já existe: {TARGET}")
        return
    print(f"Baixando {URL}")
    urlretrieve(URL, TARGET)
    print(f"Salvo em {TARGET} ({TARGET.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
