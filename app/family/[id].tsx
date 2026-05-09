import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormattedContent } from '@/components/ui/formatted-content';
import { CustomButton } from '@/components/ui/custom-button';
import { palette } from '@/constants/design';
import { combineFamilyStories, FamilyStory, formatDate, getBackendCaseDetail, getBackendEpisodes } from '@/data/backend';
import { safeBack } from '@/data/navigation';

export default function FamilyStoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [story, setStory] = useState<FamilyStory | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadDetail() {
      const [caseDetail, episodes] = await Promise.all([
        getBackendCaseDetail(id),
        getBackendEpisodes(),
      ]);
      const rows = combineFamilyStories([caseDetail], caseDetail.family ? [caseDetail.family] : [], episodes);
      if (mounted) {
        setStory(rows[0]);
      }
    }

    void loadDetail();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleCopy = async () => {
    if (!story?.accountNumber) {
      return;
    }

    await Clipboard.setStringAsync(story.accountNumber);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!story) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#FAF7F2]">
        <Text className="font-beSemiBold text-sm text-[#756B63]">Loading family profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FAF7F2]" edges={['top', 'bottom']}>
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
        <View className="mt-3 flex-row items-center justify-between">
          <Pressable onPress={() => safeBack('/(tabs)/families')} className="h-11 w-11 items-center justify-center rounded-full bg-white">
            <Ionicons name="arrow-back" size={20} color={palette.text} />
          </Pressable>
          <Text className="font-beSemiBold text-base text-[#261F1A]">Family profile</Text>
          <View className="h-11 w-11" />
        </View>

        <Image source={story.image} className="mt-4 h-60 w-full rounded-[28px]" resizeMode="cover" />

        <View className="mt-5 flex-row items-start justify-between">
          <View className="mr-4 flex-1">
            <Text className="font-beBold text-[28px] leading-[34px] text-[#261F1A]">{story.name}</Text>
          </View>
          <View className="rounded-full bg-[#F3EAE1] px-3 py-2">
            <Text className="font-beBold text-[10px] uppercase text-primary">{story.status}</Text>
          </View>
        </View>

        <View className="mt-5 rounded-[26px] bg-white p-5">
          <Text className="font-beSemiBold text-lg text-[#261F1A]">Broadcast overview</Text>
          <View className="mt-4 flex-row">
            <View className="mr-3 flex-1 rounded-2xl bg-[#FAF7F2] p-3">
              <Text className="font-beMedium text-xs uppercase text-[#9B9086]">Location</Text>
              <Text className="mt-1 font-beSemiBold text-sm text-[#261F1A]">{story.location}</Text>
            </View>
            <View className="flex-1 rounded-2xl bg-[#FAF7F2] p-3">
              <Text className="font-beMedium text-xs uppercase text-[#9B9086]">Episode</Text>
              <Text className="mt-1 font-beSemiBold text-sm text-[#261F1A]">{story.episodeNo}</Text>
            </View>
          </View>

          {story.supportFocus ? (
            <View className="mt-3 rounded-2xl border border-[#E7DED4] bg-[#FFF9F0] p-4">
              <View className="flex-row items-center">
                <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-white">
                  <Ionicons name="heart-outline" size={16} color={palette.primary} />
                </View>
                <Text className="font-beMedium text-xs uppercase text-[#9B9086]">Key need</Text>
              </View>
              <Text className="mt-3 font-beSemiBold text-base leading-6 text-[#261F1A]">{story.supportFocus}</Text>
            </View>
          ) : null}

          <View className="mt-3 rounded-2xl bg-[#FAF7F2] p-4">
            <Text className="font-beMedium text-xs uppercase text-[#9B9086]">Story</Text>
            <View className="mt-3">
              <FormattedContent text={story.story} emptyText="No story provided." />
            </View>
          </View>

          <View className="mt-3 flex-row flex-wrap gap-2">
            {story.supportCategory ? (
              <View className="rounded-full bg-[#F3EAE1] px-3 py-2">
                <Text className="font-beBold text-[11px] text-primary">{story.supportCategory}</Text>
              </View>
            ) : null}
            {story.priorityLevel ? (
              <View className="rounded-full bg-[#FDECEC] px-3 py-2">
                <Text className="font-beBold text-[11px] text-[#B3261E]">{story.priorityLevel}</Text>
              </View>
            ) : null}
            {story.childrenCount ? (
              <View className="rounded-full bg-[#F3EAE1] px-3 py-2">
                <Text className="font-beBold text-[11px] text-primary">{story.childrenCount} children</Text>
              </View>
            ) : null}
          </View>

          <Text className="mt-4 font-beMedium text-xs uppercase text-[#B7842D]">{story.episodeTitle} - {formatDate(story.episodeDate)}</Text>
        </View>

        <View className="mt-5 rounded-[26px] border border-[#E7DED4] bg-white p-5">
          <Text className="font-beSemiBold text-lg text-primary">Direct donation details</Text>
          <Text className="mt-3 font-beMedium text-xs uppercase text-[#9B9086]">Bank name</Text>
          <Text className="mt-1 font-beSemiBold text-base text-[#2B2B2B]">{story.bank ?? 'Not provided'}</Text>
          <Text className="mt-3 font-beMedium text-xs uppercase text-[#9B9086]">Beneficiary</Text>
          <Text className="mt-1 font-beSemiBold text-base text-[#2B2B2B]">{story.beneficiary ?? 'Not provided'}</Text>
          <Text className="mt-3 font-beMedium text-xs uppercase text-[#9B9086]">Account number</Text>
          <Text className="mt-1 font-beSemiBold text-base text-[#2B2B2B]">{story.accountNumber ?? 'Not provided'}</Text>
          {story.estimatedMonthlyNeed ? (
            <>
              <Text className="mt-3 font-beMedium text-xs uppercase text-[#9B9086]">Estimated monthly need</Text>
              <Text className="mt-1 font-beSemiBold text-base text-[#2B2B2B]">{story.estimatedMonthlyNeed}</Text>
            </>
          ) : null}

          <CustomButton label="Copy account number" variant="outline" onPress={handleCopy} className="mt-4" />
          {copied ? (
            <View className="mt-2 self-start rounded-full bg-[#E9F8EE] px-3 py-1">
              <Text className="font-beMedium text-xs" style={{ color: palette.success }}>
                Account number copied
              </Text>
            </View>
          ) : null}

          <CustomButton label="Ask about this profile" variant="primary" onPress={() => router.push('/(tabs)/ai-compass')} className="mt-3" />
          <View className="mt-3 flex-row items-center justify-center gap-1">
            <Ionicons name="shield-checkmark" size={14} color={palette.primary} />
            <Text className="font-beMedium text-xs text-primary">{story.verificationStatus} by Mai Am Gia Dinh Viet</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
