import { router, Tabs, usePathname } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Animated, Image, PanResponder, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { palette } from '@/constants/design';

export default function TabLayout() {
  const pathname = usePathname();
  const isAskScreen = pathname.includes('ai-compass');
  const bubbleOpacity = useRef(new Animated.Value(0)).current;
  const bubbleTranslateY = useRef(new Animated.Value(8)).current;
  const bubbleScale = useRef(new Animated.Value(0.96)).current;
  const outlinePulse = useRef(new Animated.Value(0)).current;
  const assistantTranslate = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const assistantOffset = useRef({ x: 0, y: 0 });
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5,
      onPanResponderMove: (_, gesture) => {
        assistantTranslate.setValue({
          x: assistantOffset.current.x + gesture.dx,
          y: assistantOffset.current.y + gesture.dy,
        });
      },
      onPanResponderRelease: (_, gesture) => {
        assistantOffset.current = {
          x: assistantOffset.current.x + gesture.dx,
          y: assistantOffset.current.y + gesture.dy,
        };
      },
      onPanResponderTerminate: (_, gesture) => {
        assistantOffset.current = {
          x: assistantOffset.current.x + gesture.dx,
          y: assistantOffset.current.y + gesture.dy,
        };
      },
    }),
  ).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(bubbleOpacity, {
            duration: 360,
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(bubbleTranslateY, {
            duration: 360,
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.timing(bubbleScale, {
            duration: 360,
            toValue: 1,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(2400),
        Animated.parallel([
          Animated.timing(bubbleOpacity, {
            duration: 420,
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.timing(bubbleTranslateY, {
            duration: 420,
            toValue: 8,
            useNativeDriver: true,
          }),
          Animated.timing(bubbleScale, {
            duration: 420,
            toValue: 0.96,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(2600),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [bubbleOpacity, bubbleScale, bubbleTranslateY]);

  useEffect(() => {
    const outlineAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(outlinePulse, {
          duration: 1400,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(outlinePulse, {
          duration: 1400,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    outlineAnimation.start();
    return () => outlineAnimation.stop();
  }, [outlinePulse]);

  return (
    <View style={styles.root}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: palette.primary,
          tabBarInactiveTintColor: '#9B958E',
          tabBarLabelStyle: {
            fontFamily: 'BeVietnamPro_600SemiBold',
            fontSize: 11,
          },
          tabBarStyle: {
            backgroundColor: palette.white,
            borderTopColor: '#EFE6DD',
            height: 72,
            paddingBottom: 10,
            paddingTop: 8,
          },
          sceneStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <Ionicons size={22} name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="episodes"
          options={{
            title: 'Episodes',
            tabBarIcon: ({ color }) => <Ionicons size={22} name="play-circle" color={color} />,
          }}
        />
        <Tabs.Screen
          name="news"
          options={{
            title: 'News',
            tabBarIcon: ({ color }) => <Ionicons size={22} name="newspaper" color={color} />,
          }}
        />
        <Tabs.Screen
          name="ai-compass"
          options={{
            title: 'Ask',
            tabBarIcon: ({ color }) => <Ionicons size={22} name="chatbubbles" color={color} />,
          }}
        />
        <Tabs.Screen
          name="my-impact"
          options={{
            title: 'Families',
            tabBarIcon: ({ color }) => <Ionicons size={22} name="people" color={color} />,
          }}
        />
      </Tabs>

      {!isAskScreen ? (
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.floatingAssistant,
            {
              transform: assistantTranslate.getTranslateTransform(),
            },
          ]}
          {...panResponder.panHandlers}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              styles.assistantBubble,
              {
                opacity: bubbleOpacity,
                transform: [{ translateY: bubbleTranslateY }, { scale: bubbleScale }],
              },
            ]}
          >
            <Text className="font-beSemiBold text-xs leading-5 text-[#261F1A]" style={styles.bubbleText}>
              Hi there 👋{'\n'}What would you like to explore today?
            </Text>
            <View style={styles.bubbleTail} />
          </Animated.View>

          <Pressable
            accessibilityLabel="Open Ask and Find"
            onPress={() => router.push('/(tabs)/ai-compass')}
            style={styles.assistantButton}
          >
            <Animated.Image
              source={require('../../assets/images/ai-assistant.png')}
              resizeMode="contain"
              style={[
                styles.assistantOutline,
                styles.assistantOutlineWarm,
                {
                  opacity: outlinePulse.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.42, 0.78, 0.42],
                  }),
                  transform: [
                    {
                      scale: outlinePulse.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1.08, 1.18],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Animated.Image
              source={require('../../assets/images/ai-assistant.png')}
              resizeMode="contain"
              style={[
                styles.assistantOutline,
                styles.assistantOutlineGold,
                {
                  opacity: outlinePulse.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.18, 0.5, 0.18],
                  }),
                  transform: [
                    {
                      scale: outlinePulse.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1.18, 1.28],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Image source={require('../../assets/images/ai-assistant.png')} resizeMode="contain" style={styles.assistantImage} />
            <View style={styles.onlineDot} />
          </Pressable>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  assistantImage: {
    height: 72,
    width: 72,
  },
  assistantOutline: {
    height: 72,
    position: 'absolute',
    width: 72,
  },
  assistantOutlineGold: {
    tintColor: '#E5A72D',
  },
  assistantOutlineWarm: {
    tintColor: palette.primary,
  },
  assistantButton: {
    alignItems: 'center',
    height: 78,
    justifyContent: 'center',
    width: 78,
  },
  assistantBubble: {
    backgroundColor: '#fff',
    borderColor: '#EFE6DD',
    borderRadius: 18,
    borderWidth: 1,
    bottom: 58,
    left: 48,
    width: 236,
    paddingHorizontal: 13,
    paddingVertical: 10,
    position: 'absolute',
    shadowColor: '#8B1D1D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: Platform.OS === 'ios' ? 0.12 : 0.08,
    shadowRadius: 16,
    zIndex: 22,
    elevation: 9,
  },
  bubbleText: {
    textAlign: 'left',
  },
  bubbleTail: {
    backgroundColor: '#fff',
    borderBottomColor: '#EFE6DD',
    borderBottomWidth: 1,
    borderRightColor: '#EFE6DD',
    borderRightWidth: 1,
    bottom: -5,
    height: 10,
    left: 18,
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
    width: 10,
  },
  floatingAssistant: {
    alignItems: 'center',
    bottom: 88,
    height: 82,
    justifyContent: 'center',
    left: 12,
    position: 'absolute',
    width: 86,
    zIndex: 20,
  },
  onlineDot: {
    backgroundColor: '#1F8B4C',
    borderColor: '#fff',
    borderRadius: 7,
    borderWidth: 2,
    bottom: 10,
    height: 14,
    position: 'absolute',
    right: 9,
    width: 14,
  },
  root: {
    flex: 1,
  },
});
