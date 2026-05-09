import { BackendUser } from '@/data/backend';

export const MOCK_AUTH_TOKEN_PREFIX = 'dev-mock-token';

export const isMockAuthEnabled =
  __DEV__ || process.env.EXPO_PUBLIC_ENABLE_MOCK_AUTH === 'true';

export function createMockUser(role: 'USER' | 'ADMIN' = 'USER'): BackendUser {
  const now = new Date().toISOString();
  const isAdmin = role === 'ADMIN';

  return {
    id: isAdmin ? 'dev-admin-user' : 'dev-google-user',
    full_name: isAdmin ? 'Expo Go Admin Tester' : 'Expo Go Test User',
    email: isAdmin ? 'admin.test@maiam.dev' : 'expo.test@maiam.dev',
    phone_number: isAdmin ? '0900000001' : '0900000000',
    role,
    created_at: now,
    updated_at: now,
  };
}

export function createMockAuthToken() {
  return `${MOCK_AUTH_TOKEN_PREFIX}-${Date.now()}`;
}

export function isMockAuthToken(token: string | null | undefined) {
  return Boolean(token?.startsWith(MOCK_AUTH_TOKEN_PREFIX));
}
