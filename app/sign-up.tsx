import { Image, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { palette } from '@/constants/design';
import { CustomButton } from '@/components/ui/custom-button';
import { InfoInput } from '@/components/ui/info-input';
import { getBackendMe, loginBackend, loginWithGoogleBackend, registerBackend } from '@/data/backend';
import { safeBack } from '@/data/navigation';
import { saveSession } from '@/data/session';
import { validateDateOfBirth, validateEmail, validateName, validatePassword, validatePhone } from '@/data/validation';

WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
    const router = useRouter();
    const googleAuthInProgressRef = useRef(false);
    const [lastName, setLastName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [email, setEmail] = useState('');
    const [dob, setDob] = useState('');
    const [phone, setPhone] = useState('');
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

    const handleNameChange = (setter: (value: string) => void) => (value: string) => {
        setter(value.replace(/[^A-Za-zÀ-ỹ\s'-]/g, ''));
    };

    const handleEmailChange = (value: string) => {
        setEmail(value.trim().toLowerCase());
    };

    const handleDobChange = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 8);
        const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);
        setDob(parts.join('/'));
    };

    const handlePhoneChange = (value: string) => {
        setPhone(value.replace(/[^0-9+()\s-]/g, '').slice(0, 20));
    };

    const handleSignUp = async () => {
        const fullName = `${lastName.trim()} ${firstName.trim()}`.trim();
        const normalizedEmail = email.trim().toLowerCase();
        const validationMessage =
            validateName(lastName, 'Last name') ||
            validateName(firstName, 'First name') ||
            validateEmail(normalizedEmail) ||
            validateDateOfBirth(dob) ||
            validatePhone(phone) ||
            validatePassword(password);

        if (validationMessage) {
            setErrorMessage(validationMessage);
            return;
        }

        setLoading(true);
        setErrorMessage('');

        try {
            await registerBackend({
                full_name: fullName,
                email: normalizedEmail,
                password,
                phone_number: phone.trim() || undefined,
            });
            const token = await loginBackend(normalizedEmail, password);
            const user = await getBackendMe(token.access_token);
            await saveSession(token.access_token, user);
            router.replace('/(tabs)');
        } catch (error) {
            const message = error instanceof Error ? error.message : '';
            if (message.includes('Email already registered')) {
                setErrorMessage('This email is already registered. Please log in instead.');
            } else if (message.includes('Failed to fetch') || message.includes('Network request failed')) {
                setErrorMessage('Cannot reach the backend. Please check that the server is running.');
            } else {
                setErrorMessage('Sign up failed. Please try again.');
            }
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
            <KeyboardAvoidingView style={styles.screen}>
                <Animated.View entering={FadeIn.duration(700)} style={styles.logoWrap}>
                    <Image source={require('../assets/images/logo.webp')} style={styles.logo} resizeMode="contain" />
                </Animated.View>

                <Animated.View entering={FadeIn.delay(160).duration(700)} style={styles.sheetContainer}>
                    <Pressable onPress={() => safeBack('/login')} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </Pressable>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        <Text style={styles.title}>Sign Up</Text>
                        <View style={styles.loginLinkWrap}>
                            <Text style={styles.loginLinkText1}>Already have an account? </Text>
                            <Pressable onPress={() => router.push('/login')}>
                                <Text style={styles.loginLinkText2}>Login</Text>
                            </Pressable>
                        </View>

                        <View style={styles.form}>
                            <View style={styles.row}>
                                <View style={styles.flex1}>
                                    <InfoInput label="Last name" value={lastName} onChangeText={handleNameChange(setLastName)} placeholder="Johnson" textContentType="name" maxLength={40} labelClassName="text-white mb-1" />
                                </View>
                                <View style={{ width: 12 }} />
                                <View style={styles.flex1}>
                                    <InfoInput label="First name" value={firstName} onChangeText={handleNameChange(setFirstName)} placeholder="Alex" textContentType="name" maxLength={40} labelClassName="text-white mb-1" />
                                </View>
                            </View>

                            <InfoInput label="Email" value={email} onChangeText={handleEmailChange} placeholder="alex@example.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} textContentType="emailAddress" maxLength={120} labelClassName="text-white mb-1" />
                            <InfoInput label="Date of birth" value={dob} onChangeText={handleDobChange} placeholder="01/01/2005" keyboardType="phone-pad" maxLength={10} labelClassName="text-white mb-1" />
                            <InfoInput label="Phone number" value={phone} onChangeText={handlePhoneChange} placeholder="(84) 123 456 789" keyboardType="phone-pad" textContentType="telephoneNumber" maxLength={20} labelClassName="text-white mb-1" />
                            <InfoInput label="Set password" value={password} onChangeText={setPassword} placeholder="****************" secureTextEntry autoCapitalize="none" autoCorrect={false} textContentType="newPassword" maxLength={72} labelClassName="text-white mb-1" />

                            {errorMessage ? (
                                <View style={styles.errorBox}>
                                    <Text style={styles.errorText}>{errorMessage}</Text>
                                </View>
                            ) : null}

                            <CustomButton label={loading ? 'Creating account...' : 'Sign Up'} variant="secondary" onPress={loading ? undefined : handleSignUp} className="mt-6 w-[220px] self-center" />

                            <View style={styles.dividerWrap}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>or</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            <Pressable
                                style={[styles.googleButton, (!googleRequest || googleLoading) && styles.disabledPress]}
                                onPress={(!googleRequest || googleLoading) ? undefined : handleGoogleLogin}
                            >
                                <Image source={require('../assets/images/google.jpg')} style={styles.googleBtnIcon} resizeMode="contain" />
                                <Text style={styles.googleBtnText}>{googleLoading ? 'Signing in...' : 'Continue with Google'}</Text>
                            </Pressable>

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
        height: '28%',
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
        paddingTop: 20,
        position: 'relative',
    },
    backBtn: {
        position: 'absolute',
        top: 20,
        left: 24,
        zIndex: 10,
    },
    scrollContent: {
        paddingBottom: 40,
        paddingTop: 10,
    },
    title: {
        color: 'white',
        fontSize: 32,
        fontFamily: 'Georgia',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    loginLinkWrap: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 6,
    },
    loginLinkText1: {
        color: 'white',
        fontSize: 13,
    },
    loginLinkText2: {
        color: palette.mustard,
        fontSize: 13,
        textDecorationLine: 'underline',
    },
    form: {
        marginTop: 24,
    },
    row: {
        flexDirection: 'row',
    },
    flex1: {
        flex: 1,
    },
    dividerWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
        marginBottom: 16,
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
    googleButton: {
        flexDirection: 'row',
        backgroundColor: 'white',
        height: 50,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    googleBtnIcon: {
        width: 24,
        height: 24,
        marginRight: 10,
        transform: [{ scale: 1.2 }],
    },
    googleBtnText: {
        color: '#2B2B2B',
        fontSize: 15,
        fontWeight: '600',
    },
    disabledPress: {
        opacity: 0.6,
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
        fontSize: 13,
        lineHeight: 18,
        textAlign: 'center',
    },
});
