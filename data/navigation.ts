import { router } from 'expo-router';

export function safeBack(fallback: Parameters<typeof router.replace>[0] = '/(tabs)') {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace(fallback);
}
