import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import Animated, { FadeOut, ZoomIn } from 'react-native-reanimated';
import { palette } from '@/constants/design';

export default function Entry() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 1700);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        <Animated.Image
          source={require('../assets/images/logo.webp')}
          style={styles.logo}
          resizeMode="contain"
          entering={ZoomIn.duration(850)}
          exiting={FadeOut.duration(300)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.cream,
  },
  card: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 320,
    height: 132,
    zIndex: 1,
  },
});
