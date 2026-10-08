import { useLayoutEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import {
  Button,
  EmptyState,
  Pagination,
  ReviewPost,
  SectionHeader,
  StarRating,
} from '../../components';
import { colors, space, type } from '../../theme';
import { companies, products, reviews, users } from '../../mocks';
import { usePublishedReviews } from '../../store/publishedReviews';
import { useCurrentUser } from '../../store/wallet';
import { formatInt } from '../../utils/format';
import type { HomeStackNavigation, HomeStackParamList } from '../../navigation/types';

const REVIEWS_PER_PAGE = 5;

function byNewest(a: { createdAt: string }, b: { createdAt: string }): number {
  return Date.parse(b.createdAt) - Date.parse(a.createdAt);
}

export default function ProductDetailsScreen() {
  const route = useRoute<RouteProp<HomeStackParamList, 'ProductDetails'>>();
  const navigation = useNavigation<HomeStackNavigation<'ProductDetails'>>();
  const { productId } = route.params;
  const published = usePublishedReviews();
  const me = useCurrentUser();
  const [page, setPage] = useState(1);

  const product = products.find((p) => p.id === productId);
  const company = product ? companies.find((c) => c.id === product.companyId) : undefined;

  useLayoutEffect(() => {
    if (company) navigation.setOptions({ title: company.name });
  }, [navigation, company]);

  if (!product || !company) {
    return (
      <View style={styles.notFound}>
        <EmptyState
          title="Item não encontrado"
          description="Ele pode ter saído do catálogo."
          action={{ label: 'Voltar', onPress: () => navigation.goBack() }}
        />
      </View>
    );
  }

  const productReviews = [
    ...published.filter((r) => r.productId === productId),
    ...reviews.filter((r) => r.productId === productId).sort(byNewest),
  ];
  const publishedIds = new Set(published.map((r) => r.id));
  const reviewCount = productReviews.length;
  const average =
    reviewCount === 0
      ? 0
      : Math.round((productReviews.reduce((sum, r) => sum + r.averageRating, 0) / reviewCount) * 10) /
        10;

  const pageCount = Math.max(1, Math.ceil(reviewCount / REVIEWS_PER_PAGE));
  const safePage = Math.min(page, pageCount);
  const pageItems = productReviews.slice(
    (safePage - 1) * REVIEWS_PER_PAGE,
    safePage * REVIEWS_PER_PAGE,
  );

  const review = () => navigation.navigate('CreateReview', { productId });

  const header = (
    <View>
      <Image source={{ uri: product.imageUri }} style={styles.hero} resizeMode="cover" />

      <View style={styles.body}>
        <Text style={styles.title}>{product.title}</Text>

        <View style={styles.statsRow}>
          {reviewCount > 0 ? (
            <>
              <StarRating value={average} size="md" showValue />
              <Text style={styles.count}>
                · {formatInt(reviewCount)} {reviewCount === 1 ? 'avaliação' : 'avaliações'}
              </Text>
            </>
          ) : (
            <Text style={styles.count}>sem avaliações</Text>
          )}
        </View>

        <Text style={styles.description}>{product.description}</Text>

        <View style={styles.cta}>
          <Button label="Avaliar" fullWidth onPress={review} />
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.body}>
        <SectionHeader title="Avaliações" />
      </View>
    </View>
  );

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={pageItems}
      keyExtractor={(r) => r.id}
      ListHeaderComponent={header}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => {
        const author =
          item.authorId === me.id ? me : (users.find((u) => u.id === item.authorId) ?? me);
        return (
          <View style={styles.body}>
            <ReviewPost
              review={item}
              author={author}
              product={product}
              company={company}
              showProduct={false}
              highlight={publishedIds.has(item.id) ? 'Sua avaliação' : undefined}
            />
          </View>
        );
      }}
      ListEmptyComponent={
        <View style={styles.body}>
          <EmptyState
            compact
            title="Ninguém avaliou ainda"
            description="Seja a primeira pessoa a contar como foi."
            action={{ label: 'Avaliar', onPress: review }}
          />
        </View>
      }
      ListFooterComponent={
        pageCount > 1 ? (
          <View style={styles.pagination}>
            <Pagination page={safePage} pageCount={pageCount} onChange={setPage} />
          </View>
        ) : null
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: space.xxl },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    padding: space.lg,
    backgroundColor: colors.bg,
  },
  hero: {
    width: '100%',
    aspectRatio: 16 / 10,
    backgroundColor: colors.surfaceAlt,
  },
  body: { paddingHorizontal: space.lg },
  title: {
    marginTop: space.lg,
    fontFamily: type.title.family,
    fontSize: type.title.size,
    lineHeight: type.title.lineHeight,
    color: colors.ink,
  },
  statsRow: {
    marginTop: space.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  count: {
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.inkMuted,
  },
  description: {
    marginTop: space.md,
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.inkMuted,
  },
  cta: { marginTop: space.lg },
  divider: {
    height: 1,
    marginVertical: space.lg,
    backgroundColor: colors.border,
  },
  separator: { height: space.md },
  pagination: { marginTop: space.xl },
});
