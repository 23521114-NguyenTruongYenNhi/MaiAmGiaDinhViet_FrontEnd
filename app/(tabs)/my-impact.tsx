import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CategoryTag } from '@/components/ui/category-tag';
import { ScreenHeader } from '@/components/ui/screen-header';
import { palette } from '@/constants/design';
import { episodes, families } from '@/data/mock';

type Filter = 'All' | 'Priority' | 'Verified';

export default function FamiliesScreen() {
  const [activeFilter, setActiveFilter] = useState<Filter>('All');
  const priorityFamily = families.find((family) => family.urgency === 'High') ?? families[0];

  const filteredFamilies = families.filter((family) => {
    if (activeFilter === 'Priority') {
      return family.urgency === 'High';
    }
    if (activeFilter === 'Verified') {
      return family.lastVerified.includes('May');
    }
    return true;
  });

  return (
    <SafeAreaView className="flex-1 bg-[#FAF7F2]" edges={['top', 'left', 'right']}>
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <ScreenHeader title="Broadcast Families" icon="heart-circle" meta="Aired stories" />

          <Pressable onPress={() => router.push(`/family/${priorityFamily.id}`)} className="mt-5 overflow-hidden bg-white" style={styles.priorityCard}>
            <Image source={priorityFamily.image} resizeMode="cover" style={styles.priorityImage} />
            <View className="absolute left-4 right-4 top-4 flex-row items-start justify-between">
              <View className="flex-row items-center rounded-full bg-white px-3 py-2">
                <Ionicons name="location" size={13} color={palette.primary} />
                <Text className="ml-1 font-beBold text-[11px] uppercase text-primary">{priorityFamily.location}</Text>
              </View>
              <View className="rounded-full bg-[#FDECEC] px-3 py-2">
                <Text className="font-beBold text-[10px] uppercase text-[#B3261E]">{priorityFamily.urgency} priority</Text>
              </View>
            </View>

            <View className="p-5">
              <View className="mb-3 self-start rounded-full bg-[#F3EAE1] px-3 py-1.5">
                <Text className="font-beBold text-[10px] uppercase text-primary">Featured from episode 1</Text>
              </View>
              <Text className="font-beBold text-[25px] leading-[31px] text-[#261F1A]">{priorityFamily.name}</Text>
              <Text className="mt-2 font-beRegular text-sm leading-6 text-[#756B63]" numberOfLines={2}>
                {priorityFamily.supportFocus}
              </Text>
              <View className="mt-4 rounded-[20px] bg-[#FAF7F2] p-4">
                <Text className="font-beMedium text-xs uppercase text-[#9B9086]">Monthly support need</Text>
                <Text className="mt-1 font-beSemiBold text-sm text-[#261F1A]">{priorityFamily.monthlyNeed}</Text>
                <Text className="mt-2 font-beRegular text-xs leading-5 text-[#756B63]">Bank details are available inside the family profile.</Text>
              </View>
            </View>
          </Pressable>

          <View className="mt-6">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="font-beBold text-lg text-[#261F1A]">Recently aired</Text>
              <Text className="font-beMedium text-xs uppercase text-[#B7842D]">Episodes</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.spotlightList}>
              {families.map((family, index) => (
                <Pressable
                  key={`spotlight-${family.id}`}
                  onPress={() => router.push(`/family/${family.id}`)}
                  className="overflow-hidden rounded-[22px] bg-white"
                  style={[styles.spotlightCard, index !== families.length - 1 && styles.spotlightSpacing]}
                >
                  <Image source={family.image} resizeMode="cover" style={styles.spotlightImage} />
                  <View className="p-3">
                    <View className="self-start rounded-full bg-[#FDECEC] px-2.5 py-1">
                      <Text className="font-beBold text-[9px] uppercase text-[#B3261E]">Episode {index + 1}</Text>
                    </View>
                    <Text className="mt-2 font-beBold text-sm text-[#261F1A]" numberOfLines={1}>{family.name}</Text>
                    <Text className="mt-1 font-beRegular text-[11px] leading-4 text-[#756B63]" numberOfLines={2}>{episodes[index]?.title ?? family.supportFocus}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View className="mb-4 mt-5 flex-row gap-2">
            {(['All', 'Priority', 'Verified'] as Filter[]).map((filter) => (
              <CategoryTag key={filter} label={filter} highlighted={activeFilter === filter} onPress={() => setActiveFilter(filter)} />
            ))}
          </View>

          {filteredFamilies.map((family, index) => (
            <Pressable key={family.id} onPress={() => router.push(`/family/${family.id}`)} className="mb-4 overflow-hidden rounded-[28px] bg-white" style={styles.familyCard}>
              <Image source={family.image} style={styles.familyImage} resizeMode="cover" />

              <View className="absolute left-4 top-4 flex-row">
                <View className="mr-2 flex-row items-center rounded-full bg-primary px-3 py-2">
                  <Ionicons name="location" size={12} color="#fff" />
                  <Text className="ml-1 font-beBold text-[10px] uppercase text-white">{family.location}</Text>
                </View>
                <View className={`rounded-full px-3 py-2 ${family.urgency === 'High' ? 'bg-[#FDECEC]' : 'bg-[#F3EAE1]'}`}>
                  <Text className={`font-beBold text-[10px] uppercase ${family.urgency === 'High' ? 'text-[#B3261E]' : 'text-primary'}`}>
                    {family.urgency} priority
                  </Text>
                </View>
              </View>

              <View className="p-4">
                <View className="flex-row items-start justify-between">
                  <View className="mr-3 flex-1">
                    <Text className="font-beBold text-xl text-[#261F1A]">{family.name}</Text>
                    <Text className="mt-1 font-beMedium text-xs uppercase text-[#B7842D]">Featured in episode {index + 1}</Text>
                  </View>
                  <Ionicons name="heart" size={20} color={palette.primary} />
                </View>

                <Text className="mt-2 font-beRegular text-sm leading-6 text-[#756B63]">{family.description}</Text>

                <View className="mt-4 flex-row rounded-[22px] bg-[#FAF7F2] p-4">
                  <View className="flex-1 pr-3">
                    <Text className="font-beMedium text-xs uppercase text-[#9B9086]">Primary need</Text>
                    <Text className="mt-1 font-beSemiBold text-sm leading-5 text-[#261F1A]" numberOfLines={2}>{family.supportFocus}</Text>
                  </View>
                  <View style={styles.verticalDivider} />
                  <View className="flex-1 pl-3">
                    <Text className="font-beMedium text-xs uppercase text-[#9B9086]">Monthly support</Text>
                    <Text className="mt-1 font-beSemiBold text-sm text-[#261F1A]">{family.monthlyNeed}</Text>
                  </View>
                </View>

                <View className="mt-4 flex-row items-center justify-between">
                  <Text className="font-beMedium text-xs uppercase text-[#B7842D]">{family.lastVerified}</Text>
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-primary">
                    <Ionicons name="arrow-forward" size={17} color="#fff" />
                  </View>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  familyCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  familyImage: {
    width: '100%',
    height: 220,
  },
  page: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 430,
  },
  priorityCard: {
    borderRadius: 30,
    shadowColor: '#8B1D1D',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 5,
  },
  priorityImage: {
    height: 220,
    width: '100%',
  },
  spotlightCard: {
    width: 172,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  spotlightImage: {
    height: 104,
    width: '100%',
  },
  spotlightList: {
    paddingRight: 16,
  },
  spotlightSpacing: {
    marginRight: 12,
  },
  verticalDivider: {
    backgroundColor: '#E7DED4',
    width: 1,
  },
});
