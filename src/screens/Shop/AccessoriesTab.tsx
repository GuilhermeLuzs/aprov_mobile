import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AccessoryCard, SectionHeader } from '../../components';
import { accessories } from '../../mocks';
import type { ShopStackNavigation } from '../../navigation/types';
import { equipAccessory } from '../../store/accessories';
import { useCurrentUser } from '../../store/session';
import { size, space } from '../../theme';
import { ACCESSORY_KIND_LABEL, type AccessoryKind } from '../../types';
import { useAccessorySheet } from './useAccessorySheet';

const SHELVES: AccessoryKind[] = ['skin', 'frame'];
const ITEMS_PER_CAROUSEL = 6;

export function AccessoriesTab() {
  const navigation = useNavigation<ShopStackNavigation<'Shop'>>();
  const user = useCurrentUser();
  const { statusOf, openAccessory, sheet } = useAccessorySheet();

  return (
    <>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {SHELVES.map((kind) => (
          <View key={kind}>
            <View style={styles.shelfHeader}>
              <SectionHeader
                title={ACCESSORY_KIND_LABEL[kind]}
                action={{
                  label: 'Ver mais',
                  onPress: () => navigation.navigate('AccessoryList', { kind }),
                }}
              />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carousel}
              snapToInterval={size.shopCard + space.md}
              decelerationRate="fast"
            >
              {accessories
                .filter((c) => c.kind === kind)
                .slice(0, ITEMS_PER_CAROUSEL)
                .map((accessory) => (
                  <AccessoryCard
                    key={accessory.id}
                    accessory={accessory}
                    status={statusOf(accessory)}
                    user={user}
                    onPress={() => openAccessory(accessory.id)}
                    onEquip={() => equipAccessory(accessory)}
                  />
                ))}
            </ScrollView>
          </View>
        ))}
      </ScrollView>

      {sheet}
    </>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: space.xl, gap: space.xl },
  shelfHeader: { paddingHorizontal: space.lg },
  carousel: { paddingHorizontal: space.lg, gap: space.md },
});
