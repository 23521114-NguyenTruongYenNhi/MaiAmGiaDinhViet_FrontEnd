import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette } from '@/constants/design';
import { safeBack } from '@/data/navigation';

export default function PasswordHelpScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#FAF7F2]" edges={['top', 'bottom']}>
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 28 }}>
        <View className="mt-3 flex-row items-center justify-between">
          <Pressable onPress={() => safeBack('/login')} className="h-11 w-11 items-center justify-center rounded-full bg-white">
            <Ionicons name="arrow-back" size={20} color={palette.text} />
          </Pressable>
          <Text className="font-beSemiBold text-base text-[#261F1A]">Password help</Text>
          <View className="h-11 w-11" />
        </View>

        <View className="mt-6 rounded-[26px] bg-white p-5">
          <Text className="font-beBold text-xl text-[#261F1A]">Need help signing in?</Text>
          <Text className="mt-3 font-beRegular text-sm leading-7 text-[#4F433B]">
            This prototype does not connect to a live authentication service yet. You can continue exploring the app by signing in normally or creating a new account.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
