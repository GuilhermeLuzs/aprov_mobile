export function formatInt(n: number): string {
  return Math.round(n).toLocaleString('pt-BR');
}

export function formatRating(n: number): string {
  return n.toFixed(1).replace('.', ',');
}
