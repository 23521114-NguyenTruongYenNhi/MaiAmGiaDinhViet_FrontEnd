import AsyncStorage from '@react-native-async-storage/async-storage';

import { BackendUser, getBackendMe } from '@/data/backend';
import { isMockAuthToken } from '@/data/dev-auth';

const TOKEN_KEY = 'maiam.auth.token';
const USER_KEY = 'maiam.auth.user';

export async function saveSession(token: string, user: BackendUser) {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, token],
    [USER_KEY, JSON.stringify(user)],
  ]);
}

export async function getSession() {
  const values = await AsyncStorage.multiGet([TOKEN_KEY, USER_KEY]);
  const token = values.find(([key]) => key === TOKEN_KEY)?.[1] ?? null;
  const userJson = values.find(([key]) => key === USER_KEY)?.[1] ?? null;
  const user = userJson ? (JSON.parse(userJson) as BackendUser) : null;

  return { token, user };
}

export async function refreshSessionUser() {
  const { token, user } = await getSession();

  if (!token) {
    return { token: null, user };
  }

  if (isMockAuthToken(token)) {
    return { token, user };
  }

  const freshUser = await getBackendMe(token);
  await saveSession(token, freshUser);
  return { token, user: freshUser };
}

export async function clearSession() {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
}
