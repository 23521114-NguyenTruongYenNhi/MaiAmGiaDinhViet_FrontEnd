import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { CustomButton } from '@/components/ui/custom-button';
import { InfoInput } from '@/components/ui/info-input';

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneCode, setPhoneCode] = useState('+84');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [date, setDate] = useState(new Date(2005, 0, 1));
  const [openDate, setOpenDate] = useState(false);

  const dateLabel = useMemo(() => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }, [date]);

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <ScrollView contentContainerClassName="px-5 pb-8">
        <Text className="mt-8 text-center text-3xl font-bold text-primary">Sign Up</Text>

        <View className="mt-6 rounded-3xl bg-primary p-5">
          <InfoInput
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="Nguyen Van A"
            labelClassName="text-[#F5D1D1]"
          />
          <InfoInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@email.com"
            keyboardType="email-address"
            labelClassName="text-[#F5D1D1]"
          />

          <Text className="mb-1 text-sm font-medium text-[#F5D1D1]">Birth Date</Text>
          <Pressable
            onPress={() => setOpenDate(true)}
            className="mb-3 h-12 justify-center rounded-2xl border border-[#E7DED4] bg-white px-3">
            <Text className="text-[15px] text-[#2B2B2B]">{dateLabel}</Text>
          </Pressable>
          {openDate ? (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, selectedDate) => {
                setOpenDate(Platform.OS === 'ios');
                if (selectedDate) setDate(selectedDate);
              }}
            />
          ) : null}

          <Text className="mb-1 text-sm font-medium text-[#F5D1D1]">Phone Number</Text>
          <View className="mb-3 flex-row gap-2">
            <Pressable
              onPress={() => setPhoneCode((prev) => (prev === '+84' ? '+1' : '+84'))}
              className="h-12 w-20 items-center justify-center rounded-2xl border border-[#E7DED4] bg-white">
              <Text className="font-semibold text-[#2B2B2B]">{phoneCode}</Text>
            </Pressable>
            <View className="flex-1">
              <InfoInput
                label=""
                value={phone}
                onChangeText={setPhone}
                placeholder="123 456 789"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <InfoInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="********"
            secureTextEntry={secure}
            onToggleSecure={() => setSecure((prev) => !prev)}
            labelClassName="text-[#F5D1D1]"
          />

          <CustomButton label="Create Account" variant="secondary" onPress={() => router.replace('/(tabs)')} />
          <CustomButton label="Continue with Google" variant="outline" className="mt-3 bg-white" />

          <Pressable className="mt-4" onPress={() => router.push('/login')}>
            <Text className="text-center text-sm text-[#F5D1D1]">
              Already have an account? <Text className="font-semibold text-white">Login</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
