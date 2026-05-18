import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryTag } from '@/components/ui/category-tag';
import { ScreenHeader } from '@/components/ui/screen-header';
import { API_BASE_URL } from '@/constants/api';
import { palette } from '@/constants/design';
import { BackendNews, formatDate, getBackendNews } from '@/data/backend';

const FALLBACK_NEWS_IMAGE =
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1200&auto=format&fit=crop';

function getNewsImageUrl(imageUrl?: string | null) {
    const value = imageUrl?.trim();

    if (!value) {
        return FALLBACK_NEWS_IMAGE;
    }

    if (value.startsWith('http://') || value.startsWith('https://')) {
        return value;
    }

    const baseUrl = API_BASE_URL.replace(/\/$/, '');
    const path = value.startsWith('/') ? value : `/${value}`;

    return `${baseUrl}${path}`;
}

export default function NewsScreen() {
    const [activeFilter, setActiveFilter] = useState('All');
    const [news, setNews] = useState<BackendNews[]>([]);

    useEffect(() => {
        let mounted = true;

        async function loadNews() {
            const rows = await getBackendNews();
            if (mounted) {
                setNews(rows);
            }
        }

        void loadNews();
        return () => {
            mounted = false;
        };
    }, []);

    const filters = useMemo(() => ['All', ...Array.from(new Set(news.map((item) => item.type)))], [news]);
    const filteredNews = news.filter((item) => activeFilter === 'All' || item.type === activeFilter);
    const featured = filteredNews[0] ?? news[0];
    const secondary = filteredNews.slice(1);

    return (
        <SafeAreaView className="flex-1 bg-[#FAF7F2]" edges={['top', 'left', 'right']}>
            <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
                <View style={styles.page}>
                    <ScreenHeader title="News & Updates" icon="newspaper" meta={`${news.length} updates`} />

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5 mt-5">
                        <View className="flex-row gap-2 pr-4">
                            {filters.map((filter) => (
                                <CategoryTag key={filter} label={filter} highlighted={filter === activeFilter} onPress={() => setActiveFilter(filter)} />
                            ))}
                        </View>
                    </ScrollView>

                    {featured ? (
                        <Pressable onPress={() => router.push({ pathname: '/update/[id]', params: { id: featured.id } })} style={styles.featuredCard}>
                            <ImageBackground
                                source={{ uri: getNewsImageUrl(featured.image_url) }}
                                resizeMode="cover"
                                imageStyle={styles.featuredImageStyle}
                                style={styles.featuredImage}
                            >
                                <View style={styles.featuredOverlay}>
                                    <View className="flex-row items-center justify-between">
                                        <View className="rounded-full bg-white/18 px-3 py-1.5">
                                            <Text className="font-beBold text-[10px] uppercase text-white">{featured.type}</Text>
                                        </View>
                                        <Text className="font-beMedium text-xs text-[#F0D186]">{formatDate(featured.published_at ?? featured.created_at)}</Text>
                                    </View>
                                    <Text className="mt-5 font-beBold text-[24px] leading-[31px] text-white" numberOfLines={5}>{featured.title}</Text>
                                    <View className="mt-5 flex-row items-center justify-between">
                                        <Text className="font-beSemiBold text-xs uppercase text-[#F0D186]">Read update</Text>
                                        <View className="h-10 w-10 items-center justify-center rounded-full bg-white">
                                            <Ionicons name="arrow-forward" size={17} color={palette.primary} />
                                        </View>
                                    </View>
                                </View>
                            </ImageBackground>
                        </Pressable>
                    ) : null}

                    <View className="mt-3 flex-row justify-between pb-3">
                        {secondary.slice(0, 2).map((item) => (
                            <Pressable key={item.id} onPress={() => router.push({ pathname: '/update/[id]', params: { id: item.id } })} className="bg-white p-4" style={styles.compactCard}>
                                <Ionicons name={item.type === 'Verification' ? 'shield-checkmark' : 'newspaper'} size={22} color={palette.primary} />
                                <Text className="mt-4 font-beBold text-[15px] leading-5 text-[#261F1A]" numberOfLines={3}>{item.title}</Text>
                                <Text className="mt-3 font-beMedium text-[11px] uppercase text-[#B7842D]">{formatDate(item.published_at ?? item.created_at)}</Text>
                            </Pressable>
                        ))}
                    </View>

                    <View className="mt-0">
                        {filteredNews.map((item) => (
                            <Pressable key={item.id} onPress={() => router.push({ pathname: '/update/[id]', params: { id: item.id } })} className="mb-3 flex-row items-center rounded-[24px] bg-white p-4" style={styles.listCard}>
                                <View className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-[#F3EAE1]">
                                    <Ionicons name="newspaper-outline" size={20} color={palette.primary} />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-beSemiBold text-base leading-6 text-[#261F1A]" numberOfLines={2}>{item.title}</Text>
                                    <Text className="mt-1 font-beRegular text-xs text-[#756B63]">{item.type} - {formatDate(item.published_at ?? item.created_at)}</Text>
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
        borderRadius: 30,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.16,
        shadowRadius: 22,
        elevation: 5,
    },
    featuredImage: {
        minHeight: 300,
    },
    featuredImageStyle: {
        borderRadius: 30,
    },
    featuredOverlay: {
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: 'rgba(20, 14, 10, 0.58)',
        padding: 20,
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