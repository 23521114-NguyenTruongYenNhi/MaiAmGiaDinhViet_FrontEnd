import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CategoryTag } from '@/components/ui/category-tag';
import { ScreenHeader } from '@/components/ui/screen-header';
import { palette } from '@/constants/design';
import { newsFeed } from '@/data/mock';

type Filter = 'All updates' | 'Community' | 'Verification';

export default function NewsScreen() {
  const [activeFilter, setActiveFilter] = useState<Filter>('All updates');
  const filteredNews = newsFeed.filter((item) => activeFilter === 'All updates' || item.category === activeFilter);
  const featured = filteredNews[0] ?? newsFeed[0];
  const secondary = filteredNews.slice(1);

  return (
    <SafeAreaView className="flex-1 bg-[#FAF7F2]" edges={['top', 'left', 'right']}>
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <ScreenHeader title="News & Updates" icon="newspaper" meta="Feed" />

          <View className="mb-5 mt-5 flex-row gap-2">
            {(['All updates', 'Community', 'Verification'] as Filter[]).map((filter) => (
              <CategoryTag key={filter} label={filter} highlighted={filter === activeFilter} onPress={() => setActiveFilter(filter)} />
            ))}
          </View>

          <Pressable onPress={() => router.push({ pathname: '/update/[id]', params: { id: featured.id } })} className="rounded-[30px] bg-primary p-5" style={styles.featuredCard}>
            <View className="flex-row items-center justify-between">
              <View className="rounded-full bg-white/14 px-3 py-1.5">
                <Text className="font-beBold text-[10px] uppercase text-white">{featured.category}</Text>
              </View>
              <Text className="font-beMedium text-xs text-white/78">{featured.readTime}</Text>
            </View>
            <Text className="mt-5 font-beBold text-[24px] leading-[31px] text-white">{featured.title}</Text>
            <Text className="mt-3 font-beRegular text-sm leading-6 text-white/82" numberOfLines={3}>{featured.excerpt}</Text>
            <View className="mt-5 flex-row items-center justify-between">
              <Text className="font-beSemiBold text-xs uppercase text-[#F0D186]">{featured.date}</Text>
              <View className="h-10 w-10 items-center justify-center rounded-full bg-white">
                <Ionicons name="arrow-forward" size={17} color={palette.primary} />
              </View>
            </View>
          </Pressable>

          <View className="mt-5 flex-row justify-between">
            {secondary.slice(0, 2).map((item) => (
              <Pressable key={item.id} onPress={() => router.push({ pathname: '/update/[id]', params: { id: item.id } })} className="bg-white p-4" style={styles.compactCard}>
                <Ionicons name={item.category === 'Verification' ? 'shield-checkmark' : 'people'} size={22} color={palette.primary} />
                <Text className="mt-4 font-beBold text-[15px] leading-5 text-[#261F1A]" numberOfLines={3}>{item.title}</Text>
                <Text className="mt-3 font-beMedium text-[11px] uppercase text-[#B7842D]">{item.date}</Text>
              </Pressable>
            ))}
          </View>

          <View className="mt-6">
            {filteredNews.map((item) => (
              <Pressable key={item.id} onPress={() => router.push({ pathname: '/update/[id]', params: { id: item.id } })} className="mb-3 flex-row items-center rounded-[24px] bg-white p-4" style={styles.listCard}>
                <View className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-[#F3EAE1]">
                  <Ionicons name={item.isNew ? 'sparkles' : 'newspaper-outline'} size={20} color={palette.primary} />
                </View>
                <View className="flex-1">
                  <Text className="font-beSemiBold text-base leading-6 text-[#261F1A]" numberOfLines={2}>{item.title}</Text>
                  <Text className="mt-1 font-beRegular text-xs text-[#756B63]">{item.category} - {item.readTime}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  compactCard: {
    borderRadius: 24,
    minHeight: 174,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    width: '48%',
    elevation: 2,
  },
  featuredCard: {
    shadowColor: '#8B1D1D',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 22,
    elevation: 5,
  },
  listCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },
  page: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 430,
  },
});
