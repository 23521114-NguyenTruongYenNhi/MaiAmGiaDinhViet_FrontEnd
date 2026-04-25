import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, FlatList, Pressable, SafeAreaView, Text, TextInput, View } from 'react-native';
import { quickSuggestions } from '@/data/mock';
import { CategoryTag } from '@/components/ui/category-tag';
import { palette } from '@/constants/design';

const initialMessages = [
  { id: '1', role: 'assistant', text: 'Hello! I am AI Compass. How can I support your donation journey today?' },
  { id: '2', role: 'user', text: 'I want to support a family in Quang Nam.' },
  { id: '3', role: 'assistant', text: 'Great choice. I can show verified families and real-time progress updates.' },
] as const;

type Message = (typeof initialMessages)[number];

export default function AICompassScreen() {
  const [input, setInput] = useState('');
  const dotAnim = useRef(new Animated.Value(0.4)).current;
  const messages = useMemo(() => initialMessages, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(dotAnim, {
          toValue: 0.4,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [dotAnim]);

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="px-5 pb-3 pt-4">
        <Text className="font-beBold text-3xl tracking-tight text-[#2B2B2B]">AI Compass</Text>
        <Text className="mt-1 font-beRegular text-sm text-[#7F7269]">Good morning, Sarah.</Text>
      </View>

      <FlatList
        className="flex-1 px-5"
        data={messages}
        keyExtractor={(item) => item.id}
        removeClippedSubviews
        renderItem={({ item: message }: { item: Message }) => (
          <View
            className={`mb-3 max-w-[86%] rounded-2xl border px-4 py-3 ${
              message.role === 'assistant'
                ? 'self-start border-[#E7DED4] bg-white'
                : 'self-end border-[#8B1D1D] bg-primary'
            }`}>
            <Text className={`font-beRegular text-sm leading-6 ${message.role === 'assistant' ? 'text-[#2B2B2B]' : 'text-white'}`}>
              {message.text}
            </Text>
          </View>
        )}
        ListFooterComponent={
          <View>
            <View className="mb-4 flex-row items-center self-start rounded-2xl border border-[#E7DED4] bg-white px-4 py-3">
              <Animated.View style={{ opacity: dotAnim }} className="mr-1 h-2 w-2 rounded-full bg-primary" />
              <Animated.View style={{ opacity: dotAnim }} className="mr-1 h-2 w-2 rounded-full bg-primary" />
              <Animated.View style={{ opacity: dotAnim }} className="h-2 w-2 rounded-full bg-primary" />
              <Text className="ml-2 font-beMedium text-xs text-[#7F7269]">AI is typing...</Text>
            </View>
            <View className="mb-4 mt-2 flex-row flex-wrap gap-2">
              {quickSuggestions.map((item) => (
                <CategoryTag key={item} label={item} />
              ))}
            </View>
          </View>
        }
      />

      <View className="flex-row items-center border-t border-[#EFE6DD] bg-white px-4 py-3">
        <TextInput
          className="mr-2 h-11 flex-1 rounded-2xl bg-[#F7F3EE] px-3 font-beRegular text-sm text-[#2B2B2B]"
          value={input}
          onChangeText={setInput}
          placeholder="How can I help today?"
          placeholderTextColor="#9E978F"
        />
        <Pressable className="h-11 w-11 items-center justify-center rounded-full bg-primary">
          <Ionicons name="send" size={18} color={palette.white} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
