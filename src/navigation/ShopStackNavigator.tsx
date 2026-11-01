import { Platform, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PointsBalance } from '../components';
import {
  CompanyCouponsScreen,
  AccessoryListScreen,
  CouponSearchScreen,
  ShopScreen,
} from '../screens';
import { space } from '../theme';
import { ACCESSORY_KIND_LABEL } from '../types';
import type { ShopStackParamList } from './types';
import { stackScreenOptions } from './navTheme';

const Stack = createNativeStackNavigator<ShopStackParamList>();

const headerRightInset = Platform.select({ web: { paddingRight: space.lg }, default: {} });

export function ShopStackNavigator() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Shop" component={ShopScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="CompanyCoupons"
        component={CompanyCouponsScreen}
        options={{ title: 'Cupons' }}
      />
      <Stack.Screen
        name="CouponSearch"
        component={CouponSearchScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AccessoryList"
        component={AccessoryListScreen}
        options={({ route }) => ({
          title: ACCESSORY_KIND_LABEL[route.params.kind],
          headerRight: () => (
            <View style={headerRightInset}>
              <PointsBalance />
            </View>
          ),
        })}
      />
    </Stack.Navigator>
  );
}
