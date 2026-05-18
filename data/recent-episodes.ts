import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_EPISODES_KEY = 'maiam.recentEpisodes';
const MAX_RECENT_EPISODES = 8;

type RecentEpisodeRecord = {
  id: string;
  openedAt: string;
};

async function getRecentEpisodeRecords() {
  const raw = await AsyncStorage.getItem(RECENT_EPISODES_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as RecentEpisodeRecord[];
    return Array.isArray(parsed)
      ? parsed.filter((item) => typeof item?.id === 'string' && item.id.length)
      : [];
  } catch {
    return [];
  }
}

export async function getRecentlyViewedEpisodeIds() {
  const records = await getRecentEpisodeRecords();
  return records.map((item) => item.id);
}

export async function saveRecentlyViewedEpisode(episodeId: string) {
  const records = await getRecentEpisodeRecords();
  const next = [
    { id: episodeId, openedAt: new Date().toISOString() },
    ...records.filter((item) => item.id !== episodeId),
  ].slice(0, MAX_RECENT_EPISODES);

  await AsyncStorage.setItem(RECENT_EPISODES_KEY, JSON.stringify(next));
}
