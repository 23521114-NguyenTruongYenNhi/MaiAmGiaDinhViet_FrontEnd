import { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, Text, View } from 'react-native';
import { CategoryTag } from '@/components/ui/category-tag';
import { newsFeed } from '@/data/mock';
import { PulseSkeleton } from '@/components/ui/pulse-skeleton';

export default function NewsScreen() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="px-5 pt-4">
        <Text className="font-beBold text-3xl tracking-tight text-[#2B2B2B]">News & Updates</Text>
        <View className="mb-4 mt-3 flex-row gap-2">
          <CategoryTag label="All Stories" highlighted />
          <CategoryTag label="Charity Events" />
          <CategoryTag label="Success Stories" />
        </View>
        {loading ? (
          <>
            <PulseSkeleton className="mb-3 h-32 w-full rounded-2xl" />
            <PulseSkeleton className="mb-3 h-32 w-full rounded-2xl" />
            <PulseSkeleton className="mb-3 h-32 w-full rounded-2xl" />
          </>
        ) : (
          <FlatList
            data={newsFeed}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 16 }}
            removeClippedSubviews
            renderItem={({ item }) => (
              <View className="mb-3 rounded-2xl border border-[#E7DED4] bg-white p-4">
                <View className="flex-row items-center gap-2">
                  <CategoryTag label={item.category} />
                  {item.isNew ? <CategoryTag label="New" highlighted /> : null}
                </View>
                <Text className="mt-2 font-beSemiBold text-lg text-[#2B2B2B]">{item.title}</Text>
                <Text className="mt-1 font-beRegular text-sm leading-6 text-[#786F68]">{item.excerpt}</Text>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
