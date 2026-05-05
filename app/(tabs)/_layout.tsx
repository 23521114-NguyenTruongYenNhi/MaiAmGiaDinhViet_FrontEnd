import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '@/constants/design';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: palette.primary,
                tabBarInactiveTintColor: '#9B958E',
                headerStyle: { backgroundColor: palette.cream },
                headerTitleStyle: { color: palette.text, fontFamily: 'BeVietnamPro_700Bold' },
                tabBarStyle: {
                    backgroundColor: palette.white,
                    borderTopColor: '#EFE6DD',
                    height: 68,
                    paddingBottom: 10,
                    paddingTop: 8,
                },
                // --- ĐÂY LÀ DÒNG THÊM MỚI ĐỂ FIX LỖI NHÁY TRẮNG MÀN HÌNH ---
                sceneContainerStyle: { backgroundColor: 'transparent' },
            }}>

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
                    title: 'AI Compass',
                    tabBarIcon: ({ color }) => <Ionicons size={22} name="chatbubbles" color={color} />,
                }}
            />
            <Tabs.Screen
                name="my-impact"
                options={{
                    title: 'My Impact',
                    tabBarIcon: ({ color }) => <Ionicons size={22} name="heart" color={color} />,
                }}
            />
        </Tabs>
    );
}