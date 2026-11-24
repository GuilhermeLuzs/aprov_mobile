"""Regra de centralização: recebe a caixa do produto e diz se está no centro.

Tudo aqui é normalizado (0 a 1) em relação ao quadro, então a regra não depende
da resolução da foto que o app mandou.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

Hint = Literal["move_left", "move_right", "move_up", "move_down", "closer", "farther"]


@dataclass(frozen=True)
class Box:
    """Caixa normalizada: canto superior esquerdo (x, y), largura e altura."""

    x: float
    y: float
    w: float
    h: float

    @property
    def center(self) -> tuple[float, float]:
        return self.x + self.w / 2, self.y + self.h / 2

    @property
    def area(self) -> float:
        return self.w * self.h


@dataclass(frozen=True)
class CenteringRules:
    # Distância máxima do centro da caixa até o centro do quadro, em cada eixo.
    tolerance: float = 0.15
    # Fração do quadro que o produto precisa ocupar.
    min_area: float = 0.08
    max_area: float = 0.85


@dataclass(frozen=True)
class CenteringResult:
    found: bool
    centered: bool
    hint: Hint | None
    dx: float
    dy: float
    area: float


def evaluate(box: Box | None, rules: CenteringRules = CenteringRules()) -> CenteringResult:
    if box is None:
        return CenteringResult(found=False, centered=False, hint=None, dx=0.0, dy=0.0, area=0.0)

    cx, cy = box.center
    # dx > 0: produto à direita do centro. dy > 0: produto abaixo do centro.
    dx, dy = cx - 0.5, cy - 0.5
    area = box.area

    hint = _hint(dx, dy, area, rules)
    return CenteringResult(
        found=True,
        centered=hint is None,
        hint=hint,
        dx=round(dx, 4),
        dy=round(dy, 4),
        area=round(area, 4),
    )


def _hint(dx: float, dy: float, area: float, rules: CenteringRules) -> Hint | None:
    # Primeiro centraliza, depois acerta a distância: se pedir para aproximar
    # com o produto no canto, ele sai do quadro.
    off_x = abs(dx) > rules.tolerance
    off_y = abs(dy) > rules.tolerance
    if off_x or off_y:
        # A dica é para onde mover a câmera: o produto está à direita, então
        # a câmera vai para a direita.
        if abs(dx) >= abs(dy):
            return "move_right" if dx > 0 else "move_left"
        return "move_down" if dy > 0 else "move_up"
    if area < rules.min_area:
        return "closer"
    if area > rules.max_area:
        return "farther"
    return None
