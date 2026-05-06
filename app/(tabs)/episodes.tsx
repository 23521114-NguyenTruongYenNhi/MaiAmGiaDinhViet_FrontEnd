import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/ui/screen-header';
import { palette } from '@/constants/design';
import { episodes } from '@/data/mock';

const familyRoutes = ['fam-1', 'fam-2', 'fam-3'] as const;

export default function EpisodesScreen() {
  const spotlight = episodes[0];

  return (
    <SafeAreaView className="flex-1 bg-[#FAF7F2]" edges={['top', 'left', 'right']}>
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <ScreenHeader title="Episode library" icon="play-circle" meta="Stories" />

          <Pressable onPress={() => router.push(`/family/${familyRoutes[0]}`)} className="mt-5 overflow-hidden" style={styles.spotlight}>
            <ImageBackground source={spotlight.thumbnail} resizeMode="cover" style={styles.spotlightImage}>
              <View style={styles.spotlightOverlay} />
              <View className="flex-1 justify-end p-5">
                <View className="mb-3 self-start rounded-full bg-white/92 px-3 py-1.5">
                  <Text className="font-beBold text-[10px] uppercase text-primary">{spotlight.host}</Text>
                </View>
                <Text className="font-beBold text-[25px] leading-[32px] text-white">{spotlight.title}</Text>
                <View className="mt-4 flex-row items-center">
                  <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white">
                    <Ionicons name="play" size={17} color={palette.primary} />
                  </View>
                  <Text className="font-beSemiBold text-sm text-white">Watch story</Text>
                </View>
              </View>
            </ImageBackground>
          </Pressable>

          <View className="mt-6">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="font-beBold text-xl text-[#261F1A]">Continue watching</Text>
              <Text className="font-beSemiBold text-xs text-primary">See all</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16 }}>
              {episodes.map((item, index) => (
                <Pressable key={item.id} onPress={() => router.push(`/family/${familyRoutes[index]}`)} className="mr-3 bg-white" style={styles.posterCard}>
                  <Image source={item.thumbnail} resizeMode="cover" style={styles.posterImage} />
                  <View className="p-3">
                    <Text className="font-beSemiBold text-sm leading-5 text-[#261F1A]" numberOfLines={2}>{item.title}</Text>
                    <View className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#EFE6DD]">
                      <View className="h-full rounded-full bg-primary" style={{ width: `${52 + index * 12}%` }} />
                    </View>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View className="mt-7">
            <Text className="mb-4 font-beBold text-xl text-[#261F1A]">Featured stories</Text>
            {episodes.map((item, index) => (
              <Pressable key={item.id} onPress={() => router.push(`/family/${familyRoutes[index]}`)} className="mb-4 flex-row rounded-[24px] bg-white p-3" style={styles.rowCard}>
                <Image source={item.thumbnail} resizeMode="cover" style={styles.rowImage} />
                <View className="ml-3 flex-1 justify-between py-1">
                  <View>
                    <Text className="font-beBold text-base leading-6 text-[#261F1A]" numberOfLines={2}>{item.title}</Text>
                    <Text className="mt-1 font-beRegular text-xs leading-5 text-[#756B63]" numberOfLines={2}>{item.summary}</Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="font-beMedium text-xs text-[#B7842D]">{item.duration}</Text>
                    <Ionicons name="chevron-forward" size={17} color={palette.primary} />
                  </View>
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
  page: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 430,
  },
  posterCard: {
    borderRadius: 22,
    minHeight: 222,
    overflow: 'hidden',
    width: 156,
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
    height: 260,
    overflow: 'hidden',
  },
  spotlightOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(34, 24, 19, 0.42)',
  },
});
