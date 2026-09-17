# APROV — App Mobile

O APROV é uma plataforma de avaliação de produtos e serviços com gamificação.
Você avalia algo que comprou ou usou e ganha recompensas por isso.

## Como funciona

- O usuário escreve uma avaliação com estrelas, tags ("o que foi bom?" e
  "o que podemos melhorar?"), fotos ou vídeos e um comentário.
- Outros usuários podem concordar ou discordar da avaliação.
- Quando a avaliação é aprovada, o usuário ganha **moedas** da empresa
  parceira, que podem ser trocadas por recompensas, e **XP**, que sobe o
  seu nível na plataforma.
- As empresas parceiras recebem feedback organizado sobre seus produtos.
- O Maurício, robô mascote do APROV, acompanha o usuário pelo app.

Este repositório contém apenas o **aplicativo mobile**. O backend será
desenvolvido em Laravel e ainda não está integrado; por enquanto os dados
vêm de mocks.

## Tecnologias

- React Native com Expo
- TypeScript
- React Navigation (stack e abas)
- Lucide (ícones)

## Estrutura de pastas

```
src/
  components/   componentes reutilizáveis
  screens/      uma pasta por tela
  navigation/   navegadores e tipos de rota
  theme/        cores, tipografia e espaçamento
  mocks/        dados falsos usados enquanto não há API
  types/        tipos do domínio (usuário, empresa, produto, avaliação)
  utils/        funções auxiliares
  store/        estado global simples
assets/         ícones e imagens do app
```

## Como rodar

```bash
npm install
npm start
```

Depois, abra no Expo Go (Android/iOS) lendo o QR code, ou pressione `w`
para abrir no navegador.

## Padrões do repositório

**Branches:** `APV<número>-descricao-curta`, criadas a partir da `main`.
Exemplo: `APV4-tela-inicial`.

**Commits:** padrão Conventional Commits, em português.

| Tipo       | Uso                                          |
|------------|----------------------------------------------|
| `feat`     | nova funcionalidade                          |
| `fix`      | correção de bug                              |
| `refactor` | mudança de código sem alterar comportamento  |
| `style`    | ajuste visual ou de formatação               |
| `docs`     | documentação                                 |
| `chore`    | configuração, dependências, tarefas gerais   |

Exemplo: `feat: adiciona tela de interesses`
