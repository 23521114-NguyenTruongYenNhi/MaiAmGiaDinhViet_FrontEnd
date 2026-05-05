import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
    BeVietnamPro_400Regular,
    BeVietnamPro_500Medium,
    BeVietnamPro_600SemiBold,
    BeVietnamPro_700Bold,
} from '@expo-google-fonts/be-vietnam-pro';
import 'react-native-reanimated';
import '../global.css';

export default function RootLayout() {
    useFonts({
        BeVietnamPro_400Regular,
        BeVietnamPro_500Medium,
        BeVietnamPro_600SemiBold,
        BeVietnamPro_700Bold,
    });

    return (
        <>
            <Stack
                screenOptions={{
                    headerShown: false,
                    animation: 'fade', // Chuyển sang fade để mượt hơn
                    animationDuration: 300, // Tăng lên 300ms
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