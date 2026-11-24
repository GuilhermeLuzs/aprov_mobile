# cv-service — centralização do produto

Serviço Python que a câmera guiada do app usa para saber se o produto está
centralizado. O app manda um quadro da câmera a cada ~350 ms. O serviço acha o
produto (MediaPipe, com OpenCV como reserva) e devolve se está no centro e para
onde mover a câmera.

## Rodar

```powershell
cd cv-service
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe scripts\download_model.py
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

- Use `--host 0.0.0.0`: o celular acessa pelo IP do PC na rede.
- No Windows, libere a porta 8000 no firewall na primeira vez.
- O app descobre o IP sozinho (o mesmo que o Expo usa). Para apontar para
  outro endereço, crie `.env.local` na raiz do app com
  `EXPO_PUBLIC_CV_URL=http://SEU_IP:8000`.
- Teste rápido: abra `http://SEU_IP:8000/health` no navegador do celular.

## Testes

```powershell
.\.venv\Scripts\python.exe -m pytest -q
```

## API

`POST /analyze` (multipart, campo `image` com um JPEG):

```json
{
  "found": true,
  "centered": false,
  "hint": "move_left",
  "bbox": [0.05, 0.3, 0.3, 0.3],
  "label": "bottle",
  "confidence": 0.71,
  "source": "mediapipe",
  "dx": -0.3, "dy": 0.0, "area": 0.09
}
```

`hint` diz para onde mover a câmera: `move_left`, `move_right`, `move_up`,
`move_down`, `closer`, `farther` ou `null` quando está centralizado.

## Ajustar a regra

Em [app/centering.py](app/centering.py), `CenteringRules`:

| Campo       | Padrão | O que é                                              |
|-------------|--------|------------------------------------------------------|
| `tolerance` | 0.15   | distância máxima do centro, em fração do quadro      |
| `min_area`  | 0.08   | o produto precisa ocupar ao menos 8% do quadro       |
| `max_area`  | 0.85   | e no máximo 85%                                      |

## Como detecta

1. **MediaPipe Object Detector** (EfficientDet-Lite0, classes do COCO):
   reconhece objetos comuns como garrafa, celular, copo, notebook e livro.
   Ignora pessoa, mesa, sofá etc. (`IGNORED_LABELS` em `app/detector.py`).
2. **OpenCV** (reserva): se o MediaPipe não achar nada, pega o maior contorno
   do quadro. Funciona bem com fundo liso.

Não instale `opencv-python` nem `opencv-python-headless` junto: o mediapipe já
traz o `opencv-contrib-python` e todos brigam pelo mesmo módulo `cv2`.
