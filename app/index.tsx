import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { palette } from '@/constants/design';

export default function Entry() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.screen}>
            <View style={styles.card}>
                <Pressable onPress={() => router.replace('/login')} style={styles.logoPress}>
                    <Animated.Image
                        source={require('../assets/images/logo.webp')}
                        style={styles.logo}
                        resizeMode="contain"
                        entering={FadeIn.duration(1200)}
                    />
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: palette.cream,
    },
    card: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoPress: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // KÍCH THƯỚC CHUẨN CHO CẢ 3 TRANG
    logo: {
        width: 250,
        height: 100,
    },
});