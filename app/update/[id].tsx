import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette } from '@/constants/design';
import { newsFeed } from '@/data/mock';

export default function UpdateDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const article = newsFeed.find((item) => item.id === id) ?? newsFeed[0];

  return (
    <SafeAreaView className="flex-1 bg-[#FAF7F2]" edges={['top', 'bottom']}>
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
        <View className="mt-3 flex-row items-center justify-between">
          <Pressable onPress={() => router.back()} className="h-11 w-11 items-center justify-center rounded-full bg-white">
            <Ionicons name="arrow-back" size={20} color={palette.text} />
          </Pressable>
          <Text className="font-beSemiBold text-base text-[#261F1A]">Program update</Text>
          <View className="h-11 w-11" />
        </View>

        <View className="mt-4 rounded-full self-start bg-[#F3EAE1] px-3 py-1.5">
          <Text className="font-beBold text-[10px] uppercase text-primary">{article.category}</Text>
        </View>
        <Text className="mt-4 font-beBold text-[28px] leading-[34px] text-[#261F1A]">{article.title}</Text>
        <Text className="mt-2 font-beMedium text-xs uppercase text-[#B7842D]">
          {article.date} - {article.readTime}
        </Text>

        <View className="mt-5 rounded-[26px] bg-white p-5">
          <Text className="font-beRegular text-sm leading-7 text-[#4F433B]">{article.body}</Text>
          <Text className="mt-4 font-beRegular text-sm leading-7 text-[#4F433B]">{article.excerpt}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
