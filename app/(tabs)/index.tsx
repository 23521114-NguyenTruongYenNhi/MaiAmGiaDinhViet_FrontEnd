import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Image, Pressable, SafeAreaView, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { CategoryTag } from '@/components/ui/category-tag';
import { DonationCard } from '@/components/ui/donation-card';
import { featuredCampaigns, families } from '@/data/mock';
import { PulseSkeleton } from '@/components/ui/pulse-skeleton';
import { palette } from '@/constants/design';

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const cardWidth = width - 40;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  const campaignData = useMemo(() => featuredCampaigns, []);
  const familiesData = useMemo(() => families, []);

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="px-5 pb-10 pt-4">
          <Text className="font-beBold text-3xl tracking-tight text-[#2B2B2B]">Homepage</Text>
          <Text className="mt-1 font-beRegular text-sm text-[#7F7269]">Mái Ấm Gia Đình Việt</Text>

          <Text className="mb-3 mt-6 font-beSemiBold text-lg tracking-tight text-primary">Featured Campaigns</Text>
          {loading ? (
            <PulseSkeleton className="h-56 w-full rounded-2xl" />
          ) : (
            <FlatList
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              data={campaignData}
              keyExtractor={(item) => item.id}
              renderItem={({ item: campaign }) => (
                <View
                  className="mr-3 overflow-hidden bg-white"
                  style={{
                    width: cardWidth,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: palette.border,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.07,
                    shadowRadius: 10,
                    elevation: 2,
                  }}>
                  <Image source={{ uri: campaign.image }} className="h-44 w-full" />
                  <View className="p-4">
                    <Text className="font-beSemiBold text-base text-[#2B2B2B]">{campaign.title}</Text>
                    <Text className="mt-1 font-beRegular text-sm leading-6 text-[#7F7269]">{campaign.subtitle}</Text>
                  </View>
                </View>
              )}
            />
          )}

          <Text className="mb-3 mt-7 font-beSemiBold text-lg tracking-tight text-primary">Families You Can Support</Text>
          {loading ? (
            <>
              <PulseSkeleton className="mb-4 h-56 w-full rounded-2xl" />
              <PulseSkeleton className="mb-4 h-56 w-full rounded-2xl" />
            </>
          ) : (
            <FlatList
              data={familiesData}
              scrollEnabled={false}
              keyExtractor={(item) => item.id}
              removeClippedSubviews
              renderItem={({ item: family }) => (
                <DonationCard
                  title={family.name}
                  description={family.description}
                  image={family.image}
                  progress={family.progress}
                  onPress={() => router.push(`/family/${family.id}`)}
                />
              )}
            />
          )}

          <View className="mt-2 flex-row gap-2">
            <CategoryTag label="Empathy Driven" highlighted />
            <CategoryTag label="Transparent Funding" />
          </View>

          <Pressable className="mt-5 self-start rounded-full bg-primary px-4 py-2">
            <Text className="font-beSemiBold text-white">Join A Family Journey</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
