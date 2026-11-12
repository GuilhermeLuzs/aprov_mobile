import { EmptyState } from './EmptyState';

type Props = {
  message?: string;
  onRetry: () => void;
  compact?: boolean;
};

export function LoadError({ message, onRetry, compact = false }: Props) {
  return (
    <EmptyState
      mood="confused"
      compact={compact}
      title="Não deu para carregar"
      description={message ?? 'Confira a internet e tente de novo.'}
      action={{ label: 'Tentar de novo', onPress: onRetry }}
    />
  );
}
