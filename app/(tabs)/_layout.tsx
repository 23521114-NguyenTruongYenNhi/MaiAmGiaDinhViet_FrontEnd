import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '@/constants/design';

export default function TabLayout() {
  return (
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
          title: 'Guide',
          tabBarIcon: ({ color }) => <Ionicons size={22} name="compass" color={color} />,
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
  );
}
