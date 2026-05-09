import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { palette, typography } from '@/constants/design';
import { CustomButton } from '@/components/ui/custom-button';
import { InfoInput } from '@/components/ui/info-input';
import { getBackendMe, loginBackend, loginWithGoogleBackend } from '@/data/backend';
import { saveSession } from '@/data/session';
import { validateEmail, validateLoginPassword } from '@/data/validation';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
    const router = useRouter();
    const googleAuthInProgressRef = useRef(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || googleWebClientId;
    const googleAndroidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || googleWebClientId;
    const [googleRequest, googleResponse, promptGoogleAsync] = Google.useIdTokenAuthRequest({
        webClientId: googleWebClientId,
        iosClientId: googleIosClientId,
        androidClientId: googleAndroidClientId,
        scopes: ['openid', 'profile', 'email'],
        selectAccount: true,
    });

    const handleEmailChange = (value: string) => {
        setEmail(value.trim().toLowerCase());
    };

    const getFriendlyError = (message: string) => {
        if (message.includes('Invalid email or password') || message.includes('401')) {
            return 'Email or password is incorrect.';
        }

        if (message.includes('Failed to fetch') || message.includes('Network request failed')) {
            return 'Cannot reach the backend. Please check that the server is running.';
        }

        return 'Login failed. Please try again.';
    };

    const handleLogin = async () => {
        const trimmedEmail = email.trim().toLowerCase();
        const validationMessage = validateEmail(trimmedEmail) || validateLoginPassword(password);

        if (validationMessage) {
            setErrorMessage(validationMessage);
            return;
        }

        setLoading(true);
        setErrorMessage('');

        try {
            const token = await loginBackend(trimmedEmail, password);
            const user = await getBackendMe(token.access_token);
            await saveSession(token.access_token, user);

            if (user.role === 'ADMIN') {
                router.replace('/admin');
                return;
            }

            router.replace('/(tabs)');
        } catch (error) {
            const message = error instanceof Error ? error.message : '';
            setErrorMessage(getFriendlyError(message));
        } finally {
            setLoading(false);
        }
    };

    const completeGoogleLogin = useCallback(async (idToken: string) => {
        setGoogleLoading(true);
        setErrorMessage('');

        try {
            const token = await loginWithGoogleBackend(idToken);
            const user = await getBackendMe(token.access_token);
            await saveSession(token.access_token, user);

            if (user.role === 'ADMIN') {
                router.replace('/admin');
                return;
            }

            router.replace('/(tabs)');
        } catch (error) {
            const message = error instanceof Error ? error.message : '';
            if (message.includes('Google client IDs')) {
                setErrorMessage('Google Sign-In is not configured on the backend yet.');
            } else {
                setErrorMessage(`Google Sign-In failed: ${message || 'Please try again.'}`);
            }
        } finally {
            googleAuthInProgressRef.current = false;
            setGoogleLoading(false);
        }
    }, [router]);

    useEffect(() => {
        if (googleResponse?.type === 'success') {
            const idToken = googleResponse.params.id_token;

            if (!idToken) {
                googleAuthInProgressRef.current = false;
                setGoogleLoading(false);
                setErrorMessage('Google did not return an ID token.');
                return;
            }

            void completeGoogleLogin(idToken);
        }

        if (googleResponse?.type === 'error') {
            googleAuthInProgressRef.current = false;
            setGoogleLoading(false);
            setErrorMessage(`Google authorization failed: ${JSON.stringify(googleResponse.params ?? {})}`);
        }
    }, [completeGoogleLogin, googleResponse]);

    const handleGoogleLogin = async () => {
        if (googleAuthInProgressRef.current || googleLoading) return;

        if (!googleWebClientId) {
            setErrorMessage('Google Sign-In needs Google client IDs in the FE .env file.');
            return;
        }

        try {
            googleAuthInProgressRef.current = true;
            setGoogleLoading(true);
            setErrorMessage('');

            const result = await promptGoogleAsync();

            if (result.type !== 'success') {
                googleAuthInProgressRef.current = false;
                setGoogleLoading(false);
            }
        } catch {
            googleAuthInProgressRef.current = false;
            setGoogleLoading(false);
            setErrorMessage('Google Sign-In failed. Please try again.');
        }
    };

    return (
        <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
            <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <Animated.View entering={FadeIn.duration(700)} style={styles.logoWrap}>
                    <Image source={require('../assets/images/logo.webp')} style={styles.logo} resizeMode="contain" />
                </Animated.View>

                <Animated.View entering={FadeIn.delay(160).duration(700)} style={styles.sheetContainer}>
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
                                onChangeText={handleEmailChange}
                                placeholder="alex@example.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                textContentType="emailAddress"
                                maxLength={120}
                                labelClassName="text-white mb-1"
                            />

                            <InfoInput
                                label="Password"
                                value={password}
                                onChangeText={setPassword}
                                placeholder="****************"
                                secureTextEntry
                                autoCapitalize="none"
                                autoCorrect={false}
                                textContentType="password"
                                maxLength={72}
                                labelClassName="text-white mb-1"
                            />

                            <Pressable style={styles.forgotPress} onPress={() => router.push('/password-help')}>
                                <Text style={styles.forgotText}>Forgot password?</Text>
                            </Pressable>

                            {errorMessage ? (
                                <View style={styles.errorBox}>
                                    <Text style={styles.errorText}>{errorMessage}</Text>
                                </View>
                            ) : null}

                            <CustomButton label={loading ? 'Logging in...' : 'Login'} variant="secondary" onPress={loading ? undefined : handleLogin} className="mt-8 w-[220px] self-center" />


                            <View style={styles.dividerWrap}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>or continue with</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            <Pressable
                                style={[styles.googleIconWrap, (!googleRequest || googleLoading) && styles.disabledPress]}
                                onPress={(!googleRequest || googleLoading) ? undefined : handleGoogleLogin}
                            >
                                <View style={styles.googleCircle}>
                                    <Image source={require('../assets/images/google.jpg')} style={styles.googleImage} resizeMode="contain" />
                                </View>
                                {googleLoading ? <Text style={styles.googleLoadingText}>Signing in...</Text> : null}
                            </Pressable>

                            <View style={styles.signUpWrap}>
                                <Text style={styles.noAccountText}>Don&apos;t have an account? </Text>
                                <Pressable onPress={() => router.push('/sign-up')}>
                                    <Text style={styles.signUpText}>Sign Up</Text>
                                </Pressable>
                            </View>
                        </View>
                    </ScrollView>
                </Animated.View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: palette.cream,
    },
    logoWrap: {
        height: '34%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 320,
        height: 132,
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
        marginTop: 28,
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
        marginTop: 28,
        marginBottom: 16,
    },
    adminHint: {
        color: 'rgba(255,255,255,0.72)',
        fontFamily: typography.body.fontFamily,
        fontSize: 12,
        marginTop: 12,
        textAlign: 'center',
    },
    errorBox: {
        backgroundColor: 'rgba(255,255,255,0.14)',
        borderColor: 'rgba(255,255,255,0.28)',
        borderRadius: 14,
        borderWidth: 1,
        marginTop: 14,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    errorText: {
        color: '#FFFFFF',
        fontFamily: typography.body.fontFamily,
        fontSize: 13,
        lineHeight: 18,
        textAlign: 'center',
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
        marginBottom: 16,
        alignItems: 'center',
    },
    googleCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    googleImage: {
        width: 46,
        height: 46,
        transform: [{ scale: 1.2 }],
    },
    signUpWrap: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    disabledPress: {
        opacity: 0.6,
    },
    googleLoadingText: {
        color: 'white',
        fontFamily: typography.body.fontFamily,
        fontSize: 12,
        marginTop: 8,
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
