import pytest

from app.centering import Box, CenteringRules, evaluate


def box_at(cx: float, cy: float, size: float = 0.4) -> Box:
    return Box(x=cx - size / 2, y=cy - size / 2, w=size, h=size)


def test_sem_produto():
    result = evaluate(None)
    assert not result.found
    assert not result.centered
    assert result.hint is None


def test_centralizado():
    result = evaluate(box_at(0.5, 0.5))
    assert result.found
    assert result.centered
    assert result.hint is None


def test_dentro_da_tolerancia():
    assert evaluate(box_at(0.6, 0.42)).centered


@pytest.mark.parametrize(
    ("cx", "cy", "hint"),
    [
        (0.8, 0.5, "move_right"),
        (0.2, 0.5, "move_left"),
        (0.5, 0.8, "move_down"),
        (0.5, 0.2, "move_up"),
    ],
)
def test_dica_de_direcao(cx, cy, hint):
    result = evaluate(box_at(cx, cy, size=0.3))
    assert not result.centered
    assert result.hint == hint


def test_eixo_mais_distante_ganha():
    # Mais longe na horizontal do que na vertical.
    assert evaluate(box_at(0.85, 0.3, size=0.2)).hint == "move_right"


def test_pequeno_demais():
    assert evaluate(box_at(0.5, 0.5, size=0.2)).hint == "closer"


def test_grande_demais():
    assert evaluate(Box(x=0.0, y=0.0, w=0.98, h=0.98)).hint == "farther"


def test_centraliza_antes_de_aproximar():
    # Pequeno e fora do centro: primeiro pede para centralizar.
    assert evaluate(box_at(0.85, 0.5, size=0.1)).hint == "move_right"


def test_regras_customizadas():
    strict = CenteringRules(tolerance=0.05)
    assert not evaluate(box_at(0.6, 0.5), strict).centered
