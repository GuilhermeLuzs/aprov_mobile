import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CircleUserRound, House, Newspaper } from 'lucide-react-native';
import { colors, icon, type } from '../theme';
import type { MainTabParamList } from './types';
import { FeedStackNavigator } from './FeedStackNavigator';
import { HomeStackNavigator } from './HomeStackNavigator';
import { ProfileStackNavigator } from './ProfileStackNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inkFaint,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontFamily: type.micro.family,
          fontSize: type.micro.size,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => (
            <House color={color} size={icon.size.lg} strokeWidth={icon.strokeWidth} />
          ),
        }}
      />
      <Tab.Screen
        name="FeedTab"
        component={FeedStackNavigator}
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => (
            <Newspaper color={color} size={icon.size.lg} strokeWidth={icon.strokeWidth} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => (
            <CircleUserRound color={color} size={icon.size.lg} strokeWidth={icon.strokeWidth} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
