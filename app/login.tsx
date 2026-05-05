import { Image, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { palette } from '@/constants/design';

export default function LoginScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.screen}>
            <View style={styles.container}>
                <Text style={styles.topTitle}>Login</Text>

                <View style={styles.mainCard}>
                    <View style={styles.logoWrap}>
                        <Image
                            source={require('../assets/images/logo.webp')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>

                    <Pressable
                        onPress={() => router.replace('/(tabs)')}
                        style={styles.bottomSheet}>
                        <View style={styles.dragWrap}>
                            <View style={styles.dragLine} />
                        </View>
                        <Text style={styles.loginText}>Login</Text>
                        <Text style={styles.welcomeText}>Welcome Back !</Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#F2F2F4',
    },
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 24,
    },
    topTitle: {
        color: '#A7A7AD',
        fontSize: 30,
        fontFamily: 'BeVietnamPro_400Regular',
    },
    mainCard: {
        flex: 1,
        marginTop: 16,
        borderRadius: 28,
        backgroundColor: palette.cream,
        overflow: 'hidden',
    },
    logoWrap: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 280, // Cập nhật kích thước bằng với màn hình index
        height: 110,
    },
    bottomSheet: {
        backgroundColor: palette.primary,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    dragWrap: {
        alignItems: 'center',
        marginBottom: 8,
    },
    dragLine: {
        width: 64,
        height: 4,
        borderRadius: 999,
        backgroundColor: '#FFFFFF',
    },
    loginText: {
        textAlign: 'center',
        color: '#FFFFFF',
        fontSize: 50,
        fontFamily: 'Georgia',
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    welcomeText: {
        textAlign: 'center',
        color: palette.cream,
        fontSize: 34,
        fontFamily: 'Georgia',
        fontWeight: '400',
    },
});