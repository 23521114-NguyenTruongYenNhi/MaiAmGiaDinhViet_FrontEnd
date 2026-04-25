import { Ionicons } from '@expo/vector-icons';
import { Image, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { episodes } from '@/data/mock';

export default function EpisodesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-cream">
      <ScrollView className="px-5 pt-4">
        <Text className="text-3xl font-bold text-[#2B2B2B]">Episode Hub</Text>

        <View className="mt-4 flex-row flex-wrap justify-between">
          {episodes.map((item) => (
            <View key={item.id} className="mb-4 w-[48%] rounded-3xl bg-white p-2">
              <View className="relative">
                <Image source={{ uri: item.thumbnail }} className="h-28 w-full rounded-2xl" />
                <View className="absolute inset-0 items-center justify-center">
                  <View className="rounded-full bg-primary/90 p-2">
                    <Ionicons name="play" color="#fff" size={16} />
                  </View>
                </View>
              </View>
              <Text className="mt-2 text-sm font-bold text-[#2B2B2B]">{item.title}</Text>
              <Text className="mt-1 text-xs text-[#7F7269]">{item.duration}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
