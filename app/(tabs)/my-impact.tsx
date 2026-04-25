import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { CategoryTag } from '@/components/ui/category-tag';
import { families } from '@/data/mock';
import { palette } from '@/constants/design';

export default function MyImpactScreen() {
  const [activeTab, setActiveTab] = useState<'Favorites' | 'Helped'>('Favorites');

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <ScrollView className="px-5 pt-4">
        <Text className="font-beBold text-3xl tracking-tight text-[#2B2B2B]">My Impact</Text>
        <Text className="mt-1 font-beRegular text-sm text-[#7F7269]">Xin chào, Alex</Text>

        <View className="mt-4 flex-row gap-3">
          <View className="flex-1 rounded-3xl bg-white p-4">
            <Text className="font-beBold text-2xl text-primary">12</Text>
            <Text className="mt-1 font-beMedium text-xs text-[#7F7269]">Families Helped</Text>
          </View>
          <View className="flex-1 rounded-3xl bg-white p-4">
            <Text className="font-beBold text-2xl text-primary">156</Text>
            <Text className="mt-1 font-beMedium text-xs text-[#7F7269]">Days Active</Text>
          </View>
        </View>

        <View className="mt-4 flex-row gap-2">
          <Pressable
            onPress={() => setActiveTab('Favorites')}
            className={`rounded-full px-4 py-2 ${activeTab === 'Favorites' ? 'bg-primary' : 'bg-[#F2ECE4]'}`}>
            <Text className={`font-beSemiBold text-xs ${activeTab === 'Favorites' ? 'text-white' : 'text-primary'}`}>
              Favorites
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('Helped')}
            className={`rounded-full px-4 py-2 ${activeTab === 'Helped' ? 'bg-primary' : 'bg-[#F2ECE4]'}`}>
            <Text className={`font-beSemiBold text-xs ${activeTab === 'Helped' ? 'text-white' : 'text-primary'}`}>
              Helped
            </Text>
          </Pressable>
        </View>

        <Text className="mb-3 mt-6 font-beSemiBold text-lg tracking-tight text-primary">Transparency Timeline</Text>
        <FlatList
          data={families}
          scrollEnabled={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => {
            const completed = index === 0 || item.progress >= 60;
            return (
              <View className="mb-4 flex-row">
                <View className="mr-3 items-center">
                  <View
                    className="h-5 w-5 items-center justify-center rounded-full"
                    style={{ backgroundColor: completed ? palette.success : palette.primary }}>
                    <Ionicons name={completed ? 'checkmark' : 'time-outline'} size={12} color={palette.white} />
                  </View>
                  {index < families.length - 1 ? <View className="mt-1 h-20 w-[2px] bg-[#DCCEC1]" /> : null}
                </View>
                <View className="flex-1 rounded-3xl border border-[#E7DED4] bg-white p-4">
                  <View className="flex-row items-center justify-between">
                    <Text className="font-beSemiBold text-base text-[#2B2B2B]">{item.name}</Text>
                    {completed ? <CategoryTag label="Success" highlighted /> : null}
                  </View>
                  <Text className="mt-1 font-beRegular text-sm leading-6 text-[#7F7269]">
                    Progress milestone reached: {item.progress}%
                  </Text>
                  <View className="mt-2">
                    <CategoryTag label={activeTab} highlighted={activeTab === 'Favorites'} />
                  </View>
                </View>
              </View>
            );
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
