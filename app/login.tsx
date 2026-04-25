import { Image, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { InfoInput } from '@/components/ui/info-input';
import { CustomButton } from '@/components/ui/custom-button';
import { appCopy } from '@/constants/design';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <ScrollView contentContainerClassName="flex-grow px-5 pb-8">
        <View className="mt-14 items-center">
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3062/3062634.png' }}
            className="h-24 w-24"
          />
          <Text className="mt-3 text-center text-3xl font-bold text-primary">{appCopy.appName}</Text>
        </View>

        <View className="mt-10 rounded-3xl bg-primary p-5">
          <Text className="text-center text-3xl font-bold text-white">Login</Text>
          <Text className="mt-2 text-center text-base text-[#F2DDDD]">Welcome Back!</Text>

          <View className="mt-5">
            <InfoInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@email.com"
              keyboardType="email-address"
              labelClassName="text-[#F5D1D1]"
            />
            <InfoInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="********"
              secureTextEntry={secure}
              onToggleSecure={() => setSecure((prev) => !prev)}
              labelClassName="text-[#F5D1D1]"
            />
            <Pressable>
              <Text className="mb-4 mt-1 text-right text-xs font-medium text-[#F5D1D1]">Forgot Password?</Text>
            </Pressable>
            <CustomButton label="Login" variant="secondary" onPress={() => router.replace('/(tabs)')} />
          </View>

          <View className="my-5 flex-row items-center gap-2">
            <View className="h-[1px] flex-1 bg-[#B75A5A]" />
            <Text className="text-sm text-[#F5D1D1]">or</Text>
            <View className="h-[1px] flex-1 bg-[#B75A5A]" />
          </View>

          <CustomButton label="Continue with Google" variant="outline" className="bg-white" />

          <Pressable className="mt-5" onPress={() => router.push('/sign-up')}>
            <Text className="text-center text-sm text-[#F5D1D1]">
              Don&apos;t have an account? <Text className="font-semibold text-white">Sign Up</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
