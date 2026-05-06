import { Image, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { palette } from '@/constants/design';
import { CustomButton } from '@/components/ui/custom-button';
import { InfoInput } from '@/components/ui/info-input';

export default function SignUpScreen() {
  const router = useRouter();
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView style={styles.screen}>
        <Animated.View entering={FadeIn.duration(700)} style={styles.logoWrap}>
          <Image source={require('../assets/images/logo.webp')} style={styles.logo} resizeMode="contain" />
        </Animated.View>

        <Animated.View entering={FadeIn.delay(160).duration(700)} style={styles.sheetContainer}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
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
                  <InfoInput label="Last name" value={lastName} onChangeText={setLastName} placeholder="Johnson" labelClassName="text-white mb-1" />
                </View>
                <View style={{ width: 12 }} />
                <View style={styles.flex1}>
                  <InfoInput label="First name" value={firstName} onChangeText={setFirstName} placeholder="Alex" labelClassName="text-white mb-1" />
                </View>
              </View>

              <InfoInput label="Email" value={email} onChangeText={setEmail} placeholder="alex@example.com" labelClassName="text-white mb-1" />
              <InfoInput label="Date of birth" value={dob} onChangeText={setDob} placeholder="01/01/2005" labelClassName="text-white mb-1" />
              <InfoInput label="Phone number" value={phone} onChangeText={setPhone} placeholder="(84) 123 456 789" labelClassName="text-white mb-1" />
              <InfoInput label="Set password" value={password} onChangeText={setPassword} placeholder="****************" secureTextEntry labelClassName="text-white mb-1" />

              <CustomButton label="Sign Up" variant="secondary" onPress={() => router.replace('/(tabs)')} className="mt-6 w-[220px] self-center" />

              <View style={styles.dividerWrap}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <Pressable style={styles.googleButton} onPress={() => router.replace('/(tabs)')}>
                <Image source={require('../assets/images/google.jpg')} style={styles.googleBtnIcon} resizeMode="contain" />
                <Text style={styles.googleBtnText}>Continue with Google</Text>
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
});
