import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormattedContent, getContentPreview } from '@/components/ui/formatted-content';
import { palette } from '@/constants/design';
import { BackendNews, formatDate, getBackendNewsDetail } from '@/data/backend';
import { safeBack } from '@/data/navigation';

export default function UpdateDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [article, setArticle] = useState<BackendNews | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadArticle() {
      const row = await getBackendNewsDetail(id);
      if (mounted) {
        setArticle(row);
      }
    }

    void loadArticle();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (!article) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#FAF7F2]">
        <Text className="font-beSemiBold text-sm text-[#756B63]">Loading update...</Text>
      </SafeAreaView>
    );
  }

  const preview = getContentPreview(article.content);

  return (
    <SafeAreaView className="flex-1 bg-[#FAF7F2]" edges={['top', 'bottom']}>
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
        <View className="mt-3 flex-row items-center justify-between">
          <Pressable onPress={() => safeBack('/(tabs)/news')} className="h-11 w-11 items-center justify-center rounded-full bg-white">
            <Ionicons name="arrow-back" size={20} color={palette.text} />
          </Pressable>
          <Text className="font-beSemiBold text-base text-[#261F1A]">Program update</Text>
          <View className="h-11 w-11" />
        </View>

        <View className="mt-4 self-start rounded-full bg-[#F3EAE1] px-3 py-1.5">
          <Text className="font-beBold text-[10px] uppercase text-primary">{article.type}</Text>
        </View>
        <Text className="mt-4 font-beBold text-[28px] leading-[34px] text-[#261F1A]">{article.title}</Text>
        <Text className="mt-2 font-beMedium text-xs uppercase text-[#B7842D]">
          {formatDate(article.published_at ?? article.created_at)}
        </Text>

        {preview ? (
          <View className="mt-5 rounded-[26px] border border-[#E7DED4] bg-[#FFF9F0] p-5">
            <View className="flex-row items-center">
              <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-white">
                <Ionicons name="sparkles-outline" size={16} color={palette.primary} />
              </View>
              <Text className="font-beMedium text-xs uppercase text-[#9B9086]">In brief</Text>
            </View>
            <Text className="mt-3 font-beSemiBold text-base leading-7 text-[#261F1A]">{preview}</Text>
          </View>
        ) : null}

        <View className="mt-4 rounded-[26px] bg-white p-5">
          <FormattedContent text={article.content} emptyText="No content provided." />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
