import { useEffect, useState, useCallback } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import FlashMessage from 'react-native-flash-message';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { Platform, View } from 'react-native';
import { Colors } from '../constants/Colors';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  
  const router = useRouter();
  const segments = useSegments();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync("#FFFFFF");
      NavigationBar.setButtonStyleAsync("dark");
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const inAuthGroup = segments[0] === '(auth)';
      
      if(loaded) {
          if (user && inAuthGroup) {
            router.replace('/(tabs)');
          } else if (!user && !inAuthGroup) {
            router.replace('/(auth)/login');
          }
      }
      setIsAuthChecked(true);
    });
    return unsubscribe;
  }, [segments, loaded]);

  const onLayoutRootView = useCallback(async () => {
    if (loaded && isAuthChecked) {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn("SplashScreen hide error:", e);
      }
    }
  }, [loaded, isAuthChecked]);

  if (!loaded || !isAuthChecked) {
    return <View style={{ flex: 1, backgroundColor: Colors.background }} />;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <StatusBar style="dark" translucent={false} backgroundColor={Colors.background} />
      
      <Stack screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: Colors.background } }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      
      <FlashMessage position="top" style={{ marginTop: 30, borderRadius: 12, marginHorizontal: 20, backgroundColor: Colors.primary }} />
    </View>
  );
}