import { useLayoutEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import {
  Button,
  Chip,
  EmptyState,
  ItemToggles,
  LoadError,
  LoadingState,
  MediaCarousel,
  Pagination,
  ReviewPost,
  SectionHeader,
  StarRating,
} from '../../components';
import { colors, space, type } from '../../theme';
import { ApiError } from '../../api';
import { CATEGORY_LABEL, PRODUCT_KIND_LABEL } from '../../types';
import { useCurrentUser } from '../../store/session';
import { togglePurchased, toggleSaved, useItem } from '../../queries/catalog';
import { useItemReviews, useReviewDisplay } from '../../queries/reviews';
import { formatInt } from '../../utils/format';
import type { ProductDetailsNavigation, ProductDetailsParamList } from '../../navigation/types';
import { CATEGORY_ICON } from '../Onboarding/options';
import { useOpenProfile } from '../UserProfile/useOpenProfile';
import { useOpenMedia } from '../Media/useOpenMedia';
import { useReport } from '../Report/useReport';

const NOT_FOUND = 404;
const HERO_RATIO = 16 / 10;

export default function ProductDetailsScreen() {
  const route = useRoute<RouteProp<ProductDetailsParamList, 'ProductDetails'>>();
  const navigation = useNavigation<ProductDetailsNavigation>();
  const { productId } = route.params;
  const me = useCurrentUser();
  const display = useReviewDisplay();
  const openMedia = useOpenMedia();
  const report = useReport();
  const openProfile = useOpenProfile();
  const [page, setPage] = useState(1);
  const item = useItem(productId);
  const reviews = useItemReviews(productId, page);

  const company = item.data?.company;

  useLayoutEffect(() => {
    if (company) navigation.setOptions({ title: company.name });
  }, [navigation, company]);

  if (item.isPending) return <LoadingState fill />;

  if (!item.data) {
    const missing = item.error instanceof ApiError && item.error.status === NOT_FOUND;
    return (
      <View style={styles.notFound}>
        {missing ? (
          <EmptyState
            mood="confused"
            title="Item não encontrado"
            description="Ele pode ter saído do catálogo."
            action={{ label: 'Voltar', onPress: () => navigation.goBack() }}
          />
        ) : (
          <LoadError onRetry={() => void item.refetch()} />
        )}
      </View>
    );
  }

  const { product } = item.data;
  const itemCompany = item.data.company;
  const entries = reviews.data?.entries ?? [];
  const mediaIds = entries.map((entry) => entry.review.id);
  const { reviewCount, averageRating: average } = product;
  const pageCount = reviews.data?.pageCount ?? 1;
  const currentPage = reviews.data?.page ?? page;

  const review = () => navigation.navigate('CreateReview', { productId });

  const header = (
    <View>
      <View>
        <MediaCarousel
          media={product.media}
          rounded={false}
          aspectRatio={HERO_RATIO}
          onOpen={(index) => navigation.navigate('ProductMedia', { productId: product.id, index })}
        />
        <ItemToggles
          kind={product.kind}
          saved={product.savedByCurrentUser}
          purchased={product.purchasedByCurrentUser}
          onToggleSaved={() => toggleSaved(product)}
          onTogglePurchased={() => togglePurchased(product)}
        />
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>{product.title}</Text>

        <View style={styles.classification}>
          <Chip label={PRODUCT_KIND_LABEL[product.kind]} size="sm" />
          {product.categories.map((category) => (
            <Chip
              key={category}
              label={CATEGORY_LABEL[category]}
              icon={CATEGORY_ICON[category]}
              size="sm"
            />
          ))}
        </View>

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
    <>
      <FlatList
        style={styles.screen}
        contentContainerStyle={styles.content}
        data={entries}
        keyExtractor={(entry) => entry.review.id}
        ListHeaderComponent={header}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item: entry }) => {
          const { review, author } = entry;
          const mine = author.id === me.id;
          return (
            <View style={styles.body}>
              <ReviewPost
                {...display(review)}
                author={author}
                product={product}
                company={itemCompany}
                showProduct={false}
                highlight={mine ? 'Sua avaliação' : undefined}
                onPressAuthor={mine ? () => openProfile(me.id) : undefined}
                onPressBody={() => navigation.navigate('ReviewDetails', { reviewId: review.id })}
                onOpenMedia={(index) => openMedia(mediaIds, review.id, index)}
                onReport={
                  report.canReport(author.id) ? () => report.open('review', review.id) : undefined
                }
              />
            </View>
          );
        }}
        ListEmptyComponent={
          reviews.isPending ? (
            <LoadingState />
          ) : reviews.isError ? (
            <View style={styles.body}>
              <LoadError compact onRetry={() => void reviews.refetch()} />
            </View>
          ) : (
            <View style={styles.body}>
              <EmptyState
                compact
                title="Ninguém avaliou ainda"
                description="Seja a primeira pessoa a contar como foi."
                action={{ label: 'Avaliar', onPress: review }}
              />
            </View>
          )
        }
        ListFooterComponent={
          pageCount > 1 ? (
            <View style={styles.pagination}>
              <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
      {report.sheet}
    </>
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
  body: { paddingHorizontal: space.lg },
  title: {
    marginTop: space.lg,
    fontFamily: type.title.family,
    fontSize: type.title.size,
    lineHeight: type.title.lineHeight,
    color: colors.ink,
  },
  classification: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, marginTop: space.sm },
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
