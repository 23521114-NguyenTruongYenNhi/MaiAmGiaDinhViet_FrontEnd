import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette } from '@/constants/design';
import {
  BackendEpisode,
  BackendUser,
  combineFamilyStories,
  FamilyStory,
  formatDate,
  getBackendCases,
  getBackendEpisodeActions,
  getBackendEpisodes,
  getBackendFamilies,
  getBackendUserActions,
} from '@/data/backend';
import { safeBack } from '@/data/navigation';
import { clearSession, getSession, refreshSessionUser } from '@/data/session';

const sections = [
  {
    title: 'Account',
    items: [
      { id: 'profile', label: 'Personal information', caption: 'Name, email, phone number', icon: 'person-outline' },
      { id: 'payment', label: 'Donation preferences', caption: 'Preferred bank and giving notes', icon: 'wallet-outline' },
    ],
  },
  {
    title: 'Experience',
    items: [
      { id: 'language', label: 'Language', caption: 'English', icon: 'language-outline' },
      { id: 'privacy', label: 'Privacy & security', caption: 'Profile visibility and login protection', icon: 'lock-closed-outline' },
    ],
  },
];

const NOTIFICATIONS_KEY = 'maiam.settings.notifications';
const WEEKLY_DIGEST_KEY = 'maiam.settings.weeklyDigest';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [weeklyDigestEnabled, setWeeklyDigestEnabled] = useState(false);
  const [selectedItem, setSelectedItem] = useState('Account ready');
  const [user, setUser] = useState<BackendUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [savedFamilies, setSavedFamilies] = useState<FamilyStory[]>([]);
  const [savedEpisodes, setSavedEpisodes] = useState<BackendEpisode[]>([]);
  const initials = (user?.full_name ?? user?.email ?? 'DN')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'DN';

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const [session, cachedSession] = await Promise.all([
          refreshSessionUser(),
          getSession(),
        ]);

        const token = session.token ?? cachedSession.token;

        if (mounted) {
          setUser(session.user);
          setSelectedItem(session.user ? '' : 'No active session');
        }

        if (token) {
          const [episodes, cases, families, savedCaseActions, savedEpisodeActions] = await Promise.all([
            getBackendEpisodes(),
            getBackendCases(),
            getBackendFamilies(),
            getBackendUserActions(token, 'BOOKMARK'),
            getBackendEpisodeActions(token, 'BOOKMARK'),
          ]);
          const stories = combineFamilyStories(cases, families, episodes);
          const savedCaseIds = new Set(savedCaseActions.map((action) => action.case_id));
          const savedEpisodeIds = new Set(savedEpisodeActions.map((action) => action.episode_id));

          if (mounted) {
            setSavedFamilies(stories.filter((story) => savedCaseIds.has(story.caseId)));
            setSavedEpisodes(episodes.filter((episode) => savedEpisodeIds.has(episode.id)));
          }
        }

        const [notificationsValue, weeklyDigestValue] = await AsyncStorage.multiGet([
          NOTIFICATIONS_KEY,
          WEEKLY_DIGEST_KEY,
        ]);

        if (mounted) {
          setNotificationsEnabled(notificationsValue[1] ? notificationsValue[1] === 'true' : true);
          setWeeklyDigestEnabled(weeklyDigestValue[1] === 'true');
        }
      } catch {
        if (mounted) {
          setSelectedItem('Could not refresh account details');
        }
      } finally {
        if (mounted) {
          setLoadingUser(false);
        }
      }
    }

    void loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSignOut = async () => {
    await clearSession();
    router.replace('/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF7F2]" edges={['top', 'bottom']}>
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <View className="mt-3 flex-row items-center justify-between">
            <Pressable onPress={() => safeBack('/(tabs)')} className="h-11 w-11 items-center justify-center rounded-full bg-white" style={styles.circle}>
              <Ionicons name="arrow-back" size={20} color={palette.text} />
            </Pressable>
            <Text className="font-beBold text-[26px] text-[#261F1A]">Settings</Text>
            <View className="h-11 w-11" />
          </View>

          <View className="mt-6 rounded-[28px] bg-white p-5" style={styles.panel}>
            <View className="flex-row items-center">
              <View className="h-14 w-14 items-center justify-center rounded-[22px] bg-primary">
                <Text className="font-beBold text-lg text-white">{initials}</Text>
              </View>
              <View className="ml-4 flex-1">
                <Text className="font-beBold text-xl text-[#261F1A]" numberOfLines={1}>
                  {loadingUser ? 'Loading account...' : user?.full_name ?? 'Guest account'}
                </Text>
                <Text className="mt-1 font-beRegular text-sm text-[#756B63]" numberOfLines={1}>
                  {user?.email ?? 'Sign in to sync your support activity.'}
                </Text>
                <View className="mt-2 flex-row flex-wrap gap-2">
                  {user?.role ? (
                    <View className="rounded-full bg-[#F3EAE1] px-3 py-1">
                      <Text className="font-beBold text-[10px] uppercase text-primary">{user.role}</Text>
                    </View>
                  ) : null}
                  {user?.phone_number ? (
                    <View className="rounded-full bg-[#FAF7F2] px-3 py-1">
                      <Text className="font-beMedium text-[10px] text-[#756B63]">{user.phone_number}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>
          </View>

          <View className="mt-5 rounded-[26px] bg-white p-4" style={styles.panel}>
            <View className="mb-3 flex-row items-center justify-between">
              <View>
                <Text className="font-beBold text-base text-[#261F1A]">Notifications</Text>
                <Text className="mt-1 font-beRegular text-xs text-[#756B63]">Family updates and verification alerts</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={(value) => {
                  setNotificationsEnabled(value);
                  setSelectedItem(value ? 'Notifications enabled' : 'Notifications disabled');
                  void AsyncStorage.setItem(NOTIFICATIONS_KEY, String(value));
                }}
                trackColor={{ false: '#E7DED4', true: '#E9D5D5' }}
                thumbColor={notificationsEnabled ? palette.primary : '#fff'}
              />
            </View>
            <View className="flex-row items-center justify-between border-t border-[#EFE6DD] pt-3">
              <View>
                <Text className="font-beBold text-base text-[#261F1A]">Weekly summary</Text>
                <Text className="mt-1 font-beRegular text-xs text-[#756B63]">A concise update every week</Text>
              </View>
              <Switch
                value={weeklyDigestEnabled}
                onValueChange={(value) => {
                  setWeeklyDigestEnabled(value);
                  setSelectedItem(value ? 'Weekly summary enabled' : 'Weekly summary disabled');
                  void AsyncStorage.setItem(WEEKLY_DIGEST_KEY, String(value));
                }}
                trackColor={{ false: '#E7DED4', true: '#E9D5D5' }}
                thumbColor={weeklyDigestEnabled ? palette.primary : '#fff'}
              />
            </View>
          </View>

          {sections.map((section) => (
            <View key={section.title} className="mt-5 rounded-[26px] bg-white p-4" style={styles.panel}>
              <Text className="mb-3 font-beBold text-lg text-[#261F1A]">{section.title}</Text>
              {section.items.map((item, index) => (
                <Pressable
                  key={item.id}
                  onPress={() => setSelectedItem(`${item.label} opened`)}
                  className="flex-row items-center py-3"
                  style={index !== section.items.length - 1 ? styles.divider : undefined}
                >
                  <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#F3EAE1]">
                    <Ionicons name={item.icon as never} size={20} color={palette.primary} />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="font-beSemiBold text-base text-[#261F1A]">{item.label}</Text>
                    <Text className="mt-1 font-beRegular text-xs leading-5 text-[#756B63]">{item.caption}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={palette.primary} />
                </Pressable>
              ))}
            </View>
          ))}

          <View className="mt-5 rounded-[26px] bg-white p-4" style={styles.panel}>
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="font-beBold text-lg text-[#261F1A]">Saved families</Text>
              <Text className="font-beMedium text-xs uppercase text-[#B7842D]">{savedFamilies.length} saved</Text>
            </View>
            {savedFamilies.length ? savedFamilies.map((family, index) => (
              <Pressable
                key={family.caseId}
                onPress={() => router.push(`/family/${family.caseId}`)}
                className="flex-row items-center py-3"
                style={index !== savedFamilies.length - 1 ? styles.divider : undefined}
              >
                <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#FDECEC]">
                  <Ionicons name="heart" size={19} color={palette.primary} />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="font-beSemiBold text-base text-[#261F1A]">{family.name}</Text>
                  <Text className="mt-1 font-beRegular text-xs leading-5 text-[#756B63]">{family.location} - Episode {family.episodeNo}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={palette.primary} />
              </Pressable>
            )) : (
              <Text className="font-beRegular text-sm leading-6 text-[#756B63]">No saved families yet.</Text>
            )}
          </View>

          <View className="mt-5 rounded-[26px] bg-white p-4" style={styles.panel}>
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="font-beBold text-lg text-[#261F1A]">Saved episodes</Text>
              <Text className="font-beMedium text-xs uppercase text-[#B7842D]">{savedEpisodes.length} saved</Text>
            </View>
            {savedEpisodes.length ? savedEpisodes.map((episode, index) => (
              <Pressable
                key={episode.id}
                onPress={() => router.push('/(tabs)/episodes')}
                className="flex-row items-center py-3"
                style={index !== savedEpisodes.length - 1 ? styles.divider : undefined}
              >
                <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#F3EAE1]">
                  <Ionicons name="play-circle" size={20} color={palette.primary} />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="font-beSemiBold text-base text-[#261F1A]" numberOfLines={1}>{episode.title}</Text>
                  <Text className="mt-1 font-beRegular text-xs leading-5 text-[#756B63]">{formatDate(episode.air_date)} - Episode {episode.episode_no}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={palette.primary} />
              </Pressable>
            )) : (
              <Text className="font-beRegular text-sm leading-6 text-[#756B63]">No saved episodes yet.</Text>
            )}
          </View>

          {selectedItem ? (
            <View className="mt-5 rounded-[22px] bg-[#F3EAE1] px-4 py-3">
              <Text className="font-beSemiBold text-sm text-primary">{selectedItem}</Text>
            </View>
          ) : null}

          <Pressable onPress={handleSignOut} className="mt-5 rounded-[22px] border border-[#E4D2C8] bg-white px-4 py-4">
            <Text className="text-center font-beBold text-primary">Sign out</Text>
          </Pressable>
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
  divider: {
    borderBottomColor: '#EFE6DD',
    borderBottomWidth: 1,
  },
  page: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 430,
  },
  panel: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
});
