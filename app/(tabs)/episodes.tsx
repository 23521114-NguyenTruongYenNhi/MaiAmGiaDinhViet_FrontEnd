import { Ionicons } from '@expo/vector-icons';
import { Href, router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Image, ImageBackground, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
    getBackendCases,
    getBackendEpisodeActions,
    getBackendEpisodes,
    getBackendFamilies,
    imageFromVideoUrl,
} from '@/data/backend';
import { cleanEpisodeDescription, getEpisodeMetaLine } from '@/data/episode-details';
import { getRecentlyViewedEpisodeIds } from '@/data/recent-episodes';
import { getSession } from '@/data/session';

type EpisodeRow = BackendEpisode & {
    firstCaseId?: string;
    familyCount: number;
    imageIndex: number;
    families: FamilyStory[];
};

function hasVideoUrl(videoUrl?: string | null) {
    return Boolean(videoUrl && !/^https?:\/\/(?:www\.)?youtu\.be\/?$/i.test(videoUrl.trim()));
}

function episodeHref(id: string) {
    return `/episode/${id}` as Href;
}

function displayEpisodeTitle(episodeNo: number) {
    return `Episode ${episodeNo}`;
}

function formatRecentRank(index: number) {
    return `#${index + 1}`;
}

export default function EpisodesScreen() {
    const [episodes, setEpisodes] = useState<EpisodeRow[]>([]);
    const [savedActions, setSavedActions] = useState<Record<string, BackendEpisodeAction>>({});
    const [token, setToken] = useState<string | null>(null);
    const [recentEpisodeIds, setRecentEpisodeIds] = useState<string[]>([]);

    useFocusEffect(
        useCallback(() => {
            let active = true;

            getRecentlyViewedEpisodeIds()
                .then((ids) => {
                    if (active) {
                        setRecentEpisodeIds(ids);
                    }
                })
                .catch(() => {
                    if (active) {
                        setRecentEpisodeIds([]);
                    }
                });

            return () => {
                active = false;
            };
        }, [])
    );

    useEffect(() => {
        let mounted = true;

        async function loadEpisodes() {
            const episodeRows = await getBackendEpisodes();
            const [caseRows, familyRows] = await Promise.all([
                getBackendCases().catch(() => []),
                getBackendFamilies().catch(() => []),
            ]);
            const session = await getSession().catch(() => ({ token: null }));
            const actions = session.token
                ? await getBackendEpisodeActions(session.token, 'BOOKMARK').catch(() => [])
                : [];
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
                setSavedActions(Object.fromEntries(actions.map((action) => [action.episode_id, action])));
            }
        }

        void loadEpisodes();
        return () => {
            mounted = false;
        };
    }, []);

    const latestEpisode = episodes[0];
    const recentlyViewedEpisodes = recentEpisodeIds
        .map((episodeId) => episodes.find((episode) => episode.id === episodeId))
        .filter((episode): episode is EpisodeRow => Boolean(episode))
        .slice(0, 8);

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

    const openEpisodeVideo = async (episode: BackendEpisode) => {
        const videoUrl = episode.video_url?.trim();

        if (!videoUrl || !hasVideoUrl(videoUrl)) {
            Alert.alert('Video unavailable', 'This episode does not have a YouTube link yet.');
            return;
        }

        try {
            await Linking.openURL(videoUrl);
        } catch {
            Alert.alert('Cannot open video', 'Your device could not open the YouTube link.');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#FAF7F2]" edges={['top', 'left', 'right']}>
            <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
                <View style={styles.page}>
                    <ScreenHeader title="Episodes" icon="play-circle" meta={`${episodes.length} episodes`} />

                    {latestEpisode ? (
                        <Pressable
                            onPress={() => router.push(episodeHref(latestEpisode.id))}
                            className="mt-5 overflow-hidden"
                            style={styles.spotlight}
                        >
                            <ImageBackground source={imageFromVideoUrl(latestEpisode.video_url, 0)} resizeMode="cover" style={styles.spotlightImage}>
                                <View style={styles.spotlightOverlay} />
                                <View className="flex-1 justify-end p-5">
                                    <View className="mb-3 self-start rounded-full bg-[#FDECEC] px-3.5 py-2" style={styles.latestBadge}>
                                        <Text className="font-beBold text-[10px] uppercase text-[#B3261E]">Latest episode</Text>
                                    </View>
                                    <Pressable
                                        onPress={(event) => {
                                            event.stopPropagation();
                                            void toggleSavedEpisode(latestEpisode.id);
                                        }}
                                        className="absolute right-5 top-5 h-10 w-10 items-center justify-center rounded-full bg-white"
                                    >
                                        <Ionicons name={savedActions[latestEpisode.id] ? 'heart' : 'heart-outline'} size={20} color={palette.primary} />
                                    </Pressable>
                                    <Text className="font-beBold text-[32px] leading-[38px] text-white">{displayEpisodeTitle(latestEpisode.episode_no)}</Text>
                                    <View className="mt-4 flex-row items-center justify-between">
                                        <Pressable
                                            onPress={(event) => {
                                                event.stopPropagation();
                                                void openEpisodeVideo(latestEpisode);
                                            }}
                                            className="flex-row items-center"
                                        >
                                            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white">
                                                <Ionicons name="play" size={17} color={palette.primary} />
                                            </View>
                                            <Text className="font-beSemiBold text-sm text-white">Watch episode</Text>
                                        </Pressable>
                                        <Text className="font-beSemiBold text-xs uppercase text-[#F0D186]">View details</Text>
                                    </View>
                                </View>
                            </ImageBackground>
                        </Pressable>
                    ) : null}

                    {recentlyViewedEpisodes.length ? (
                        <View className="mt-6">
                            <View className="mb-3 flex-row items-center justify-between">
                                <Text className="font-beBold text-xl text-[#261F1A]">Recently Viewed</Text>
                                <Text className="font-beSemiBold text-xs text-primary">Last opened</Text>
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16 }}>
                                {recentlyViewedEpisodes.map((item, index) => (
                                    <Pressable
                                        key={item.id}
                                        onPress={() => router.push(episodeHref(item.id))}
                                        className="mr-3 overflow-hidden bg-white"
                                        style={styles.recentCard}
                                    >
                                        <Image source={imageFromVideoUrl(item.video_url, item.imageIndex)} resizeMode="cover" style={styles.recentImage} />
                                        <View className="px-3 py-3">
                                            <View className="mb-2 flex-row items-center justify-between">
                                                <Text className="font-beBold text-[10px] uppercase text-primary">{index === 0 ? 'Last opened' : formatRecentRank(index)}</Text>
                                                <Text className="font-beMedium text-[10px] text-[#8E8177]">Recently viewed</Text>
                                            </View>
                                            <Text className="font-beBold text-[15px] leading-5 text-[#261F1A]" numberOfLines={1}>
                                                {displayEpisodeTitle(item.episode_no)}
                                            </Text>
                                            <Text className="mt-1 font-beRegular text-xs leading-5 text-[#756B63]" numberOfLines={2}>
                                                {cleanEpisodeDescription(item.description, item.episode_no) || 'Open this episode again.'}
                                            </Text>
                                        </View>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        </View>
                    ) : null}

                    <View className="mt-6">
                        <View className="mb-3 flex-row items-center justify-between">
                            <Text className="font-beBold text-xl text-[#261F1A]">Recent releases</Text>
                            <Text className="font-beSemiBold text-xs text-primary">See all</Text>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16 }}>
                            {episodes.slice(0, 12).map((item, index) => (
                                <Pressable
                                    key={item.id}
                                    onPress={() => router.push(episodeHref(item.id))}
                                    className="mr-3 overflow-hidden bg-white"
                                    style={styles.posterCard}
                                >
                                    <View style={styles.posterImageFrame}>
                                        <Image source={imageFromVideoUrl(item.video_url, index)} resizeMode="cover" style={styles.posterImage} />
                                        <View style={styles.posterImageShade} />
                                        <Pressable
                                            onPress={(event) => {
                                                event.stopPropagation();
                                                void openEpisodeVideo(item);
                                            }}
                                            className="absolute bottom-2 left-2 h-9 w-9 items-center justify-center rounded-full bg-white"
                                        >
                                            <Ionicons name="play" size={15} color={palette.primary} />
                                        </Pressable>
                                    </View>
                                    <Pressable
                                        onPress={(event) => {
                                            event.stopPropagation();
                                            void toggleSavedEpisode(item.id);
                                        }}
                                        className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-white"
                                    >
                                        <Ionicons name={savedActions[item.id] ? 'heart' : 'heart-outline'} size={17} color={palette.primary} />
                                    </Pressable>
                                    <View className="px-3 pb-3 pt-2">
                                        <Text className="font-beBold text-[16px] leading-5 text-[#261F1A]" numberOfLines={1}>{displayEpisodeTitle(item.episode_no)}</Text>
                                        <Text className="mt-1 font-beMedium text-[10px] text-[#B7842D]">Episode details</Text>
                                    </View>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>

                    <View className="mt-5 pb-20">
                        <Text className="mb-4 font-beBold text-xl text-[#261F1A]">All episodes</Text>
                        {episodes.map((item, index) => (
                            <Pressable
                                key={item.id}
                                onPress={() => router.push(episodeHref(item.id))}
                                className="mb-4 rounded-[24px] bg-white p-3"
                                style={styles.rowCard}
                            >
                                <View className="flex-row">
                                    <View style={styles.rowImageFrame}>
                                        <Image source={imageFromVideoUrl(item.video_url, index)} resizeMode="cover" style={styles.rowImage} />
                                        <View style={styles.rowImageShade} />
                                        <Pressable
                                            onPress={(event) => {
                                                event.stopPropagation();
                                                void openEpisodeVideo(item);
                                            }}
                                            className="absolute bottom-2 right-2 h-9 w-9 items-center justify-center rounded-full bg-white"
                                        >
                                            <Ionicons name="play" size={15} color={palette.primary} />
                                        </Pressable>
                                    </View>
                                    <View className="ml-3 flex-1 justify-between py-1">
                                        <View>
                                            <View className="mt-1 flex-row items-start">
                                                <Text className="flex-1 font-beBold text-xl leading-7 text-[#261F1A]" numberOfLines={1}>{displayEpisodeTitle(item.episode_no)}</Text>
                                                <Pressable
                                                    onPress={(event) => {
                                                        event.stopPropagation();
                                                        void toggleSavedEpisode(item.id);
                                                    }}
                                                    hitSlop={10}
                                                >
                                                    <Ionicons name={savedActions[item.id] ? 'heart' : 'heart-outline'} size={19} color={palette.primary} />
                                                </Pressable>
                                            </View>
                                            <Text className="mt-1 font-beRegular text-xs leading-5 text-[#756B63]" numberOfLines={2}>{cleanEpisodeDescription(item.description, item.episode_no)}</Text>
                                        </View>
                                        <Text className="font-beMedium text-xs text-[#B7842D]">{getEpisodeMetaLine(item, item.families)}</Text>
                                    </View>
                                </View>

                                <View className="mt-3 border-t border-[#EFE6DD] pt-3">
                                    {item.families.length ? (
                                        item.families.map((family) => (
                                            <Pressable
                                                key={family.caseId}
                                                onPress={(event) => {
                                                    event.stopPropagation();
                                                    router.push(`/family/${family.caseId}`);
                                                }}
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
                            </Pressable>
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
        minHeight: 180,
        width: 154,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 16,
        elevation: 2,
    },
    posterImage: {
        height: 104,
        width: '100%',
    },
    posterImageFrame: {
        height: 104,
        overflow: 'hidden',
        position: 'relative',
    },
    posterImageShade: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(34, 24, 19, 0.18)',
    },
    recentCard: {
        borderRadius: 22,
        width: 210,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 16,
        elevation: 2,
    },
    recentImage: {
        height: 118,
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
    rowImageFrame: {
        borderRadius: 18,
        height: 112,
        overflow: 'hidden',
        position: 'relative',
        width: 104,
    },
    rowImageShade: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(34, 24, 19, 0.16)',
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
