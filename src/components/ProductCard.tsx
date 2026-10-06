import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Bookmark, Receipt, type LucideIcon } from 'lucide-react-native';
import { colors, icon, radius, space, type } from '../theme';
import type { Product } from '../types';
import { Button } from './Button';
import { StarRating } from './StarRating';

type Props = {
  product: Product;
  onAvaliar?: () => void;
  onSecondary?: () => void;
  width?: number;
  secondaryLabel?: string;
};

export function ProductCard({
  product,
  onAvaliar,
  onSecondary,
  width,
  secondaryLabel = 'Ver detalhes',
}: Props) {
  const hasReviews = product.reviewCount > 0;
  const [saved, setSaved] = useState(product.savedByCurrentUser);
  const [purchased, setPurchased] = useState(product.purchasedByCurrentUser);
  const purchaseVerb = product.kind === 'service' ? 'contratei' : 'comprei';

  return (
    <View style={[styles.card, width != null && { width }]}>
      <View>
        <Image source={{ uri: product.imageUri }} style={styles.image} resizeMode="cover" />
        <View style={styles.toggles}>
          <ToggleIcon
            Icon={Receipt}
            active={purchased}
            label={purchased ? `Desmarcar ${purchaseVerb}` : `Marcar como ${purchaseVerb}`}
            onPress={() => setPurchased((value) => !value)}
          />
          <ToggleIcon
            Icon={Bookmark}
            active={saved}
            fillWhenActive
            label={saved ? 'Remover dos salvos' : 'Salvar'}
            onPress={() => setSaved((value) => !value)}
          />
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>

        <View style={styles.ratingRow}>
          {hasReviews ? (
            <StarRating value={product.averageRating} size="sm" showValue />
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

function ToggleIcon({
  Icon,
  active,
  fillWhenActive = false,
  label,
  onPress,
}: {
  Icon: LucideIcon;
  active: boolean;
  fillWhenActive?: boolean;
  label: string;
  onPress: () => void;
}) {
  const tint = active ? colors.primary : colors.ink;

  return (
    <Pressable
      onPress={onPress}
      hitSlop={space.xs}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      style={[styles.toggle, active && styles.toggleActive]}
    >
      <Icon
        color={tint}
        fill={active && fillWhenActive ? tint : 'transparent'}
        size={icon.size.md}
        strokeWidth={icon.strokeWidth}
      />
    </Pressable>
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
  toggles: {
    position: 'absolute',
    top: space.sm,
    right: space.sm,
    flexDirection: 'row',
    gap: space.sm,
  },
  toggle: {
    width: icon.button,
    height: icon.button,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  toggleActive: {
    backgroundColor: colors.primaryDim,
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
    minHeight: 18,
    justifyContent: 'center',
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
