import { ImageSourcePropType } from 'react-native';

import { API_BASE_URL, apiRequest } from '@/constants/api';
import { episodes as fallbackEpisodes, families as fallbackFamilies, newsFeed as fallbackNews } from '@/data/mock';

export type BackendEpisode = {
  id: string;
  episode_no: number;
  title: string;
  description?: string | null;
  air_date?: string | null;
  video_url?: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export type BackendFamily = {
  id: string;
  case_id: string;
  family_name: string;
  summary?: string | null;
  display_name?: string | null;
  contact_note?: string | null;
  bank_name?: string | null;
  account_number?: string | null;
  account_name?: string | null;
  bank_verified: boolean;
  created_at: string;
  updated_at: string;
};

export type BackendCase = {
  id: string;
  episode_id: string;
  title: string;
  short_description?: string | null;
  story?: string | null;
  location_text?: string | null;
  status: string;
  thumbnail_url?: string | null;
  priority_level?: string | null;
  support_category?: string | null;
  support_focus?: string | null;
  children_count?: number | null;
  estimated_monthly_need?: string | null;
  verification_status: string;
  verified_at?: string | null;
  created_at: string;
  updated_at: string;
  family?: BackendFamily | null;
};

export type BackendNews = {
  id: string;
  title: string;
  content?: string | null;
  type: string;
  image_url?: string | null;
  published_at?: string | null;
  created_at: string;
};

export type BackendChatResponse = {
  reply: string;
  context_used?: number;
};

export type BackendChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type BackendToken = {
  access_token: string;
  token_type: string;
};

export type BackendUser = {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string | null;
  role: string;
  created_at: string;
  updated_at: string;
};

export type BackendUserAction = {
  id: string;
  user_id: string;
  case_id: string;
  action_type: string;
  note?: string | null;
  created_at: string;
};

export type BackendEpisodeAction = {
  id: string;
  user_id: string;
  episode_id: string;
  action_type: string;
  note?: string | null;
  created_at: string;
};

export type FamilyStory = {
  id: string;
  caseId: string;
  familyId?: string;
  episodeId: string;
  episodeNo: number;
  episodeTitle: string;
  episodeDate?: string | null;
  name: string;
  description: string;
  story: string;
  location: string;
  status: string;
  priorityLevel?: string | null;
  supportCategory?: string | null;
  supportFocus?: string | null;
  childrenCount?: number | null;
  estimatedMonthlyNeed?: string | null;
  verificationStatus: string;
  verifiedAt?: string | null;
  bank?: string | null;
  beneficiary?: string | null;
  accountNumber?: string | null;
  bankVerified: boolean;
  image: ImageSourcePropType;
};

const fallbackImages = [
  require('../assets/images/maiam-family-1.jpg'),
  require('../assets/images/maiam-family-2.jpg'),
  require('../assets/images/maiam-family-3.jpg'),
];

export function imageFromUrl(url: string | null | undefined, index = 0): ImageSourcePropType {
  if (url) {
    return { uri: url };
  }

  return fallbackImages[index % fallbackImages.length];
}

export function imageFromVideoUrl(videoUrl: string | null | undefined, index = 0): ImageSourcePropType {
  const id = videoUrl?.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/i)?.[1];

  if (id) {
    return { uri: `https://img.youtube.com/vi/${id}/hqdefault.jpg` };
  }

  return imageFromUrl(null, index);
}

export function formatDate(value?: string | null) {
  if (!value) {
    return 'No date';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

async function getAllPages<T>(path: string, limit = 100) {
  const rows: T[] = [];
  let offset = 0;

  while (true) {
    const page = await apiRequest<T[]>(`${path}?limit=${limit}&offset=${offset}`);
    rows.push(...page);

    if (page.length < limit) {
      break;
    }

    offset += limit;
  }

  return rows;
}

export async function getBackendEpisodes() {
  try {
    return await getAllPages<BackendEpisode>('/episodes/');
  } catch {
    return fallbackEpisodes.map((episode) => ({
      id: episode.id,
      episode_no: episode.episodeNo,
      title: episode.title,
      description: episode.description,
      air_date: episode.airDate,
      video_url: episode.videoUrl,
      is_featured: episode.isFeatured,
      created_at: episode.airDate,
      updated_at: episode.airDate,
    }));
  }
}

export async function getBackendCases() {
  try {
    return await getAllPages<BackendCase>('/cases/');
  } catch {
    return fallbackFamilies.map((family) => ({
      id: family.caseId,
      episode_id: family.episodeId,
      title: family.name,
      short_description: family.description,
      story: family.story,
      location_text: family.location,
      status: family.status,
      thumbnail_url: null,
      priority_level: null,
      support_category: null,
      support_focus: family.description,
      children_count: null,
      estimated_monthly_need: null,
      verification_status: 'VERIFIED',
      verified_at: family.episodeDate,
      created_at: family.episodeDate,
      updated_at: family.episodeDate,
    }));
  }
}

export async function getBackendFamilies() {
  try {
    return await getAllPages<BackendFamily>('/families/');
  } catch {
    return fallbackFamilies.map((family) => ({
      id: family.id,
      case_id: family.caseId,
      family_name: family.name,
      summary: family.description,
      display_name: family.name,
      contact_note: null,
      bank_name: family.bank,
      account_number: family.accountNumber,
      account_name: family.beneficiary,
      bank_verified: true,
      created_at: family.episodeDate,
      updated_at: family.episodeDate,
    }));
  }
}

export async function getBackendNews() {
    try {
        return await getAllPages<BackendNews>('/news/');
    } catch {
        return fallbackNews.map((item) => ({
            id: item.id,
            title: item.title,
            content: item.body,
            type: item.category,
            image_url:
                'https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1200&auto=format&fit=crop',
            published_at: item.date,
            created_at: item.date,
        }));
    }
}

export async function getBackendNewsDetail(id: string) {
    try {
        return await apiRequest<BackendNews>(`/news/${id}`);
    } catch {
        const item =
            fallbackNews.find((news) => news.id === id) ?? fallbackNews[0];

        return {
            id: item.id,
            title: item.title,
            content: item.body,
            type: item.category,
            image_url:
                'https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1200&auto=format&fit=crop',
            published_at: item.date,
            created_at: item.date,
        };
    }
}

export async function askBackendChatbot(message: string, history: BackendChatMessage[] = []) {
  try {
    return await apiRequest<BackendChatResponse>('/chatbot/', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`${detail} | API: ${API_BASE_URL}/chatbot/`);
  }
}

export async function loginBackend(email: string, password: string) {
  const body = new URLSearchParams();
  body.append('username', email);
  body.append('password', password);

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Login failed with status ${response.status}`);
  }

  return response.json() as Promise<BackendToken>;
}

export async function getBackendMe(token: string) {
  return apiRequest<BackendUser>('/users/me', { token });
}

export async function updateBackendMe(token: string, payload: {
  full_name?: string;
  phone_number?: string | null;
}) {
  return apiRequest<BackendUser>('/users/me', {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload),
  });
}

export async function getBackendUsers(token: string) {
  return apiRequest<BackendUser[]>('/users/?limit=100', { token });
}

export async function updateBackendUserRole(token: string, userId: string, role: 'USER' | 'ADMIN') {
  return apiRequest<BackendUser>(`/users/${userId}/role`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ role }),
  });
}

export async function getBackendUserActions(token: string, actionType?: string) {
  const query = actionType ? `?action_type=${encodeURIComponent(actionType)}` : '';
  return apiRequest<BackendUserAction[]>(`/user-actions/me${query}`, { token });
}

export async function createBackendUserAction(token: string, caseId: string, actionType = 'BOOKMARK') {
  return apiRequest<BackendUserAction>('/user-actions/', {
    method: 'POST',
    token,
    body: JSON.stringify({ case_id: caseId, action_type: actionType }),
  });
}

export async function deleteBackendUserAction(token: string, actionId: string) {
  return apiRequest<void>(`/user-actions/${actionId}`, {
    method: 'DELETE',
    token,
  });
}

export async function getBackendEpisodeActions(token: string, actionType?: string) {
  const query = actionType ? `?action_type=${encodeURIComponent(actionType)}` : '';
  return apiRequest<BackendEpisodeAction[]>(`/episode-actions/me${query}`, { token });
}

export async function createBackendEpisodeAction(token: string, episodeId: string, actionType = 'BOOKMARK') {
  return apiRequest<BackendEpisodeAction>('/episode-actions/', {
    method: 'POST',
    token,
    body: JSON.stringify({ episode_id: episodeId, action_type: actionType }),
  });
}

export async function deleteBackendEpisodeAction(token: string, actionId: string) {
  return apiRequest<void>(`/episode-actions/${actionId}`, {
    method: 'DELETE',
    token,
  });
}

export async function loginWithGoogleBackend(idToken: string) {
  return apiRequest<BackendToken>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ id_token: idToken }),
  });
}

export async function registerBackend(payload: {
  full_name: string;
  email: string;
  password: string;
  phone_number?: string;
}) {
  return apiRequest<BackendUser>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getBackendCaseDetail(id: string) {
  try {
    return await apiRequest<BackendCase>(`/cases/${id}`);
  } catch {
    const family = fallbackFamilies.find((item) => item.caseId === id || item.id === id) ?? fallbackFamilies[0];
    return {
      id: family.caseId,
      episode_id: family.episodeId,
      title: family.name,
      short_description: family.description,
      story: family.story,
      location_text: family.location,
      status: family.status,
      thumbnail_url: null,
      priority_level: null,
      support_category: null,
      support_focus: family.description,
      children_count: null,
      estimated_monthly_need: null,
      verification_status: 'VERIFIED',
      verified_at: family.episodeDate,
      created_at: family.episodeDate,
      updated_at: family.episodeDate,
      family: {
        id: family.id,
        case_id: family.caseId,
        family_name: family.name,
        summary: family.description,
        display_name: family.name,
        contact_note: null,
        bank_name: family.bank,
        account_number: family.accountNumber,
        account_name: family.beneficiary,
        bank_verified: true,
        created_at: family.episodeDate,
        updated_at: family.episodeDate,
      },
    };
  }
}

export function combineFamilyStories(cases: BackendCase[], families: BackendFamily[], episodes: BackendEpisode[]): FamilyStory[] {
  return cases.map((item, index) => {
    const family = families.find((record) => record.case_id === item.id) ?? item.family ?? null;
    const episode = episodes.find((record) => record.id === item.episode_id);

    return {
      id: item.id,
      caseId: item.id,
      familyId: family?.id,
      episodeId: item.episode_id,
      episodeNo: episode?.episode_no ?? index + 1,
      episodeTitle: episode?.title ?? `Episode ${index + 1}`,
      episodeDate: episode?.air_date,
      name: family?.display_name || family?.family_name || item.title,
      description: item.short_description || family?.summary || item.title,
      story: item.story || item.short_description || family?.summary || item.title,
      location: item.location_text || 'Vietnam',
      status: item.status,
      priorityLevel: item.priority_level,
      supportCategory: item.support_category,
      supportFocus: item.support_focus,
      childrenCount: item.children_count,
      estimatedMonthlyNeed: item.estimated_monthly_need,
      verificationStatus: item.verification_status,
      verifiedAt: item.verified_at ?? item.updated_at ?? item.created_at,
      bank: family?.bank_name,
      beneficiary: family?.account_name || family?.family_name,
      accountNumber: family?.account_number,
      bankVerified: family?.bank_verified ?? Boolean(family?.bank_name && family?.account_number),
      image: imageFromUrl(item.thumbnail_url, index),
    };
  });
}
