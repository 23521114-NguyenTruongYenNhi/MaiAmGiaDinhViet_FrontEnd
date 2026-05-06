import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomButton } from '@/components/ui/custom-button';
import { families } from '@/data/mock';
import { palette } from '@/constants/design';

export default function FamilyStoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const family = families.find((item) => item.id === id) ?? families[0];
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(family.accountNumber);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF7F2]" edges={['top', 'bottom']}>
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
        <View className="mt-3 flex-row items-center justify-between">
          <Pressable onPress={() => router.back()} className="h-11 w-11 items-center justify-center rounded-full bg-white">
            <Ionicons name="arrow-back" size={20} color={palette.text} />
          </Pressable>
          <Text className="font-beSemiBold text-base text-[#261F1A]">Family support</Text>
          <View className="h-11 w-11" />
        </View>

        <Image source={family.image} className="mt-4 h-60 w-full rounded-[28px]" resizeMode="cover" />

        <View className="mt-5 flex-row items-start justify-between">
          <View className="mr-4 flex-1">
            <Text className="font-beBold text-[28px] leading-[34px] text-[#261F1A]">{family.name}</Text>
            <Text className="mt-2 font-beRegular text-sm leading-6 text-[#6E635B]">{family.description}</Text>
          </View>
          <View className={`rounded-full px-3 py-2 ${family.urgency === 'High' ? 'bg-[#FDECEC]' : 'bg-[#F3EAE1]'}`}>
            <Text className={`font-beBold text-[10px] uppercase ${family.urgency === 'High' ? 'text-[#B3261E]' : 'text-primary'}`}>
              {family.urgency} urgency
            </Text>
          </View>
        </View>

        <View className="mt-5 rounded-[26px] bg-white p-5">
          <Text className="font-beSemiBold text-lg text-[#261F1A]">Family overview</Text>
          <View className="mt-4 flex-row">
            <View className="mr-3 flex-1 rounded-2xl bg-[#FAF7F2] p-3">
              <Text className="font-beMedium text-xs uppercase text-[#9B9086]">Location</Text>
              <Text className="mt-1 font-beSemiBold text-sm text-[#261F1A]">{family.location}</Text>
            </View>
            <View className="flex-1 rounded-2xl bg-[#FAF7F2] p-3">
              <Text className="font-beMedium text-xs uppercase text-[#9B9086]">Children</Text>
              <Text className="mt-1 font-beSemiBold text-sm text-[#261F1A]">{family.childrenCount}</Text>
            </View>
          </View>
          <View className="mt-3 rounded-2xl bg-[#FAF7F2] p-3">
            <Text className="font-beMedium text-xs uppercase text-[#9B9086]">Primary support focus</Text>
            <Text className="mt-1 font-beRegular text-sm leading-6 text-[#4F433B]">{family.supportFocus}</Text>
          </View>
          <Text className="mt-4 font-beMedium text-xs uppercase text-[#B7842D]">{family.lastVerified}</Text>
        </View>

        <View className="mt-5 rounded-[26px] border border-[#E7DED4] bg-white p-5">
          <Text className="font-beSemiBold text-lg text-primary">Direct donation details</Text>
          <Text className="mt-3 font-beMedium text-xs uppercase text-[#9B9086]">Bank name</Text>
          <Text className="mt-1 font-beSemiBold text-base text-[#2B2B2B]">{family.bank}</Text>
          <Text className="mt-3 font-beMedium text-xs uppercase text-[#9B9086]">Beneficiary</Text>
          <Text className="mt-1 font-beSemiBold text-base text-[#2B2B2B]">{family.beneficiary}</Text>
          <Text className="mt-3 font-beMedium text-xs uppercase text-[#9B9086]">Account number</Text>
          <Text className="mt-1 font-beSemiBold text-base text-[#2B2B2B]">{family.accountNumber}</Text>
          <Text className="mt-3 font-beMedium text-xs uppercase text-[#9B9086]">Estimated monthly need</Text>
          <Text className="mt-1 font-beSemiBold text-base text-[#2B2B2B]">{family.monthlyNeed}</Text>

          <CustomButton label="Copy account number" variant="outline" onPress={handleCopy} className="mt-4" />
          {copied ? (
            <View className="mt-2 self-start rounded-full bg-[#E9F8EE] px-3 py-1">
              <Text className="font-beMedium text-xs" style={{ color: palette.success }}>
                Account number copied
              </Text>
            </View>
          ) : null}

          <CustomButton label="Open support guide" variant="primary" onPress={() => router.push('/(tabs)/ai-compass')} className="mt-3" />
          <View className="mt-3 flex-row items-center justify-center gap-1">
            <Ionicons name="shield-checkmark" size={14} color={palette.primary} />
            <Text className="font-beMedium text-xs text-primary">Verified by Mai Am Gia Dinh Viet</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
