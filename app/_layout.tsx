import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { Text, TextInput } from 'react-native';
import {
  BeVietnamPro_400Regular,
  BeVietnamPro_500Medium,
  BeVietnamPro_600SemiBold,
  BeVietnamPro_700Bold,
} from '@expo-google-fonts/be-vietnam-pro';
import 'react-native-reanimated';
import '../global.css';

let hasAppliedDefaultFonts = false;

export default function RootLayout() {
  const [loaded] = useFonts({
    BeVietnamPro_400Regular,
    BeVietnamPro_500Medium,
    BeVietnamPro_600SemiBold,
    BeVietnamPro_700Bold,
  });

  useEffect(() => {
    if (!loaded || hasAppliedDefaultFonts) return;
    hasAppliedDefaultFonts = true;

    if (!Text.defaultProps) {
      Text.defaultProps = {};
    }
    if (!TextInput.defaultProps) {
      TextInput.defaultProps = {};
    }
    Text.defaultProps.style = [{ fontFamily: 'BeVietnamPro_400Regular' }, Text.defaultProps.style];
    TextInput.defaultProps.style = [{ fontFamily: 'BeVietnamPro_400Regular' }, TextInput.defaultProps.style];
  }, [loaded]);

  if (!loaded) return null;

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 220,
          contentStyle: { backgroundColor: '#FAF7F2' },
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="sign-up" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="family/[id]" options={{ headerShown: true, title: 'Family Story' }} />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}
