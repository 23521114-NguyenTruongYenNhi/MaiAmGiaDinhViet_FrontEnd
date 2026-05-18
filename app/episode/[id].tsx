import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, ImageBackground, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette } from '@/constants/design';
import {
  BackendEpisode,
  combineFamilyStories,
  FamilyStory,
  formatDate,
  getBackendCases,
  getBackendEpisodes,
  getBackendFamilies,
  imageFromVideoUrl,
} from '@/data/backend';
import { getEpisodeDetail } from '@/data/episode-details';
import { safeBack } from '@/data/navigation';
import { saveRecentlyViewedEpisode } from '@/data/recent-episodes';

type DisplayStory = Pick<FamilyStory, 'caseId' | 'name' | 'description' | 'image'>;

function hasVideoUrl(videoUrl?: string | null) {
  return Boolean(videoUrl && !/^https?:\/\/(?:www\.)?youtu\.be\/?$/i.test(videoUrl.trim()));
}

function iconForCastMember(name: string, fallbackIndex = 0): keyof typeof Ionicons.glyphMap {
  const normalized = name.toLowerCase();

  if (/singer|rapper|bolero/.test(normalized)) {
    return 'mic-outline';
  }

  if (/actor|actress|artist/.test(normalized)) {
    return fallbackIndex % 2 ? 'woman-outline' : 'man-outline';
  }

  if (/miss|runner-up|model|supermodel/.test(normalized)) {
    return 'woman-outline';
  }

  if (/boxer|player|goalkeeper|football|athlete/.test(normalized)) {
    return 'accessibility-outline';
  }

  return 'person-outline';
}

export default function EpisodeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [episode, setEpisode] = useState<BackendEpisode | null>(null);
  const [stories, setStories] = useState<FamilyStory[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadDetail() {
      const [episodeRows, caseRows, familyRows] = await Promise.all([
        getBackendEpisodes(),
        getBackendCases().catch(() => []),
        getBackendFamilies().catch(() => []),
      ]);

      const selected = episodeRows.find((item) => item.id === id) ?? episodeRows[0] ?? null;

      const familyStories = combineFamilyStories(caseRows, familyRows, episodeRows)
        .filter((story) => story.episodeId === selected?.id)
        .slice(0, 3);

      if (mounted) {
        setEpisode(selected);
        setStories(familyStories);
      }

      if (selected) {
        await saveRecentlyViewedEpisode(selected.id).catch(() => undefined);
      }
    }

    void loadDetail();

    return () => {
      mounted = false;
    };
  }, [id]);

  const detail = useMemo(
    () => (episode ? getEpisodeDetail(episode, stories) : null),
    [episode, stories]
  );

  const openEpisodeVideo = async () => {
    const videoUrl = episode?.video_url?.trim();

    if (!videoUrl || !hasVideoUrl(videoUrl)) {
      Alert.alert(
        'Video unavailable',
        'This episode does not have a valid YouTube link yet.'
      );
      return;
    }

    try {
      await Linking.openURL(videoUrl);
    } catch {
      Alert.alert(
        'Cannot open video',
        'Your device could not open the YouTube link.'
      );
    }
  };

  if (!episode || !detail) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#FAF7F2]">
        <Text className="font-beSemiBold text-sm text-[#756B63]">
          Loading episode details...
        </Text>
      </SafeAreaView>
    );
  }

  const displayStories: DisplayStory[] = stories.length
    ? stories
    : detail.families.map((name, index) => ({
        caseId: `${episode.id}-${index}`,
        name,
        description: 'Featured family introduced in this episode.',
        image: imageFromVideoUrl(episode.video_url, index),
      }));

  const castRows = [
    { label: 'Host', name: detail.mc, icon: 'radio-outline' as const },
    ...detail.guests.map((guest, index) => ({
      label: 'Guest',
      name: guest,
      icon: iconForCastMember(guest, index),
    })),
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#FAF7F2]" edges={['top', 'bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        <ImageBackground
          source={imageFromVideoUrl(
            episode.video_url,
            episode.episode_no
          )}
          resizeMode="cover"
          style={styles.hero}
        >
          <View style={styles.heroShade} />

          <View className="flex-1 justify-between px-4 pb-5 pt-3">
            <View className="flex-row items-center justify-between">
              <Pressable
                onPress={() => safeBack('/(tabs)/episodes')}
                className="h-11 w-11 items-center justify-center rounded-full bg-white"
              >
                <Ionicons
                  name="arrow-back"
                  size={20}
                  color={palette.text}
                />
              </Pressable>

              <Pressable
                onPress={openEpisodeVideo}
                className="h-11 flex-row items-center rounded-full bg-white px-4"
              >
                <Ionicons
                  name="play"
                  size={16}
                  color={palette.primary}
                />
                <Text className="ml-2 font-beBold text-xs text-primary">
                  Watch video
                </Text>
              </Pressable>
            </View>

            <View>
              <Text
                style={styles.heroEpisodeTitle}
                className="text-[30px] leading-[36px] text-white"
              >
                EPISODE {episode.episode_no}
              </Text>

              <Text className="mt-3 font-beSemiBold text-sm text-[#F0D186]">
                {formatDate(episode.air_date)}
              </Text>
            </View>
          </View>
        </ImageBackground>

        <View className="px-4">
          <View
            className="-mt-5 rounded-[28px] bg-white p-5"
            style={styles.summaryCard}
          >
            <View className="mb-4 flex-row items-center justify-between">
              <View className="flex-1 pr-3">
                <Text
                  style={styles.sectionTitle}
                  className="text-[20px] leading-6 text-[#261F1A]"
                >
                  EPISODE CAST
                </Text>
              </View>

              <View className="items-end rounded-2xl bg-[#FDECEC] px-3 py-2">
                <Text className="font-beMedium text-[9px] uppercase text-[#B3261E]">
                  Estimated support
                </Text>

                <Text className="mt-1 font-beBold text-sm text-primary">
                  {detail.rewardAmount}
                </Text>
              </View>
            </View>

            {castRows.map((item) => (
              <View
                key={`${item.label}-${item.name}`}
                className="mt-3 flex-row items-center rounded-2xl bg-[#FAF7F2] px-3 py-3"
              >
                <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-white">
                  <Ionicons
                    name={item.icon}
                    size={16}
                    color={palette.primary}
                  />
                </View>

                <View className="flex-1">
                  <Text className="font-beMedium text-[10px] uppercase text-[#9B9086]">
                    {item.label}
                  </Text>

                  <Text className="mt-0.5 font-beSemiBold text-sm leading-5 text-[#261F1A]">
                    {item.name}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View
            className="mb-4 mt-5 rounded-[26px] bg-[#8B1D1D] p-5"
            style={styles.programFlow}
          >
            <View className="mb-1 flex-row items-center justify-between">
              <Text className="font-beBold text-lg text-white">
                Episode flow
              </Text>

              <Text className="font-beBold text-[10px] uppercase text-[#F0D186]">
                {displayStories.length} families
              </Text>
            </View>

            {detail.flow.map((item) => (
              <View key={item.step} className="mt-4 flex-row">
                <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-white">
                  <Text className="font-beBold text-xs text-primary">
                    {item.step}
                  </Text>
                </View>

                <View className="flex-1 border-b border-white/15 pb-4">
                  <Text className="font-beBold text-sm text-white">
                    {item.title}
                  </Text>

                  <Text
                    className="mt-1 font-beRegular text-xs leading-5"
                    style={styles.flowBody}
                  >
                    {item.body}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View
            className="mt-1 rounded-[26px] bg-white p-5"
            style={styles.contentCard}
          >
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="font-beBold text-xl text-[#261F1A]">
                Featured families
              </Text>

              <Text className="font-beBold text-xs uppercase text-primary">
                {displayStories.length} profiles
              </Text>
            </View>

            {displayStories.map((story, index) => (
              <Pressable
                key={`${story.caseId}-${story.name}`}
                onPress={() =>
                  stories.length
                    ? router.push({
                        pathname: '/family/[id]',
                        params: { id: story.caseId },
                      })
                    : undefined
                }
                className="mb-3 flex-row items-center rounded-2xl bg-[#FAF7F2] p-3"
              >
                <Image
                  source={
                    story.image ??
                    imageFromVideoUrl(episode.video_url, index)
                  }
                  className="mr-3 h-16 w-16 rounded-2xl"
                  resizeMode="cover"
                />

                <View className="flex-1">
                  <Text
                    className="font-beBold text-sm text-[#261F1A]"
                    numberOfLines={1}
                  >
                    {story.name}
                  </Text>

                  <Text
                    className="mt-1 font-beRegular text-xs leading-5 text-[#756B63]"
                    numberOfLines={2}
                  >
                    {story.description}
                  </Text>
                </View>

                {stories.length ? (
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={palette.primary}
                  />
                ) : null}
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contentCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },

  flowBody: {
    color: 'rgba(255,255,255,0.82)',
  },

  hero: {
    height: 390,
  },

  heroEpisodeTitle: {
    fontFamily: 'System',
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  heroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(34, 24, 19, 0.54)',
  },

  programFlow: {
    shadowColor: '#8B1D1D',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 4,
  },

  sectionTitle: {
    fontFamily: 'System',
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  summaryCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
});
