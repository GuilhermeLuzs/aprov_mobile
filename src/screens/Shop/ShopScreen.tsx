import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search } from 'lucide-react-native';
import { BrandMark, PointsBalance, TabButton, TopBar } from '../../components';
import type { ShopStackNavigation } from '../../navigation/types';
import { colors, icon, size, space } from '../../theme';
import { AccessoriesTab } from './AccessoriesTab';
import { CouponsTab } from './CouponsTab';

type ShopTab = 'coupons' | 'accessories';

const TABS: { key: ShopTab; label: string }[] = [
  { key: 'coupons', label: 'Cupons' },
  { key: 'accessories', label: 'Acessórios' },
];

export default function ShopScreen() {
  const navigation = useNavigation<ShopStackNavigation<'Shop'>>();
  const [tab, setTab] = useState<ShopTab>('coupons');

  return (
    <View style={styles.screen}>
      <TopBar style={styles.bar}>
        <BrandMark />
        <View style={styles.tabList} accessibilityRole="tablist">
          {TABS.map((t) => (
            <TabButton key={t.key} label={t.label} active={tab === t.key} onPress={() => setTab(t.key)} />
          ))}
        </View>
        {tab === 'accessories' ? (
          <PointsBalance />
        ) : (
          <Pressable
            style={styles.searchButton}
            onPress={() => navigation.navigate('CouponSearch')}
            hitSlop={space.sm}
            accessibilityRole="button"
            accessibilityLabel="Buscar empresas"
          >
            <Search size={icon.size.lg} color={colors.ink} strokeWidth={icon.strokeWidth} />
          </Pressable>
        )}
      </TopBar>

      {tab === 'coupons' ? <CouponsTab /> : <AccessoriesTab />}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  searchButton: {
    width: size.control,
    height: size.control,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  tabList: {
    flex: 1,
    flexDirection: 'row',
    gap: space.xl,
  },
});
