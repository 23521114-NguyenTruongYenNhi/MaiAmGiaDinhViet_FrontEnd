import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';
import { palette, typography } from '@/constants/design';
import { CustomButton } from '@/components/ui/custom-button';
import { InfoInput } from '@/components/ui/info-input';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (email.trim().toLowerCase() === 'admin@maiam.vn') {
      router.replace('/admin');
      return;
    }

    router.replace('/(tabs)');
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
                onChangeText={setEmail}
                placeholder="alex@example.com"
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

              <Pressable style={styles.forgotPress} onPress={() => router.push('/password-help')}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>

              <CustomButton label="Login" variant="secondary" onPress={handleLogin} className="mt-8 w-[220px] self-center" />

              <Text style={styles.adminHint}>Admin demo: admin@maiam.vn with any password</Text>

              <View style={styles.dividerWrap}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              <Pressable style={styles.googleIconWrap} onPress={() => router.replace('/(tabs)')}>
                <View style={styles.googleCircle}>
                  <Image source={require('../assets/images/google.jpg')} style={styles.googleImage} resizeMode="contain" />
                </View>
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
