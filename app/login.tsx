import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { palette, typography } from '@/constants/design';
import { CustomButton } from '@/components/ui/custom-button';
import { InfoInput } from '@/components/ui/info-input';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
            <View style={styles.logoWrap}>
                <Image
                    source={require('../assets/images/logo.webp')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>

            <View style={styles.sheetContainer}>
                <View style={styles.dragWrap}>
                    <View style={styles.dragLine} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.loginTitle}>Login</Text>
                    <Text style={styles.welcomeText}>Welcome Back !</Text>

                    <View style={styles.form}>
                        <InfoInput
                            label="Email"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="yennhi123@gmail.com"
                            labelClassName="text-white mb-1"
                        />

                        <InfoInput
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="****************"
                            secureTextEntry
                            labelClassName="text-white mb-1"
                        />

                        <Pressable style={styles.forgotPress}>
                            <Text style={styles.forgotText}>Forgot Password ?</Text>
                        </Pressable>

                        <CustomButton
                            label="Login"
                            variant="secondary"
                            onPress={() => router.replace('/(tabs)')}
                            className="mt-6"
                        />

                        <View style={styles.dividerWrap}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>login with</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <Pressable style={styles.googleIconWrap}>
                            {/* Logo Google đã được phóng to và xóa phông nền trắng */}
                            <Image
                                source={require('../assets/images/google.png')}
                                style={{ width: 60, height: 60 }}
                                resizeMode="contain"
                            />
                        </Pressable>

                        <View style={styles.signUpWrap}>
                            <Text style={styles.noAccountText}>Don't have an account? </Text>
                            <Pressable onPress={() => router.push('/sign-up')}>
                                <Text style={styles.signUpText}>Sign Up</Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: palette.cream,
    },
    logoWrap: {
        height: '38%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 250,
        height: 100,
    },
    sheetContainer: {
        flex: 1,
        backgroundColor: palette.primary,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 24,
        paddingTop: 12,
    },
    dragWrap: {
        alignItems: 'center',
        marginBottom: 16,
    },
    dragLine: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    loginTitle: {
        color: 'white',
        fontSize: 32,
        fontFamily: 'Georgia',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    welcomeText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Georgia',
        textAlign: 'center',
        marginTop: 4,
    },
    form: {
        marginTop: 24,
    },
    forgotPress: {
        alignSelf: 'flex-start',
        marginTop: 4,
    },
    forgotText: {
        color: palette.mustard,
        fontSize: 13,
        fontFamily: typography.body.fontFamily,
    },
    dividerWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
        marginBottom: 20,
    },
    dividerLine: {
        height: 1,
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    dividerText: {
        color: 'white',
        marginHorizontal: 12,
        fontSize: 13,
    },
    googleIconWrap: {
        alignSelf: 'center',
        marginBottom: 24,
    },
    signUpWrap: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    noAccountText: {
        color: 'white',
        fontSize: 13,
    },
    signUpText: {
        color: palette.mustard,
        fontSize: 13,
        fontWeight: 'bold',
    },
});