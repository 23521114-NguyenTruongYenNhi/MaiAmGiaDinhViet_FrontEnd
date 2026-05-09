import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette } from '@/constants/design';
import { safeBack } from '@/data/navigation';
import { getSession } from '@/data/session';

const items = [
  { label: 'Families', caption: 'Verified support profiles', icon: 'people', route: '/(tabs)/families' as const },
  { label: 'Ask & Find', caption: 'Search families and episodes', icon: 'chatbubbles', route: '/(tabs)/ai-compass' as const },
  { label: 'Episodes', caption: 'Program stories', icon: 'play-circle', route: '/(tabs)/episodes' as const },
  { label: 'News', caption: 'Latest updates', icon: 'newspaper', route: '/(tabs)/news' as const },
  { label: 'Settings', caption: 'Account and preferences', icon: 'settings', route: '/settings' as const },
  { label: 'Admin', caption: 'Management dashboard', icon: 'shield-checkmark', route: '/admin' as const },
];

export default function MenuScreen() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const session = await getSession();

      if (mounted) {
        setIsAdmin(session.user?.role === 'ADMIN');
      }
    }

    void loadSession();

    return () => {
      mounted = false;
    };
  }, []);

  const visibleItems = items.filter((item) => item.route !== '/admin' || isAdmin);

  return (
    <SafeAreaView className="flex-1 bg-[#FAF7F2]" edges={['top', 'bottom']}>
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 28 }}>
        <View style={styles.page}>
          <View className="mt-3 flex-row items-center justify-between">
            <Pressable onPress={() => safeBack('/(tabs)')} className="h-11 w-11 items-center justify-center rounded-full bg-white" style={styles.circle}>
              <Ionicons name="arrow-back" size={20} color={palette.text} />
            </Pressable>
            <Text className="font-beBold text-[26px] text-[#261F1A]">Explore</Text>
            <View className="h-11 w-11" />
          </View>

          <View className="mt-6 flex-row flex-wrap justify-between">
            {visibleItems.map((item) => (
              <Pressable key={item.label} onPress={() => router.push(item.route)} className="mb-3 bg-white p-4" style={styles.tile}>
                <View className="h-11 w-11 items-center justify-center rounded-full bg-[#F3EAE1]">
                  <Ionicons name={item.icon as never} size={21} color={palette.primary} />
                </View>
                <Text className="mt-4 font-beBold text-base text-[#261F1A]">{item.label}</Text>
                <Text className="mt-1 font-beRegular text-xs leading-5 text-[#756B63]">{item.caption}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  tile: {
    borderRadius: 24,
    minHeight: 142,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 2,
  },
});
