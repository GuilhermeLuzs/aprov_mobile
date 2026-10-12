import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, radius, space, type } from '../theme';
import type { Product } from '../types';
import { formatInt } from '../utils/format';
import { Button } from './Button';
import { ItemToggles } from './ItemToggles';
import { StarRating } from './StarRating';

type Props = {
  product: Product;
  onAvaliar?: () => void;
  onSecondary?: () => void;
  width?: number;
  secondaryLabel?: string;
  saved?: boolean;
  purchased?: boolean;
  onToggleSaved?: () => void;
  onTogglePurchased?: () => void;
};

export function ProductCard({
  product,
  onAvaliar,
  onSecondary,
  width,
  secondaryLabel = 'Ver detalhes',
  saved = false,
  purchased = false,
  onToggleSaved,
  onTogglePurchased,
}: Props) {
  const hasReviews = product.reviewCount > 0;

  return (
    <View style={[styles.card, width != null && { width }]}>
      <View>
        <Image source={{ uri: product.imageUri }} style={styles.image} resizeMode="cover" />
        <ItemToggles
          kind={product.kind}
          saved={saved}
          purchased={purchased}
          onToggleSaved={onToggleSaved}
          onTogglePurchased={onTogglePurchased}
        />
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>

        <View style={styles.ratingRow}>
          {hasReviews ? (
            <>
              <StarRating value={product.averageRating} size="md" showValue />
              <Text style={styles.reviewCount}>
                {formatInt(product.reviewCount)}{' '}
                {product.reviewCount === 1 ? 'avaliação' : 'avaliações'}
              </Text>
            </>
          ) : (
            <Text style={styles.noReviews}>sem avaliações</Text>
          )}
        </View>

        <View style={styles.actions}>
          <Button
            label="Avaliar"
            size="sm"
            fullWidth
            disabled={!onAvaliar}
            onPress={() => onAvaliar?.()}
          />
          <Button
            label={secondaryLabel}
            variant="text"
            size="sm"
            disabled={!onSecondary}
            onPress={() => onSecondary?.()}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: colors.surfaceAlt,
  },
  body: {
    padding: space.md,
  },
  title: {
    minHeight: type.bodyBold.lineHeight * 2,
    fontFamily: type.bodyBold.family,
    fontSize: type.bodyBold.size,
    lineHeight: type.bodyBold.lineHeight,
    color: colors.ink,
  },
  ratingRow: {
    marginTop: space.sm,
    minHeight: type.numeric.lineHeight + type.caption.lineHeight,
    justifyContent: 'center',
  },
  reviewCount: {
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
  noReviews: {
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkFaint,
  },
  actions: {
    marginTop: space.md,
    alignItems: 'flex-start',
    gap: space.xs,
  },
});
