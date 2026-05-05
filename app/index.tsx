import { Pressable, SafeAreaView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { palette } from '@/constants/design';

export default function Entry() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.screen}>
            <View style={styles.card}>
                <Pressable
                    accessibilityRole="button"
                    onPress={() => router.replace('/login')}
                    style={styles.logoPress}>
                    <Animated.Image
                        source={require('../assets/images/logo.webp')}
                        style={styles.logo}
                        resizeMode="contain"
                        entering={FadeIn.duration(1500)}
                    />
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#F2F2F4',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    card: {
        flex: 1,
        borderRadius: 28,
        backgroundColor: palette.cream,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoPress: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 280, // Tăng kích thước logo
        height: 110,
    },
});