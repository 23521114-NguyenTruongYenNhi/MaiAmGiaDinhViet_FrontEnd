import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { CustomButton } from '@/components/ui/custom-button';
import { families } from '@/data/mock';
import { palette } from '@/constants/design';

export default function FamilyStoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const family = families.find((item) => item.id === id) ?? families[0];
  const [copied, setCopied] = useState(false);
  const imageAnim = useRef(new Animated.Value(0.96)).current;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(family.accountNumber);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  useEffect(() => {
    Animated.spring(imageAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [imageAnim]);

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <ScrollView className="px-5 pt-4">
        <Text className="font-beBold text-3xl tracking-tight text-[#2B2B2B]">Family Story</Text>
        <Animated.Image
          source={{ uri: family.image }}
          className="mt-4 h-52 w-full rounded-3xl"
          style={{ transform: [{ scale: imageAnim }] }}
        />

        <Text className="mt-4 font-beSemiBold text-2xl tracking-tight text-primary">{family.name}</Text>
        <Text className="mt-2 font-beRegular text-sm leading-6 text-[#6E635B]">{family.description}</Text>

        <View className="mt-6 rounded-3xl border border-[#E7DED4] bg-white p-5">
          <Text className="font-beSemiBold text-lg tracking-tight text-primary">Direct Donation Info</Text>
          <Text className="mt-3 font-beMedium text-xs uppercase text-[#9B9086]">Bank Name</Text>
          <Text className="mt-1 font-beSemiBold text-base text-[#2B2B2B]">{family.bank}</Text>
          <Text className="mt-3 font-beMedium text-xs uppercase text-[#9B9086]">Beneficiary</Text>
          <Text className="mt-1 font-beSemiBold text-base text-[#2B2B2B]">{family.beneficiary}</Text>
          <Text className="mt-3 font-beMedium text-xs uppercase text-[#9B9086]">Account Number</Text>
          <Text className="mt-1 font-beSemiBold text-base text-[#2B2B2B]">{family.accountNumber}</Text>

          <CustomButton label="Copy Account Number" variant="outline" onPress={handleCopy} className="mt-4" />
          {copied ? (
            <Pressable className="mt-2 self-start rounded-full bg-[#E9F8EE] px-3 py-1">
              <Text className="font-beMedium text-xs" style={{ color: palette.success }}>
                Copied!
              </Text>
            </Pressable>
          ) : null}
          <CustomButton label="Open Banking App" variant="primary" className="mt-3" />
          <View className="mt-3 flex-row items-center justify-center gap-1">
            <Ionicons name="shield-checkmark" size={14} color={palette.primary} />
            <Text className="font-beMedium text-xs text-primary">Verified by Mái Ấm Gia Đình Việt</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
