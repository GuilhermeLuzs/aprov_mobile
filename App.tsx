import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { fontMap } from './src/theme';
import { RootNavigator } from './src/navigation';

void SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts(fontMap);
  const [navReady, setNavReady] = useState(false);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      setNavReady(true);
    }
  }, [fontsLoaded, fontError]);

  const onLayout = useCallback(() => {
    if (navReady) {
      void SplashScreen.hideAsync();
    }
  }, [navReady]);

  if (!navReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayout}>
      <SafeAreaProvider>
        <View style={{ flex: 1 }}>
          <StatusBar style="dark" />
          <RootNavigator />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
