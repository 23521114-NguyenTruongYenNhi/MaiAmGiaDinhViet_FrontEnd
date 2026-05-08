import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryTag } from '@/components/ui/category-tag';
import { ScreenHeader } from '@/components/ui/screen-header';
import { palette } from '@/constants/design';
import { combineFamilyStories, FamilyStory, formatDate, getBackendCases, getBackendEpisodes, getBackendFamilies } from '@/data/backend';

type Filter = 'All' | 'Latest' | 'Urgent' | 'Saved';

type EpisodeFilter = {
  episodeNo: number;
  episodeTitle: string;
  familyCount: number;
  familyNames: string[];
};

function normalizeSearchText(value?: string | null) {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchesSearchToken(story: FamilyStory, query: string) {
  const searchable = normalizeSearchText([
    story.name,
    story.location,
    story.description,
    story.story,
    story.episodeTitle,
    `episode ${story.episodeNo}`,
    `tap ${story.episodeNo}`,
    story.supportCategory,
    story.supportFocus,
    story.bank,
    story.beneficiary,
    story.accountNumber,
  ].filter(Boolean).join(' '));
  const tokens = normalizeSearchText(query).split(' ').filter(Boolean);

  return tokens.every((token) => searchable.includes(token));
}

export default function FamiliesScreen() {
  const [activeFilter, setActiveFilter] = useState<Filter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);
  const [showAllFamilies, setShowAllFamilies] = useState(false);
  const [savedFamilies, setSavedFamilies] = useState<string[]>([]);
  const [stories, setStories] = useState<FamilyStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadFamilies() {
      setLoading(true);
      const [episodes, cases, families] = await Promise.all([
        getBackendEpisodes(),
        getBackendCases(),
        getBackendFamilies(),
      ]);

      if (mounted) {
        setStories(combineFamilyStories(cases, families, episodes));
        setLoading(false);
      }
    }

    void loadFamilies();
    return () => {
      mounted = false;
    };
  }, []);

  const episodeFilters = useMemo(() => {
    const unique = new Map<number, EpisodeFilter>();
    stories.forEach((story) => {
      if (!unique.has(story.episodeNo)) {
        unique.set(story.episodeNo, {
          episodeNo: story.episodeNo,
          episodeTitle: story.episodeTitle,
          familyCount: 0,
          familyNames: [],
        });
      }

      const episode = unique.get(story.episodeNo);
      if (episode) {
        episode.familyCount += 1;
        episode.familyNames.push(story.name);
      }
    });
    return Array.from(unique.values()).sort((a, b) => b.episodeNo - a.episodeNo);
  }, [stories]);

  const matchedFamilies = stories.filter((story) => {
    const normalizedQuery = normalizeSearchText(searchQuery);
    const matchesSearch =
      normalizedQuery.length === 0 ||
      matchesSearchToken(story, normalizedQuery);
    const matchesEpisode = selectedEpisode === null || selectedEpisode === story.episodeNo;

    return matchesSearch && matchesEpisode;
  });

  const discoveryMode = showAllFamilies || selectedEpisode !== null || searchQuery.trim().length > 0 || activeFilter !== 'All';
  const priorityRank = (story: FamilyStory) => {
    if (story.priorityLevel === 'HIGH') {
      return 0;
    }
    if (story.priorityLevel === 'MEDIUM') {
      return 1;
    }
    return 2;
  };
  const categoryFamilies = matchedFamilies.filter((story) => {
    if (activeFilter === 'Urgent') {
      const priority = story.priorityLevel?.toUpperCase();
      const status = story.status?.toUpperCase();
      return priority === 'HIGH' || status?.includes('URGENT') || status?.includes('HIGH');
    }

    if (activeFilter === 'Saved') {
      return savedFamilies.includes(story.caseId);
    }

    return true;
  });
  const sortedFamilies = [...categoryFamilies].sort(
    (a, b) => priorityRank(a) - priorityRank(b) || b.episodeNo - a.episodeNo || a.name.localeCompare(b.name),
  );
  const displayFamilies = activeFilter === 'Latest'
    ? sortedFamilies.slice(0, 12)
    : discoveryMode
      ? sortedFamilies
      : sortedFamilies.slice(0, 8);
  const directoryTitle = (() => {
    if (searchQuery.trim()) {
      return 'Search results';
    }
    if (activeFilter === 'Latest') {
      return 'Latest families';
    }
    if (activeFilter === 'Urgent') {
      return 'Urgent families';
    }
    if (activeFilter === 'Saved') {
      return 'Saved families';
    }
    if (selectedEpisode) {
      return `Episode ${selectedEpisode} families`;
    }
    if (showAllFamilies) {
      return 'All families by episode';
    }
    return 'Priority families';
  })();

  const toggleSaved = (caseId: string) => {
    setSavedFamilies((current) => (current.includes(caseId) ? current.filter((id) => id !== caseId) : [...current, caseId]));
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF7F2]" edges={['top', 'left', 'right']}>
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <ScreenHeader title="Broadcast Families" icon="heart-circle" meta={loading ? 'Loading data' : `${stories.length} families`} />

          <View className="mt-5 flex-row items-center rounded-[24px] bg-white px-4 py-3" style={styles.searchBox}>
            <Ionicons name="search" size={18} color={palette.primary} />
            <TextInput
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                if (text.trim()) {
                  setSelectedEpisode(null);
                  setActiveFilter('All');
                  setShowAllFamilies(true);
                }
              }}
              placeholder="Search by family, location, episode, or need"
              placeholderTextColor="#9E978F"
              className="ml-3 flex-1 font-beRegular text-sm text-[#261F1A]"
            />
            {searchQuery ? (
              <Pressable
                onPress={() => {
                  setSearchQuery('');
                  setSelectedEpisode(null);
                  setActiveFilter('All');
                  setShowAllFamilies(false);
                }}
                hitSlop={8}
              >
                <Ionicons name="close-circle" size={18} color="#9E978F" />
              </Pressable>
            ) : null}
          </View>

          <View className="mb-5 mt-4 flex-row gap-2">
            {(['All', 'Latest', 'Urgent', 'Saved'] as Filter[]).map((filter) => (
              <CategoryTag
                key={filter}
                label={filter}
                highlighted={activeFilter === filter}
                onPress={() => {
                  setActiveFilter(filter);
                  setSelectedEpisode(null);
                  setSearchQuery('');
                  setShowAllFamilies(filter !== 'All');
                }}
              />
            ))}
          </View>

          <View className="mb-5 rounded-[24px] bg-white p-4" style={styles.episodePanel}>
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="font-beBold text-base text-[#261F1A]">Browse by episode</Text>
              <Pressable
                onPress={() => {
                  setSelectedEpisode(null);
                  setActiveFilter('All');
                  setSearchQuery('');
                  setShowAllFamilies(true);
                }}
                hitSlop={8}
              >
                <Text className="font-beSemiBold text-xs text-primary">See all</Text>
              </Pressable>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.episodeList}>
              {episodeFilters.map((episode) => {
                const isSelected = selectedEpisode === episode.episodeNo;

                return (
                  <Pressable
                    key={`episode-filter-${episode.episodeNo}`}
                    onPress={() => {
                      setShowAllFamilies(true);
                      setSelectedEpisode((current) => (current === episode.episodeNo ? null : episode.episodeNo));
                    }}
                    className={`mr-3 rounded-[18px] p-3 ${isSelected ? 'bg-primary' : 'bg-[#FAF7F2]'}`}
                    style={styles.episodeCard}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className={`font-beBold text-[11px] uppercase ${isSelected ? 'text-white' : 'text-primary'}`}>Episode {episode.episodeNo}</Text>
                      <Text className={`font-beBold text-[10px] uppercase ${isSelected ? 'text-[#FBE9E7]' : 'text-[#B7842D]'}`}>{episode.familyCount} families</Text>
                    </View>
                    <Text className={`mt-2 font-beSemiBold text-sm leading-5 ${isSelected ? 'text-white' : 'text-[#261F1A]'}`} numberOfLines={2}>
                      {episode.episodeTitle}
                    </Text>
                    <Text className={`mt-1 font-beRegular text-[11px] leading-4 ${isSelected ? 'text-[#FBE9E7]' : 'text-[#756B63]'}`} numberOfLines={2}>
                      {episode.familyNames.slice(0, 3).join(', ')}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View className="rounded-[28px] bg-white p-4" style={styles.directoryPanel}>
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="font-beBold text-lg text-[#261F1A]">{directoryTitle}</Text>
              {discoveryMode ? (
                <Pressable
                  onPress={() => {
                    setShowAllFamilies(false);
                    setSelectedEpisode(null);
                    setActiveFilter('All');
                    setSearchQuery('');
                  }}
                  hitSlop={8}
                >
                  <Text className="font-beSemiBold text-xs text-primary">Featured</Text>
                </Pressable>
              ) : (
                <Text className="font-beMedium text-xs uppercase text-[#B7842D]">{displayFamilies.length} shown</Text>
              )}
            </View>

            {displayFamilies.map((story, index) => {
              const isSaved = savedFamilies.includes(story.caseId);
              const showEpisodeDivider = showAllFamilies && selectedEpisode === null && story.episodeNo !== displayFamilies[index - 1]?.episodeNo;

              return (
                <View key={story.caseId}>
                  {showEpisodeDivider ? (
                    <View className="mb-3 mt-1 flex-row items-center justify-between">
                      <Text className="font-beBold text-sm uppercase text-primary">Episode {story.episodeNo}</Text>
                      <Text className="font-beMedium text-[11px] text-[#B7842D]" numberOfLines={1}>{story.episodeTitle}</Text>
                    </View>
                  ) : null}

                  <Pressable
                    onPress={() => router.push(`/family/${story.caseId}`)}
                    className="overflow-hidden rounded-[24px] bg-[#FAF7F2]"
                    style={[styles.familyPass, index !== displayFamilies.length - 1 && styles.familySpacing]}
                  >
                    <Image source={story.image} resizeMode="cover" style={styles.familyImage} />

                    <View className="p-4">
                      <View className="mb-3 flex-row items-center justify-between">
                        <View className="rounded-full bg-white px-3 py-1.5">
                          <Text className="font-beBold text-[10px] uppercase text-primary">Episode {story.episodeNo}</Text>
                        </View>
                        <Pressable onPress={() => toggleSaved(story.caseId)} hitSlop={10}>
                          <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={21} color={palette.primary} />
                        </Pressable>
                      </View>

                      <Text className="font-beBold text-[21px] leading-[27px] text-[#261F1A]">{story.name}</Text>
                      <Text className="mt-1 font-beMedium text-xs leading-5 text-[#B7842D]" numberOfLines={1}>{story.episodeTitle}</Text>

                      <View className="mt-4 flex-row flex-wrap gap-2">
                        <View className="flex-row items-center rounded-full bg-white px-3 py-2">
                          <Ionicons name="location" size={12} color={palette.primary} />
                          <Text className="ml-1 font-beSemiBold text-[11px] text-[#261F1A]">{story.location}</Text>
                        </View>
                        <View className="rounded-full bg-white px-3 py-2">
                          <Text className="font-beSemiBold text-[11px] text-[#261F1A]">{story.supportCategory ?? story.status}</Text>
                        </View>
                        {story.childrenCount ? (
                          <View className="rounded-full bg-white px-3 py-2">
                            <Text className="font-beSemiBold text-[11px] text-[#261F1A]">{story.childrenCount} children</Text>
                          </View>
                        ) : null}
                        {story.priorityLevel ? (
                          <View className="rounded-full bg-[#FDECEC] px-3 py-2">
                            <Text className="font-beBold text-[11px] text-[#B3261E]">{story.priorityLevel}</Text>
                          </View>
                        ) : null}
                        {story.bankVerified ? (
                          <View className="rounded-full bg-white px-3 py-2">
                            <Text className="font-beBold text-[11px] text-primary">Bank verified</Text>
                          </View>
                        ) : null}
                      </View>

                      <View className="mt-4 flex-row items-center justify-between border-t border-[#E7DED4] pt-4">
                        <View className="flex-row items-center">
                          <Ionicons name="shield-checkmark" size={15} color={palette.primary} />
                          <Text className="ml-1.5 font-beMedium text-xs text-[#756B63]">{story.verificationStatus} - {formatDate(story.verifiedAt)}</Text>
                        </View>
                        <Ionicons name="arrow-forward" size={17} color={palette.primary} />
                      </View>
                    </View>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  directoryPanel: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  episodeCard: {
    minHeight: 116,
    width: 184,
  },
  episodeList: {
    paddingRight: 4,
  },
  episodePanel: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  familyImage: {
    height: 154,
    width: '100%',
  },
  familyPass: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },
  familySpacing: {
    marginBottom: 14,
  },
  page: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 430,
  },
  searchBox: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
});
