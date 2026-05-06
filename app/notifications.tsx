import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette } from '@/constants/design';
import { families, newsFeed } from '@/data/mock';

const alerts = [
  {
    id: 'family',
    title: `${families[0].name} verified`,
    caption: families[0].lastVerified,
    icon: 'shield-checkmark',
    route: `/family/${families[0].id}`,
  },
  {
    id: 'update',
    title: 'New program update',
    caption: newsFeed[0].category,
    icon: 'newspaper',
    route: `/update/${newsFeed[0].id}`,
  },
];

export default function NotificationsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#FAF7F2]" edges={['top', 'bottom']}>
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 28 }}>
        <View style={styles.page}>
          <View className="mt-3 flex-row items-center justify-between">
            <Pressable onPress={() => router.back()} className="h-11 w-11 items-center justify-center rounded-full bg-white" style={styles.circle}>
              <Ionicons name="arrow-back" size={20} color={palette.text} />
            </Pressable>
            <Text className="font-beBold text-[26px] text-[#261F1A]">Alerts</Text>
            <View className="h-11 w-11" />
          </View>

          <View className="mt-6">
            {alerts.map((item) => (
              <Pressable key={item.id} onPress={() => router.push(item.route as never)} className="mb-3 flex-row items-center bg-white p-4" style={styles.card}>
                <View className="h-12 w-12 items-center justify-center rounded-full bg-[#F3EAE1]">
                  <Ionicons name={item.icon as never} size={21} color={palette.primary} />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="font-beSemiBold text-base text-[#261F1A]">{item.title}</Text>
                  <Text className="mt-1 font-beRegular text-sm text-[#756B63]">{item.caption}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={palette.primary} />
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 2,
  },
  circle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  page: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 430,
  },
});
