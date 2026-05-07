import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette } from '@/constants/design';
import { episodes, families } from '@/data/mock';

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

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [weeklyDigestEnabled, setWeeklyDigestEnabled] = useState(false);
  const [selectedItem, setSelectedItem] = useState('Personal information updated');
  const favoriteFamilies = families.slice(0, 2);
  const favoriteEpisodes = episodes.slice(0, 2);
  const donationHistory = [
    { id: 'don-1', family: families[0].name, amount: '$45', date: 'May 4, 2026', status: 'Completed' },
    { id: 'don-2', family: families[2].name, amount: '$30', date: 'May 1, 2026', status: 'Completed' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#FAF7F2]" edges={['top', 'bottom']}>
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <View className="mt-3 flex-row items-center justify-between">
            <Pressable onPress={() => router.back()} className="h-11 w-11 items-center justify-center rounded-full bg-white" style={styles.circle}>
              <Ionicons name="arrow-back" size={20} color={palette.text} />
            </Pressable>
            <Text className="font-beBold text-[26px] text-[#261F1A]">Settings</Text>
            <View className="h-11 w-11" />
          </View>

          <View className="mt-6 rounded-[28px] bg-white p-5" style={styles.panel}>
            <View className="flex-row items-center">
              <View className="h-14 w-14 items-center justify-center rounded-[22px] bg-primary">
                <Text className="font-beBold text-lg text-white">DN</Text>
              </View>
              <View className="ml-4 flex-1">
                <Text className="font-beBold text-xl text-[#261F1A]">Donor account</Text>
                <Text className="mt-1 font-beRegular text-sm text-[#756B63]">Manage your support activity and preferences.</Text>
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
                }}
                trackColor={{ false: '#E7DED4', true: '#E9D5D5' }}
                thumbColor={notificationsEnabled ? palette.primary : '#fff'}
              />
            </View>
            <View className="flex-row items-center justify-between border-t border-[#EFE6DD] pt-3">
              <View>
                <Text className="font-beBold text-base text-[#261F1A]">Weekly summary</Text>
                <Text className="mt-1 font-beRegular text-xs text-[#756B63]">A concise report every week</Text>
              </View>
              <Switch
                value={weeklyDigestEnabled}
                onValueChange={(value) => {
                  setWeeklyDigestEnabled(value);
                  setSelectedItem(value ? 'Weekly summary enabled' : 'Weekly summary disabled');
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
              <Text className="font-beMedium text-xs uppercase text-[#B7842D]">{favoriteFamilies.length} saved</Text>
            </View>
            {favoriteFamilies.map((family, index) => (
              <Pressable
                key={family.id}
                onPress={() => router.push(`/family/${family.id}`)}
                className="flex-row items-center py-3"
                style={index !== favoriteFamilies.length - 1 ? styles.divider : undefined}
              >
                <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#FDECEC]">
                  <Ionicons name="heart" size={19} color={palette.primary} />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="font-beSemiBold text-base text-[#261F1A]">{family.name}</Text>
                  <Text className="mt-1 font-beRegular text-xs leading-5 text-[#756B63]">{family.location} - {family.supportFocus}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={palette.primary} />
              </Pressable>
            ))}
          </View>

          <View className="mt-5 rounded-[26px] bg-white p-4" style={styles.panel}>
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="font-beBold text-lg text-[#261F1A]">Saved episodes</Text>
              <Text className="font-beMedium text-xs uppercase text-[#B7842D]">{favoriteEpisodes.length} saved</Text>
            </View>
            {favoriteEpisodes.map((episode, index) => (
              <Pressable
                key={episode.id}
                onPress={() => router.push('/(tabs)/episodes')}
                className="flex-row items-center py-3"
                style={index !== favoriteEpisodes.length - 1 ? styles.divider : undefined}
              >
                <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#F3EAE1]">
                  <Ionicons name="play-circle" size={20} color={palette.primary} />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="font-beSemiBold text-base text-[#261F1A]" numberOfLines={1}>{episode.title}</Text>
                  <Text className="mt-1 font-beRegular text-xs leading-5 text-[#756B63]">{episode.host} - {episode.duration}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={palette.primary} />
              </Pressable>
            ))}
          </View>

          <View className="mt-5 rounded-[26px] bg-white p-4" style={styles.panel}>
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="font-beBold text-lg text-[#261F1A]">Donation history</Text>
              <Text className="font-beMedium text-xs uppercase text-[#B7842D]">Receipts</Text>
            </View>
            {donationHistory.map((donation, index) => (
              <Pressable
                key={donation.id}
                onPress={() => setSelectedItem(`${donation.amount} receipt for ${donation.family}`)}
                className="flex-row items-center py-3"
                style={index !== donationHistory.length - 1 ? styles.divider : undefined}
              >
                <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#E9F8EE]">
                  <Ionicons name="receipt-outline" size={20} color={palette.success} />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="font-beSemiBold text-base text-[#261F1A]">{donation.family}</Text>
                  <Text className="mt-1 font-beRegular text-xs leading-5 text-[#756B63]">{donation.date} - {donation.status}</Text>
                </View>
                <Text className="font-beBold text-sm text-primary">{donation.amount}</Text>
              </Pressable>
            ))}
          </View>

          <View className="mt-5 rounded-[22px] bg-[#F3EAE1] px-4 py-3">
            <Text className="font-beSemiBold text-sm text-primary">{selectedItem}</Text>
          </View>

          <Pressable onPress={() => router.replace('/login')} className="mt-5 rounded-[22px] border border-[#E4D2C8] bg-white px-4 py-4">
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
