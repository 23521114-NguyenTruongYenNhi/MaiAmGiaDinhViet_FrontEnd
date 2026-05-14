import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
    ImageBackground,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormattedContent } from '@/components/ui/formatted-content';
import { API_BASE_URL } from '@/constants/api';
import { palette } from '@/constants/design';
import {
    BackendNews,
    formatDate,
    getBackendNewsDetail,
} from '@/data/backend';
import { safeBack } from '@/data/navigation';

const FALLBACK_IMAGE =
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1200&auto=format&fit=crop';

function resolveImageUrl(imageUrl?: string | null) {
    const value = imageUrl?.trim();

    if (!value) {
        return FALLBACK_IMAGE;
    }

    if (value.startsWith('http://') || value.startsWith('https://')) {
        return value;
    }

    const baseUrl = API_BASE_URL.replace(/\/$/, '');
    const path = value.startsWith('/') ? value : `/${value}`;

    return `${baseUrl}${path}`;
}

function getImageCaption(title?: string | null) {
    const cleanTitle = title?.trim();

    if (!cleanTitle) {
        return 'Official visual coverage from MAI AM GIA DINH VIET.';
    }

    return `Moments from ${cleanTitle.toLowerCase()}.`;;
}

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

    const articleImage = useMemo(
        () => resolveImageUrl(article?.image_url),
        [article?.image_url]
    );

    if (!article) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-[#FAF7F2]">
                <Text className="font-beSemiBold text-sm text-[#756B63]">
                    Loading article...
                </Text>
            </SafeAreaView>
        );
    }

    const publishedDate = formatDate(
        article.published_at ?? article.created_at
    );

    const imageCaption = getImageCaption(article.title);

    return (
        <SafeAreaView className="flex-1 bg-[#FAF7F2]" edges={['top', 'bottom']}>
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.hero}>
                    <View className="flex-1 justify-between px-5 pb-6 pt-4">
                        <View className="flex-row items-center justify-between">
                            <Pressable
                                onPress={() => safeBack('/(tabs)/news')}
                                className="h-11 w-11 items-center justify-center rounded-full bg-white"
                            >
                                <Ionicons name="arrow-back" size={20} color={palette.text} />
                            </Pressable>

                            <View className="rounded-full bg-white/15 px-4 py-2">
                                <Text className="font-beBold text-[10px] uppercase text-white">
                                    {article.type}
                                </Text>
                            </View>
                        </View>

                        <View>
                            <Text className="font-beBold text-[19px] leading-[27px] text-white">
                                {article.title}
                            </Text>

                            <View className="mt-4 self-start rounded-full bg-white/15 px-3 py-1.5">
                                <Text className="font-beMedium text-[10px] uppercase text-white">
                                    Program News
                                </Text>
                            </View>

                            <View className="mt-3 flex-row items-center">
                                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white">
                                    <Ionicons
                                        name="newspaper-outline"
                                        size={18}
                                        color={palette.primary}
                                    />
                                </View>

                                <View className="flex-1">
                                    <Text className="font-beSemiBold text-sm text-white">
                                        MAI AM GIA DINH VIET Editorial Team
                                    </Text>

                                    <Text className="mt-1 font-beMedium text-[11px] uppercase tracking-widest text-[#F0D186]">
                                        Published on {publishedDate}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                <View className="px-4">
                    <View style={styles.articleCard}>
                        <View className="mb-5 border-b border-[#EFE6DD] pb-4">
                            <Text className="font-beBold text-[11px] uppercase tracking-widest text-[#B7842D]">
                                Article Details
                            </Text>

                            <View className="mt-4 flex-row flex-wrap">
                                <View className="mb-2 mr-2 flex-row items-center rounded-full bg-[#FAF7F2] px-3 py-2">
                                    <Ionicons
                                        name="calendar-outline"
                                        size={14}
                                        color="#9B9086"
                                    />
                                    <Text className="ml-2 font-beMedium text-xs text-[#756B63]">
                                        {publishedDate}
                                    </Text>
                                </View>

                                <View className="mb-2 mr-2 flex-row items-center rounded-full bg-[#FAF7F2] px-3 py-2">
                                    <Ionicons name="time-outline" size={14} color="#9B9086" />
                                    <Text className="ml-2 font-beMedium text-xs text-[#756B63]">
                                        5 min read
                                    </Text>
                                </View>

                                <View className="mb-2 mr-2 flex-row items-center rounded-full bg-[#FAF7F2] px-3 py-2">
                                    <Ionicons
                                        name="newspaper-outline"
                                        size={14}
                                        color="#9B9086"
                                    />
                                    <Text className="ml-2 font-beMedium text-xs text-[#756B63]">
                                        {article.type}
                                    </Text>
                                </View>

                                <View className="mb-2 flex-row items-center rounded-full bg-[#FAF7F2] px-3 py-2">
                                    <Ionicons
                                        name="share-social-outline"
                                        size={14}
                                        color="#9B9086"
                                    />
                                    <Text className="ml-2 font-beMedium text-xs text-[#756B63]">
                                        Share
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View className="mb-6">
                            <View className="overflow-hidden rounded-[24px] bg-[#EFE6DD]">
                                <ImageBackground
                                    source={{ uri: articleImage }}
                                    resizeMode="cover"
                                    style={styles.inlineImage}
                                />
                            </View>

                            <Text className="mt-3 font-beMedium text-[12px] italic leading-6 text-[#756B63]">
                                {imageCaption}
                            </Text>
                        </View>

                        <View className="mb-5 rounded-[24px] bg-[#FFF9F0] px-4 py-4">
                            <Text className="font-beBold text-[11px] uppercase tracking-widest text-primary">
                                Source
                            </Text>

                            <Text className="mt-2 font-beSemiBold text-sm leading-6 text-[#261F1A]">
                                MAI AM GIA DINH VIET Official Update
                            </Text>
                        </View>

                        <FormattedContent
                            text={article.content}
                            emptyText="No article content available."
                        />

                        <View style={styles.endSection}>
                            <View className="flex-row items-center">
                                <Ionicons
                                    name="shield-checkmark-outline"
                                    size={18}
                                    color={palette.primary}
                                />

                                <Text className="ml-2 font-beBold text-[11px] uppercase tracking-widest text-primary">
                                    Verified Information
                                </Text>
                            </View>

                            <Text className="mt-4 font-beRegular text-[14px] leading-7 text-[#5E534B]">
                                This article was published and reviewed by the official
                                editorial team of MAI AM GIA DINH VIET. The information is
                                provided to keep readers updated with clear, reliable, and
                                meaningful program communication.
                            </Text>

                            <View className="mt-5 flex-row items-center justify-between border-t border-[#EFE6DD] pt-5">
                                <View>
                                    <Text className="font-beBold text-[11px] uppercase tracking-widest text-[#B7842D]">
                                        Published By
                                    </Text>

                                    <Text className="mt-2 font-beSemiBold text-sm text-[#261F1A]">
                                        MAI AM GIA DINH VIET
                                    </Text>
                                </View>

                                <View className="h-12 w-12 items-center justify-center rounded-full bg-[#FAF7F2]">
                                    <Ionicons
                                        name="newspaper-outline"
                                        size={22}
                                        color={palette.primary}
                                    />
                                </View>
                            </View>

                            <Pressable
                                onPress={() => safeBack('/(tabs)/news')}
                                className="mt-6 flex-row items-center justify-center rounded-full bg-primary px-5 py-4"
                            >
                                <Ionicons name="arrow-back" size={17} color="#FFFFFF" />

                                <Text className="ml-2 font-beBold text-sm text-white">
                                    Back to News
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    articleCard: {
        marginTop: -18,
        borderRadius: 30,
        backgroundColor: '#FFFFFF',
        padding: 22,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.05,
        shadowRadius: 18,
        elevation: 3,
    },

    endSection: {
        marginTop: 28,
        borderTopWidth: 1,
        borderTopColor: '#EFE6DD',
        paddingTop: 24,
    },

    hero: {
        minHeight: 300,
        backgroundColor: '#7A1F1F',
    },

    inlineImage: {
        height: 220,
    },
});