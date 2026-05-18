import { Ionicons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  Image,
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DonationCard } from '@/components/ui/donation-card';
import { getContentPreview } from '@/components/ui/formatted-content';
import { PulseSkeleton } from '@/components/ui/pulse-skeleton';
import { appCopy, palette } from '@/constants/design';
import { combineFamilyStories, FamilyStory, formatDate, getBackendCases, getBackendEpisodes, getBackendFamilies, getBackendNews, BackendEpisode, BackendNews, imageFromUrl } from '@/data/backend';
import { cleanEpisodeDescription } from '@/data/episode-details';
import { episodes, families, featuredCampaigns, newsFeed } from '@/data/mock';

function SectionHeader({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) {
  return (
    <View className="mb-4 flex-row items-center justify-between">
      <View className="flex-1 flex-row items-center pr-3">
        <View className="mr-3 w-1.5 rounded-full bg-primary" style={styles.sectionRail} />
        <Text className="flex-1 font-beBold text-[24px] leading-[30px] text-[#261F1A]">{title}</Text>
      </View>
      {action ? (
        <Pressable onPress={onPress} className="flex-row items-center rounded-full bg-[#F3EAE1] px-3 py-2" hitSlop={8}>
          <Text className="font-beSemiBold text-xs text-primary">{action}</Text>
          <Ionicons name="chevron-forward" size={14} color={palette.primary} style={{ marginLeft: 3 }} />
        </Pressable>
      ) : null}
    </View>
  );
}

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [backendStories, setBackendStories] = useState<FamilyStory[]>([]);
  const [backendEpisodes, setBackendEpisodes] = useState<BackendEpisode[]>([]);
  const [backendNews, setBackendNews] = useState<BackendNews[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadHomeData() {
      setLoading(true);
      const [episodeRows, caseRows, familyRows, newsRows] = await Promise.all([
        getBackendEpisodes(),
        getBackendCases(),
        getBackendFamilies(),
        getBackendNews(),
      ]);

      if (mounted) {
        setBackendEpisodes([...episodeRows].sort((a, b) => b.episode_no - a.episode_no));
        setBackendStories(combineFamilyStories(caseRows, familyRows, episodeRows));
        setBackendNews(newsRows);
        setLoading(false);
      }
    }

    void loadHomeData();
    return () => {
      mounted = false;
    };
  }, []);

  const topStory = featuredCampaigns[0];
  const latestEpisode = backendEpisodes[0];
  const displayEpisodes = backendEpisodes.length
    ? backendEpisodes.slice(0, 8).map((episode, index) => ({
        id: episode.id,
        title: episode.title,
        summary: cleanEpisodeDescription(episode.description, episode.episode_no),
        meta: formatDate(episode.air_date),
        badge: `Ep ${episode.episode_no}`,
        image: imageFromUrl(null, index),
      }))
    : episodes.map((episode) => ({
        id: episode.id,
        title: episode.title,
        summary: episode.summary,
        meta: episode.host,
        badge: episode.duration,
        image: episode.thumbnail,
      }));
  const displayStories = backendStories.length
    ? backendStories.slice(0, 2).map((story) => ({
        id: story.caseId,
        title: story.name,
        description: `${story.location} - ${story.description}`,
        image: story.image,
      }))
    : families.slice(0, 2).map((family) => ({
        id: family.id,
        title: family.name,
        description: `${family.location} - ${family.description}`,
        image: family.image,
      }));
  const displayNews = backendNews.length
    ? backendNews.slice(0, 4).map((item) => ({
        id: item.id,
        title: item.title,
        category: item.type,
        meta: formatDate(item.published_at ?? item.created_at),
        excerpt: getContentPreview(item.content, 150),
        isNew: false,
      }))
    : newsFeed.map((item) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        meta: item.readTime,
        excerpt: item.excerpt,
        isNew: Boolean(item.isNew),
      }));

  return (
    <SafeAreaView className="flex-1 bg-[#FAF7F2]" edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      <ScrollView className="flex-1" contentContainerStyle={styles.scrollContent} contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <View className="bg-[#FAF7F2] px-4 pb-3">
            <View className="flex-row items-center justify-between">
              <Pressable onPress={() => router.push('/menu')} className="h-11 w-11 items-center justify-center rounded-full bg-white" style={styles.headerButton}>
                <Ionicons name="menu" size={21} color={palette.text} />
              </Pressable>

              <Image source={require('../../assets/images/logo.webp')} resizeMode="contain" style={styles.logo} accessible accessibilityLabel={appCopy.appName} />

              <Pressable onPress={() => router.push('/notifications')} className="h-11 w-11 items-center justify-center rounded-full bg-white" style={styles.headerButton}>
                <Ionicons name="notifications-outline" size={21} color={palette.text} />
                <View className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary" />
              </Pressable>
            </View>
          </View>

          <View className="px-4">
            {loading ? (
              <PulseSkeleton className="h-[430px] w-full rounded-[28px]" />
            ) : (
              <Pressable onPress={() => router.push('/(tabs)/families')} className="overflow-hidden rounded-[28px] bg-white" style={styles.heroCard}>
                <ImageBackground source={topStory.image} resizeMode="cover" style={styles.heroImage}>
                  <View style={styles.heroOverlay} />
                  <View className="flex-1 justify-between p-5">
                    <View className="self-start rounded-full bg-white/90 px-3 py-2">
                      <Text className="font-beBold text-xs uppercase text-primary">Latest broadcast</Text>
                    </View>

                    <View>
                      <Text className="font-beBold text-[30px] leading-[38px] text-white" numberOfLines={3}>
                        {latestEpisode?.title ?? topStory.title}
                      </Text>
                      <Text className="mt-2 font-beMedium text-[15px] leading-6 text-white/90" numberOfLines={3}>
                        {latestEpisode ? cleanEpisodeDescription(latestEpisode.description, latestEpisode.episode_no) : topStory.subtitle}
                      </Text>

                      <View className="mt-5 self-start flex-row items-center rounded-full bg-white px-4 py-3">
                        <Text className="font-beBold text-sm text-primary">Explore families</Text>
                        <Ionicons name="arrow-forward" size={16} color={palette.primary} style={{ marginLeft: 8 }} />
                      </View>
                    </View>
                  </View>
                </ImageBackground>
              </Pressable>
            )}

            <View className="mt-5 flex-row">
              <Pressable onPress={() => router.push('/(tabs)/families')} className="mr-3 flex-1 rounded-2xl bg-primary px-4 py-4" style={styles.actionCard}>
                <Ionicons name="people" size={22} color="#fff" />
                <Text className="mt-2 font-beBold text-base text-white">Support families</Text>
                <Text className="mt-1 font-beRegular text-xs leading-5 text-white/80">Verified household profiles</Text>
              </Pressable>

              <Pressable onPress={() => router.push('/(tabs)/ai-compass')} className="flex-1 rounded-2xl bg-white px-4 py-4" style={styles.actionCard}>
                <Ionicons name="chatbubbles" size={24} color={palette.primary} />
                <Text className="mt-2 font-beBold text-base text-[#261F1A]">Ask & Find</Text>
                <Text className="mt-1 font-beRegular text-xs leading-5 text-[#756B63]">Search families, episodes, and donations</Text>
              </Pressable>
            </View>
          </View>

          <View className="mt-7 bg-white px-4 py-6">
            <SectionHeader title="Featured Stories" action="View all" onPress={() => router.push('/(tabs)/episodes')} />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              {displayEpisodes.map((episode, index) => (
                <Pressable
                  key={episode.id}
                  onPress={() => router.push(`/episode/${episode.id}` as Href)}
                  className="overflow-hidden rounded-2xl bg-[#FAF7F2]"
                  style={[styles.episodeCard, index !== episodes.length - 1 && styles.itemSpacing]}
                >
                  <View>
                    <Image source={episode.image} resizeMode="cover" style={styles.episodeImage} />
                    <View className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-1">
                      <Text className="font-beMedium text-[10px] text-white">{episode.badge}</Text>
                    </View>
                    <View className="absolute left-3 top-3 rounded-full bg-white/92 px-2.5 py-1">
                      <Text className="font-beBold text-[10px] uppercase text-primary">{episode.meta}</Text>
                    </View>
                  </View>
                  <View className="p-3">
                    <Text className="font-beSemiBold text-[14px] leading-5 text-[#261F1A]" numberOfLines={2}>
                      {episode.title}
                    </Text>
                    <Text className="mt-1 font-beRegular text-xs leading-5 text-[#756B63]" numberOfLines={2}>
                      {episode.summary}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>

          </View>

          <View className="bg-[#FAF7F2] px-4 py-6">
            <SectionHeader title="Verified Families" action="View all" onPress={() => router.push('/(tabs)/families')} />
            {loading ? (
              <PulseSkeleton className="mb-4 h-64 w-full rounded-2xl" />
            ) : (
              displayStories.map((family) => (
        <DonationCard
                  key={family.id}
                  title={family.title}
                  image={family.image}
                  onPress={() => router.push(`/family/${family.id}`)}
                />
              ))
            )}
          </View>

          <View className="bg-white px-4 py-6">
            <SectionHeader title="News & Updates" action="Open feed" onPress={() => router.push('/(tabs)/news')} />

            {displayNews.map((news, index) => (
              <Pressable
                key={news.id}
                onPress={() => router.push({ pathname: '/update/[id]', params: { id: news.id } })}
                className="flex-row py-4"
                style={index !== displayNews.length - 1 ? styles.newsDivider : undefined}
              >
                <View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-[#F3EAE1]">
                  <Ionicons name={'isNew' in news && news.isNew ? 'sparkles' : 'newspaper-outline'} size={19} color={palette.primary} />
                </View>
                <View className="flex-1">
                  <View className="mb-1 flex-row items-center justify-between">
                    <Text className="font-beBold text-[11px] uppercase text-[#B7842D]">{news.category}</Text>
                    <Text className="font-beMedium text-[11px] text-[#8E8177]">{news.meta}</Text>
                  </View>
                  <Text className="font-beSemiBold text-[15px] leading-6 text-[#261F1A]" numberOfLines={2}>
                    {news.title}
                  </Text>
                  <Text className="mt-1 font-beRegular text-sm leading-5 text-[#756B63]" numberOfLines={2}>
                    {news.excerpt}
                  </Text>
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
  actionCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: Platform.OS === 'ios' ? 0.08 : 0.05,
    shadowRadius: 18,
    elevation: 3,
  },
  episodeCard: {
    width: 244,
  },
  episodeImage: {
    height: 138,
    width: '100%',
  },
  headerButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: Platform.OS === 'ios' ? 0.08 : 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  heroCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: Platform.OS === 'ios' ? 0.16 : 0.1,
    shadowRadius: 28,
    elevation: 5,
  },
  heroImage: {
    height: 430,
    overflow: 'hidden',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(34, 24, 19, 0.44)',
  },
  horizontalList: {
    paddingRight: 16,
  },
  itemSpacing: {
    marginRight: 14,
  },
  logo: {
    height: 66,
    width: 212,
  },
  newsDivider: {
    borderBottomColor: '#EFE6DD',
    borderBottomWidth: 1,
  },
  page: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 430,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  sectionRail: {
    alignSelf: 'stretch',
    minHeight: 30,
  },
});
