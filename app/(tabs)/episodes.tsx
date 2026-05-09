import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui/screen-header';
import { palette } from '@/constants/design';
import {
  BackendEpisode,
  BackendEpisodeAction,
  combineFamilyStories,
  createBackendEpisodeAction,
  deleteBackendEpisodeAction,
  FamilyStory,
  formatDate,
  getBackendCases,
  getBackendEpisodeActions,
  getBackendEpisodes,
  getBackendFamilies,
  imageFromUrl,
} from '@/data/backend';
import { getSession } from '@/data/session';

type EpisodeRow = BackendEpisode & {
  firstCaseId?: string;
  familyCount: number;
  imageIndex: number;
  families: FamilyStory[];
};

export default function EpisodesScreen() {
  const [episodes, setEpisodes] = useState<EpisodeRow[]>([]);
  const [stories, setStories] = useState<FamilyStory[]>([]);
  const [savedActions, setSavedActions] = useState<Record<string, BackendEpisodeAction>>({});
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadEpisodes() {
      const [episodeRows, caseRows, familyRows] = await Promise.all([
        getBackendEpisodes(),
        getBackendCases(),
        getBackendFamilies(),
      ]);
      const session = await getSession();
      const actions = session.token ? await getBackendEpisodeActions(session.token, 'BOOKMARK') : [];
      const familyStories = combineFamilyStories(caseRows, familyRows, episodeRows);
      const rows = episodeRows
        .map((episode, index) => {
          const episodeStories = familyStories.filter((story) => story.episodeId === episode.id);
          return {
            ...episode,
            firstCaseId: episodeStories[0]?.caseId,
            familyCount: episodeStories.length,
            imageIndex: index,
            families: episodeStories.slice(0, 3),
          };
        })
        .sort((a, b) => b.episode_no - a.episode_no);

      if (mounted) {
        setToken(session.token);
        setEpisodes(rows);
        setStories(familyStories);
        setSavedActions(Object.fromEntries(actions.map((action) => [action.episode_id, action])));
      }
    }

    void loadEpisodes();
    return () => {
      mounted = false;
    };
  }, []);

  const latestEpisode = episodes[0];
  const latestStory = useMemo(
    () => stories.find((story) => story.episodeId === latestEpisode?.id),
    [latestEpisode?.id, stories],
  );

  const toggleSavedEpisode = async (episodeId: string) => {
    if (!token) {
      return;
    }

    const existing = savedActions[episodeId];

    if (existing) {
      setSavedActions((current) => {
        const next = { ...current };
        delete next[episodeId];
        return next;
      });

      try {
        await deleteBackendEpisodeAction(token, existing.id);
      } catch {
        setSavedActions((current) => ({ ...current, [episodeId]: existing }));
      }
      return;
    }

    const pendingAction: BackendEpisodeAction = {
      id: `pending-${episodeId}`,
      user_id: 'pending',
      episode_id: episodeId,
      action_type: 'BOOKMARK',
      created_at: new Date().toISOString(),
    };
    setSavedActions((current) => ({ ...current, [episodeId]: pendingAction }));

    try {
      const action = await createBackendEpisodeAction(token, episodeId, 'BOOKMARK');
      setSavedActions((current) => ({ ...current, [episodeId]: action }));
    } catch {
      setSavedActions((current) => {
        const next = { ...current };
        delete next[episodeId];
        return next;
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF7F2]" edges={['top', 'left', 'right']}>
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <ScreenHeader title="Episode Library" icon="play-circle" meta={`${episodes.length} episodes`} />

          {latestEpisode ? (
            <Pressable
              onPress={() => latestEpisode.firstCaseId && router.push(`/family/${latestEpisode.firstCaseId}`)}
              className="mt-5 overflow-hidden"
              style={styles.spotlight}
            >
              <ImageBackground source={latestStory?.image ?? imageFromUrl(null, 0)} resizeMode="cover" style={styles.spotlightImage}>
                <View style={styles.spotlightOverlay} />
                <View className="flex-1 justify-end p-5">
                  <View className="mb-3 self-start rounded-full bg-[#FDECEC] px-3.5 py-2" style={styles.latestBadge}>
                    <Text className="font-beBold text-[10px] uppercase text-[#B3261E]">Latest episode</Text>
                  </View>
                  <Pressable
                    onPress={() => void toggleSavedEpisode(latestEpisode.id)}
                    className="absolute right-5 top-5 h-10 w-10 items-center justify-center rounded-full bg-white"
                  >
                    <Ionicons name={savedActions[latestEpisode.id] ? 'heart' : 'heart-outline'} size={20} color={palette.primary} />
                  </Pressable>
                  <Text className="font-beBold text-[25px] leading-[32px] text-white">{latestEpisode.title}</Text>
                  <View className="mt-3 rounded-2xl bg-black/32 px-3 py-2">
                    <Text className="font-beRegular text-sm leading-6 text-white" numberOfLines={3}>{latestEpisode.description}</Text>
                  </View>
                  <View className="mt-4 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white">
                        <Ionicons name="play" size={17} color={palette.primary} />
                      </View>
                      <Text className="font-beSemiBold text-sm text-white">Episode {latestEpisode.episode_no}</Text>
                    </View>
                    <Text className="font-beSemiBold text-xs uppercase text-[#F0D186]">{latestEpisode.familyCount} families</Text>
                  </View>
                </View>
              </ImageBackground>
            </Pressable>
          ) : null}

          <View className="mt-6">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="font-beBold text-xl text-[#261F1A]">Latest releases</Text>
              <Text className="font-beSemiBold text-xs text-primary">See all</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16 }}>
              {episodes.slice(0, 12).map((item, index) => (
                <Pressable
                  key={item.id}
                  onPress={() => item.firstCaseId && router.push(`/family/${item.firstCaseId}`)}
                  className="mr-3 overflow-hidden bg-white"
                  style={styles.posterCard}
                >
                  <Image source={imageFromUrl(null, index)} resizeMode="cover" style={styles.posterImage} />
                  <Pressable
                    onPress={() => void toggleSavedEpisode(item.id)}
                    className="absolute right-2 top-2 h-9 w-9 items-center justify-center rounded-full bg-white"
                  >
                    <Ionicons name={savedActions[item.id] ? 'heart' : 'heart-outline'} size={18} color={palette.primary} />
                  </Pressable>
                  <View className="p-3">
                    <Text className="font-beBold text-[10px] uppercase text-primary">Episode {item.episode_no}</Text>
                    <Text className="mt-1 font-beSemiBold text-sm leading-5 text-[#261F1A]" numberOfLines={2}>{item.title}</Text>
                    <Text className="mt-2 font-beMedium text-[11px] text-[#B7842D]">{item.familyCount} families</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View className="mt-7 pb-20">
            <Text className="mb-4 font-beBold text-xl text-[#261F1A]">All episodes</Text>
            {episodes.map((item, index) => (
              <View
                key={item.id}
                className="mb-4 rounded-[24px] bg-white p-3"
                style={styles.rowCard}
              >
                <View className="flex-row">
                  <Image source={imageFromUrl(null, index)} resizeMode="cover" style={styles.rowImage} />
                  <View className="ml-3 flex-1 justify-between py-1">
                    <View>
                      <Text className="font-beBold text-[11px] uppercase text-primary">Episode {item.episode_no}</Text>
                      <View className="mt-1 flex-row items-start">
                        <Text className="flex-1 font-beBold text-base leading-6 text-[#261F1A]" numberOfLines={2}>{item.title}</Text>
                        <Pressable onPress={() => void toggleSavedEpisode(item.id)} hitSlop={10}>
                          <Ionicons name={savedActions[item.id] ? 'heart' : 'heart-outline'} size={19} color={palette.primary} />
                        </Pressable>
                      </View>
                      <Text className="mt-1 font-beRegular text-xs leading-5 text-[#756B63]" numberOfLines={2}>{item.description}</Text>
                    </View>
                    <Text className="font-beMedium text-xs text-[#B7842D]">{formatDate(item.air_date)} - {item.familyCount} families</Text>
                  </View>
                </View>

                <View className="mt-3 border-t border-[#EFE6DD] pt-3">
                  {item.families.length ? (
                    item.families.map((family) => (
                      <Pressable
                        key={family.caseId}
                        onPress={() => router.push(`/family/${family.caseId}`)}
                        className="mb-2 flex-row items-center rounded-2xl bg-[#FAF7F2] px-3 py-2"
                      >
                        <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-white">
                          <Ionicons name="heart-outline" size={15} color={palette.primary} />
                        </View>
                        <View className="flex-1">
                          <Text className="font-beSemiBold text-sm text-[#261F1A]" numberOfLines={1}>{family.name}</Text>
                          <Text className="mt-0.5 font-beRegular text-xs leading-4 text-[#756B63]" numberOfLines={2}>{family.description}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={palette.primary} />
                      </Pressable>
                    ))
                  ) : (
                    <View className="rounded-2xl bg-[#FAF7F2] px-3 py-3">
                      <Text className="font-beMedium text-xs text-[#756B63]">Family details are not available yet.</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  latestBadge: {
    shadowColor: '#8B1D1D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 3,
  },
  page: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 430,
  },
  posterCard: {
    borderRadius: 22,
    minHeight: 238,
    width: 164,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  posterImage: {
    height: 128,
    width: '100%',
  },
  rowCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  rowImage: {
    borderRadius: 18,
    height: 112,
    width: 104,
  },
  spotlight: {
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 5,
  },
  spotlightImage: {
    height: 292,
    overflow: 'hidden',
  },
  spotlightOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(34, 24, 19, 0.48)',
  },
});
